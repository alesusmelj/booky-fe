import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as ScreenOrientation from 'expo-screen-orientation';
import { DeviceMotion } from 'expo-sensors';

export interface PanoramaViewerProps {
  uri: string;
  onClose?: () => void;
}

// ------------------------ math ------------------------
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const normalizePi = (v: number) => {
  const twoPi = Math.PI * 2;
  return ((v + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
};
const radToDeg = (r: number) => (r * 180) / Math.PI;

// shortest angular difference (target - current) in [-pi, pi]
const angleDiff = (target: number, current: number) => normalizePi(target - current);

// EMA for angles (yaw): move by shortest path
const emaAngle = (prev: number, target: number, alpha: number) => normalizePi(prev + angleDiff(target, prev) * alpha);
// EMA for linear values (pitch)
const ema = (prev: number, target: number, alpha: number) => prev + (target - prev) * alpha;

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ uri, onClose }) => {
  const webRef = useRef<WebView>(null);

  const [pannellumJs, setPannellumJs] = useState<string | null>(null);
  const [pannellumCss, setPannellumCss] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [webReady, setWebReady] = useState(false);
  const [webHasSetPose, setWebHasSetPose] = useState<boolean | null>(null);
  const [lastWebMsg, setLastWebMsg] = useState<string>('');

  // ====== tuning (lo que te dejó funcionando) ======
  const INVERT_YAW = true;
  const INVERT_PITCH = true;

  // Ganancia (si está lento, subí un poco, ej 2.8 / 2.6)
  const GAIN_YAW = 2.3;
  const GAIN_PITCH = 2.1;

  // Suavizado (más alto = más suave, menos respuesta)
  // 0.12–0.22 suele ir ideal en Samsung
  const EMA_ALPHA = 0.05;

  // Límite pitch
  const PITCH_LIMIT = Math.PI / 2 - 0.06;

  // Envío a WebView: 25-30 fps (postMessage aguanta bien)
  const SEND_FPS = 60;
  const SEND_MS = Math.round(1000 / SEND_FPS);

  // Deadzone para evitar micro spam
  const DEADZONE_RAD = 0.0018; // ~0.10°

  // ====== pose target + filtered ======
  const yawTargetRef = useRef(0);
  const pitchTargetRef = useRef(0);
  const yawFilteredRef = useRef(0);
  const pitchFilteredRef = useRef(0);

  // ====== calibration ======
  const calibratingRef = useRef(true);
  const calStartRef = useRef(Date.now());
  const yaw0Ref = useRef(0);
  const pitch0Ref = useRef(0);

  // ====== stats ======
  const dmCountRef = useRef(0);
  const dmT0Ref = useRef(Date.now());
  const sendCountRef = useRef(0);
  const sendT0Ref = useRef(Date.now());

  // ============================================================
  // LANDSCAPE (pantalla solo horizontal)
  // ============================================================
  useEffect(() => {
    (async () => {
      try {
        console.log('[PANORAMA] lock landscape');
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (e) {
        console.log('[PANORAMA] lock landscape error', String((e as any)?.message ?? e));
      }
    })();

    return () => {
      (async () => {
        try {
          console.log('[PANORAMA] restore portrait');
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          await ScreenOrientation.unlockAsync();
        } catch {}
      })();
    };
  }, []);

  // ============================================================
  // Load pannellum assets
  // ============================================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[PANORAMA] loading pannellum assets');
        const jsAsset = Asset.fromModule(require('../../assets/web/pannellum.js.txt'));
        const cssAsset = Asset.fromModule(require('../../assets/web/pannellum.css.txt'));
        await Promise.all([jsAsset.downloadAsync(), cssAsset.downloadAsync()]);

        const jsCode = await FileSystem.readAsStringAsync(jsAsset.localUri ?? jsAsset.uri);
        const cssCode = await FileSystem.readAsStringAsync(cssAsset.localUri ?? cssAsset.uri);

        if (!mounted) return;
        setPannellumJs(jsCode);
        setPannellumCss(cssCode);
        console.log('[PANORAMA] pannellum assets loaded');
      } catch (e: any) {
        console.error('[PANORAMA] ❌ Error loading pannellum assets', e);
        if (mounted) setLoadError(String(e?.message ?? e));
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // Probe: confirm __setPose / ready (WebView)
  // ============================================================
  useEffect(() => {
    const t = setInterval(() => {
      webRef.current?.injectJavaScript(`
        (function(){
          try {
            var has = typeof window.__setPose === 'function';
            var ready = !!window.__panoReady;
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'probe',
              hasSetPose: has,
              ready: ready
            }));
          } catch(e) {}
        })();
        true;
      `);
    }, 900);

    return () => clearInterval(t);
  }, []);

  // ============================================================
  // WebView onMessage
  // ============================================================
  const onWebMessage = (evt: any) => {
    const raw = evt.nativeEvent.data;
    setLastWebMsg(raw);

    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'ready') setWebReady(true);
      if (msg.type === 'probe') {
        setWebHasSetPose(!!msg.hasSetPose);
        if (msg.ready) setWebReady(true);
      }
      if (msg.type === 'fatal') setLoadError(`Web fatal: ${msg.message}`);
      if (msg.type === 'img_error') setLoadError(`Imagen: ${msg.message}`);
    } catch {
      // ignore
    }
  };

  // ============================================================
  // DeviceMotion → target pose
  // ============================================================
  useEffect(() => {
    if (!webReady) {
      console.log('[PANORAMA] motion waiting for webReady...');
      return;
    }

    let motionSub: any = null;

    // reset state
    yawTargetRef.current = 0;
    pitchTargetRef.current = 0;
    yawFilteredRef.current = 0;
    pitchFilteredRef.current = 0;

    calibratingRef.current = true;
    calStartRef.current = Date.now();
    yaw0Ref.current = 0;
    pitch0Ref.current = 0;

    dmCountRef.current = 0;
    dmT0Ref.current = Date.now();

    console.log('[PANORAMA] DeviceMotion start (landscape mapping)');

    const applyInvert = (yaw: number, pitch: number) => {
      let y = yaw;
      let p = pitch;
      if (INVERT_YAW) y = -y;
      if (INVERT_PITCH) p = -p;
      return { y, p };
    };

    const updateTarget = (rawYaw: number, rawPitch: number) => {
      const now = Date.now();

      if (calibratingRef.current) {
        if (now - calStartRef.current < 700) {
          yaw0Ref.current = rawYaw;
          pitch0Ref.current = rawPitch;
        } else {
          calibratingRef.current = false;
          console.log('[PANORAMA] calibration done');
        }
      }

      // delta from calibration
      let yawDelta = normalizePi(rawYaw - yaw0Ref.current);
      let pitchDelta = rawPitch - pitch0Ref.current;

      // gain
      yawDelta = normalizePi(yawDelta * GAIN_YAW);
      pitchDelta = pitchDelta * GAIN_PITCH;

      yawTargetRef.current = normalizePi(yawDelta);
      pitchTargetRef.current = clamp(pitchDelta, -PITCH_LIMIT, PITCH_LIMIT);
    };

    (async () => {
      const ok = await DeviceMotion.isAvailableAsync();
      console.log('[PANORAMA] DeviceMotion available:', ok);
      if (!ok) {
        setLoadError('DeviceMotion no disponible en este dispositivo');
        return;
      }

      // 60Hz aprox
      DeviceMotion.setUpdateInterval(16);

      motionSub = DeviceMotion.addListener((data) => {
        dmCountRef.current += 1;

        const r = (data as any)?.rotation;
        if (!r) return;

        // ✅ Landscape: yaw desde alpha, pitch desde roll (gamma)
        // Esta es la clave para que “acostado” funcione coherente.
        let yaw = r.alpha ?? 0;
        const roll = r.gamma ?? 0;

        // Ajuste landscape (como venías usando)
        yaw = normalizePi(yaw - Math.PI / 2);
        const pitch = roll;

        const inv = applyInvert(yaw, pitch);
        updateTarget(inv.y, inv.p);

        const now = Date.now();
        if (now - dmT0Ref.current >= 1000) {
          const hz = dmCountRef.current / ((now - dmT0Ref.current) / 1000);
          dmCountRef.current = 0;
          dmT0Ref.current = now;
          console.log(
            `[PANORAMA][DM 1s] hz=${hz.toFixed(0)} target(deg)=(${radToDeg(yawTargetRef.current).toFixed(
              0
            )},${radToDeg(pitchTargetRef.current).toFixed(0)}) cal=${calibratingRef.current}`
          );
        }
      });
    })();

    return () => {
      console.log('[PANORAMA] DeviceMotion stop');
      if (motionSub) motionSub.remove();
    };
  }, [webReady]);

  // ============================================================
  // Sender loop: postMessage (NO injectJavaScript por frame)
  // ============================================================
  useEffect(() => {
    if (!webReady) {
      console.log('[PANORAMA] sender waiting for webReady...');
      return;
    }

    let sendTimer: any = null;

    sendCountRef.current = 0;
    sendT0Ref.current = Date.now();

    console.log('[PANORAMA] sender loop started', SEND_FPS, 'fps (postMessage)');

    sendTimer = setInterval(() => {
      if (!webHasSetPose) return;

      const yT = yawTargetRef.current;
      const pT = pitchTargetRef.current;

      // ✅ yaw sin saltos (shortest path)
      const yF = emaAngle(yawFilteredRef.current, yT, EMA_ALPHA);
      const pF = ema(pitchFilteredRef.current, pT, EMA_ALPHA);

      const dy = Math.abs(angleDiff(yF, yawFilteredRef.current));
      const dp = Math.abs(pF - pitchFilteredRef.current);

      yawFilteredRef.current = yF;
      pitchFilteredRef.current = pF;

      if (dy < DEADZONE_RAD && dp < DEADZONE_RAD) return;

      // ✅ más fluido que injectJavaScript
      webRef.current?.postMessage(
        JSON.stringify({
          type: 'pose',
          yaw: yF,
          pitch: pF,
        })
      );

      sendCountRef.current += 1;
      const now = Date.now();
      if (now - sendT0Ref.current >= 1000) {
        console.log(
          `[PANORAMA][SEND 1s] fps=${sendCountRef.current} filtered(deg)=(${radToDeg(
            yawFilteredRef.current
          ).toFixed(0)},${radToDeg(pitchFilteredRef.current).toFixed(0)})`
        );
        sendCountRef.current = 0;
        sendT0Ref.current = now;
      }
    }, SEND_MS);

    return () => {
      console.log('[PANORAMA] sender loop stop');
      if (sendTimer) clearInterval(sendTimer);
    };
  }, [webReady, webHasSetPose]);

  // ============================================================
  // HTML
  // ============================================================
  const html = useMemo(() => {
    if (!pannellumJs || !pannellumCss || !uri) return '';

    const safeUri = uri.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
<style>
html, body { margin:0; padding:0; width:100%; height:100%; background:black; overflow:hidden; }
#viewer { width:100%; height:100%; }
#loading {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  color:white; font-family:sans-serif; font-size:14px;
  background: rgba(0,0,0,0.25);
  z-index: 9999;
  pointer-events:none;
}
${pannellumCss}
</style>
</head>
<body>
<div id="viewer"></div>
<div id="loading">Cargando imagen 360°…</div>

<script>
${pannellumJs}

(function(){
  function __post(obj){
    try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch(e){}
  }
  function radToDeg(r){ return r * 180 / Math.PI; }

  window.__panoReady = false;
  var v = null;

  // buffer de última pose (para no spamear lookAt con colas)
  var lastYaw = 0;
  var lastPitch = 0;
  var hasPose = false;

  window.__setPose = function(yawRad, pitchRad){
    if (!v) return;
    var yawDeg = radToDeg(yawRad);
    var pitchDeg = radToDeg(pitchRad);

    // ✅ speed > 0 para suavidad en pannellum
    var SPEED = 0.22;

    try { v.lookAt(pitchDeg, yawDeg, v.getHfov(), SPEED); }
    catch(e) {
      try { v.setYaw(yawDeg); } catch(_){}
      try { v.setPitch(pitchDeg); } catch(_){}
    }
  };

  // RN -> WebView messages (postMessage)
  function handleMsg(data){
    try {
      var msg = JSON.parse(data);
      if (msg && msg.type === 'pose') {
        lastYaw = msg.yaw;
        lastPitch = msg.pitch;
        hasPose = true;
        if (window.__panoReady) window.__setPose(lastYaw, lastPitch);
      }
    } catch(e){}
  }

  // Android/iOS compat
  document.addEventListener('message', function(e){ handleMsg(e.data); });
  window.addEventListener('message', function(e){ handleMsg(e.data); });

  function setReady(reason){
    if (window.__panoReady) return;
    window.__panoReady = true;
    var el = document.getElementById('loading');
    if (el) el.style.display = 'none';
    __post({ type:'ready', reason: reason });

    if (hasPose) window.__setPose(lastYaw, lastPitch);
  }

  // preload imagen
  var img = new Image();
  img.onload = function(){
    try {
      v = pannellum.viewer('viewer', {
        type: 'equirectangular',
        panorama: '${safeUri}',
        autoLoad: true,
        showControls: false,
        mouseZoom: true,
        keyboardZoom: false,
        hfov: 100,
      });

      var tries=0;
      var t=setInterval(function(){
        tries++;
        try {
          if (v && typeof v.getYaw === 'function') {
            v.getYaw();
            clearInterval(t);
            setReady('viewer_ready_probe');
          }
        } catch(e) {}
        if (tries >= 30) {
          clearInterval(t);
          setReady('timeout_force_ready');
        }
      }, 100);

      setTimeout(function(){ setReady('fallback_timeout'); }, 1500);

    } catch(e) {
      __post({ type:'fatal', message: 'pannellum init: ' + String(e) });
    }
  };
  img.onerror = function(){
    __post({ type:'img_error', message:'No se pudo cargar la imagen' });
  };
  img.src = '${safeUri}';
})();
</script>
</body>
</html>`;
  }, [pannellumJs, pannellumCss, uri]);

  // ============================================================
  // UI
  // ============================================================
  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ {loadError}</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!pannellumJs || !pannellumCss || !html) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>Cargando visor 360°…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={StyleSheet.absoluteFill}
        onMessage={onWebMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mixedContentMode="always"
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
      />

      {/* Debug overlay */}
      <View style={styles.debug}>
        <Text style={styles.debugText}>webReady: {String(webReady)}</Text>
        <Text style={styles.debugText}>has __setPose: {String(webHasSetPose)}</Text>
        <Text style={styles.debugText}>invert yaw/pitch: {String(INVERT_YAW)}/{String(INVERT_PITCH)}</Text>
        <Text style={styles.debugText}>gain yaw/pitch: {GAIN_YAW}/{GAIN_PITCH}</Text>
        <Text style={styles.debugText}>ema: {EMA_ALPHA} sendFPS: {SEND_FPS}</Text>
        <Text style={styles.debugText}>last msg: {lastWebMsg?.slice(0, 120)}</Text>
      </View>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black' },
  center: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: { color: '#fff', marginTop: 12, textAlign: 'center' },
  errorText: { color: '#ff6b6b', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  closeButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  closeText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  debug: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 60,
  },
  debugText: { color: '#fff', fontSize: 12 },
});
