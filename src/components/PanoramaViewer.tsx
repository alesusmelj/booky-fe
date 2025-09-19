import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { DeviceMotion } from 'expo-sensors';
import { ThreeJSViewer } from './ThreeJSViewer';

export interface PanoramaViewerProps {
  imageSource: {
    uri?: string;
    base64?: string;
  };
  useGyro?: boolean;
  initialYaw?: number;   // degrees
  initialPitch?: number; // degrees
  fallbackToThreeJS?: boolean;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  imageSource,
  useGyro = true,
  initialYaw = 0,
  initialPitch = 0,
  fallbackToThreeJS = false,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [useThreeJS, setUseThreeJS] = useState(fallbackToThreeJS);
  const [webViewError, setWebViewError] = useState(false);

  // Load HTML asset
  useEffect(() => {
    loadHtmlAsset();
  }, []);

  // Send initial data when WebView is ready
  useEffect(() => {
    if (isWebViewReady && !useThreeJS && (imageSource.uri || imageSource.base64)) {
      sendMessageToWebView({
        type: 'INIT',
        imageUrl: imageSource.uri,
        imageBase64: imageSource.base64,
        useGyro,
        initialYaw,
        initialPitch,
      });
    }
  }, [isWebViewReady, imageSource, useGyro, initialYaw, initialPitch, useThreeJS]);

  // Update gyroscope setting
  useEffect(() => {
    if (isWebViewReady && !useThreeJS) {
      sendMessageToWebView({
        type: 'UPDATE_GYRO',
        enabled: useGyro,
      });
    }
  }, [useGyro, isWebViewReady, useThreeJS]);

  const loadHtmlAsset = async () => {
    try {
      // Create HTML content directly to avoid file system API issues
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>360° Panorama Viewer</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.7.4/index.min.css">
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; z-index: 1000; }
        #error { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ff6b6b; text-align: center; z-index: 1000; padding: 20px; }
        #gyro-permission { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 1001; display: none; }
        #viewer { width: 100vw; height: 100vh; }
        #controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 100; }
        .control-btn { background: rgba(255,255,255,0.9); border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 14px; }
        .control-btn:hover { background: rgba(255,255,255,1); }
        .control-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    </style>
</head>
<body>
    <div id="loading">Cargando visor 360°...</div>
    <div id="error" style="display: none;">
        <h3>Error al cargar el visor</h3>
        <p>No se pudo inicializar el visor 360°</p>
    </div>
    <div id="gyro-permission">
        <h3>Permisos de Giroscopio</h3>
        <p>Para usar el control por movimiento, necesitamos acceso al giroscopio de tu dispositivo.</p>
        <button onclick="window.panoramaViewer.requestGyroPermission()" class="control-btn">Permitir Giroscopio</button>
        <button onclick="document.getElementById('gyro-permission').style.display='none'" class="control-btn">Cancelar</button>
    </div>
    <div id="viewer"></div>
    <div id="controls">
        <button id="centerBtn" class="control-btn" onclick="window.panoramaViewer.centerView()">Centrar Vista</button>
        <button id="gyroBtn" class="control-btn" onclick="window.panoramaViewer.toggleGyroscope()">Giroscopio OFF</button>
        <button id="zoomInBtn" class="control-btn" onclick="window.panoramaViewer.zoomIn()">Zoom +</button>
        <button id="zoomOutBtn" class="control-btn" onclick="window.panoramaViewer.zoomOut()">Zoom -</button>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.7.4/index.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/gyroscope-plugin@5.7.4/index.min.js"></script>

    <script>
        class PanoramaViewer {
            constructor() {
                this.viewer = null;
                this.gyroscopePlugin = null;
                this.isGyroscopeEnabled = false;
                this.hasGyroscopeSupport = false;
                this.setupMessageListener();
                this.checkGyroscopeAvailability();
            }

            setupMessageListener() {
                window.addEventListener('message', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });
            }

            handleMessage(data) {
                switch (data.type) {
                    case 'INIT':
                        this.initViewer(data);
                        break;
                    case 'UPDATE_GYRO':
                        this.setGyroscopeEnabled(data.enabled);
                        break;
                    case 'UPDATE_IMAGE':
                        this.updateImage(data.imageSource);
                        break;
                }
            }

            async checkGyroscopeAvailability() {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    this.hasGyroscopeSupport = true;
                } else if (window.DeviceOrientationEvent) {
                    this.hasGyroscopeSupport = true;
                }
            }

            async requestGyroPermission() {
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    try {
                        const permission = await DeviceOrientationEvent.requestPermission();
                        if (permission === 'granted') {
                            document.getElementById('gyro-permission').style.display = 'none';
                            this.setGyroscopeEnabled(true);
                        }
                    } catch (error) {
                        console.error('Error requesting gyroscope permission:', error);
                    }
                } else {
                    document.getElementById('gyro-permission').style.display = 'none';
                    this.setGyroscopeEnabled(true);
                }
            }

            initViewer(data) {
                try {
                    this.hideLoading();
                    this.hideError();

                    const imageSource = data.imageSource.uri || \`data:image/jpeg;base64,\${data.imageSource.base64}\`;

                    const config = {
                        container: document.getElementById('viewer'),
                        panorama: imageSource,
                        navbar: false,
                        mousewheel: true,
                        touchmoveTwoFingers: true,
                        defaultYaw: data.initialYaw || 0,
                        defaultPitch: data.initialPitch || 0,
                        minFov: 30,
                        maxFov: 90,
                        plugins: []
                    };

                    if (this.hasGyroscopeSupport) {
                        this.gyroscopePlugin = new PhotoSphereViewer.GyroscopePlugin();
                        config.plugins.push(this.gyroscopePlugin);
                    }

                    this.viewer = new PhotoSphereViewer.Viewer(config);

                    this.viewer.addEventListener('ready', () => {
                        console.log('Panorama viewer ready');
                        if (data.useGyro && this.hasGyroscopeSupport) {
                            this.setGyroscopeEnabled(true);
                        }
                    });

                    this.viewer.addEventListener('error', (error) => {
                        console.error('Panorama viewer error:', error);
                        this.showError('Error al cargar la imagen panorámica');
                    });

                } catch (error) {
                    console.error('Error initializing viewer:', error);
                    this.showError('Error al inicializar el visor');
                }
            }

            updateImage(imageSource) {
                if (this.viewer) {
                    const newImageSource = imageSource.uri || \`data:image/jpeg;base64,\${imageSource.base64}\`;
                    this.viewer.setPanorama(newImageSource);
                }
            }

            toggleGyroscope() {
                this.setGyroscopeEnabled(!this.isGyroscopeEnabled);
            }

            setGyroscopeEnabled(enabled) {
                if (!this.hasGyroscopeSupport || !this.gyroscopePlugin) {
                    return;
                }

                if (enabled && !this.isGyroscopeEnabled) {
                    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                        document.getElementById('gyro-permission').style.display = 'block';
                        return;
                    }
                    this.gyroscopePlugin.start();
                    this.isGyroscopeEnabled = true;
                } else if (!enabled && this.isGyroscopeEnabled) {
                    this.gyroscopePlugin.stop();
                    this.isGyroscopeEnabled = false;
                }

                this.updateGyroButton();
            }

            centerView() {
                if (this.viewer) {
                    this.viewer.animate({ yaw: 0, pitch: 0 });
                }
            }

            zoomIn() {
                if (this.viewer) {
                    const currentZoom = this.viewer.getZoomLevel();
                    this.viewer.zoom(Math.min(currentZoom + 10, 100));
                }
            }

            zoomOut() {
                if (this.viewer) {
                    const currentZoom = this.viewer.getZoomLevel();
                    this.viewer.zoom(Math.max(currentZoom - 10, 0));
                }
            }

            updateGyroButton() {
                const btn = document.getElementById('gyroBtn');
                if (btn) {
                    btn.textContent = this.isGyroscopeEnabled ? 'Giroscopio ON' : 'Giroscopio OFF';
                    btn.style.backgroundColor = this.isGyroscopeEnabled ? '#4CAF50' : 'rgba(255,255,255,0.9)';
                    btn.style.color = this.isGyroscopeEnabled ? 'white' : 'black';
                }
            }

            showLoading() {
                document.getElementById('loading').style.display = 'block';
            }

            hideLoading() {
                document.getElementById('loading').style.display = 'none';
            }

            showError(message) {
                const errorDiv = document.getElementById('error');
                errorDiv.querySelector('p').textContent = message;
                errorDiv.style.display = 'block';
                this.hideLoading();
            }

            hideError() {
                document.getElementById('error').style.display = 'none';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            window.panoramaViewer = new PanoramaViewer();
        });
    </script>
</body>
</html>`;
      
      // Use data URI directly to avoid filesystem API issues completely
      const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      setHtmlUri(dataUri);
    } catch (error) {
      console.error('Error creating HTML file:', error);
      setUseThreeJS(true); // Fallback to Three.js
    }
  };

  const sendMessageToWebView = (message: any) => {
    if (webViewRef.current && !useThreeJS) {
      const script = `
        if (window.panoramaViewer) {
          window.panoramaViewer.handleMessage(${JSON.stringify(message)});
        } else {
          window.postMessage(${JSON.stringify(message)}, '*');
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handleWebViewLoad = () => {
    console.log('WebView loaded');
    setIsWebViewReady(true);
    setWebViewError(false);
  };

  const handleWebViewError = (error: any) => {
    console.error('WebView error:', error);
    setWebViewError(true);
    
    // Fallback to Three.js after WebView error
    Alert.alert(
      'Error de WebView',
      'Cambiando a modo de compatibilidad...',
      [{ text: 'OK', onPress: () => setUseThreeJS(true) }]
    );
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      // Handle messages from WebView if needed
      switch (data.type) {
        case 'ERROR':
          console.error('WebView reported error:', data.message);
          break;
        case 'READY':
          console.log('WebView panorama viewer ready');
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // If using Three.js fallback or WebView failed
  if (useThreeJS || webViewError) {
    return (
      <ThreeJSViewer
        imageSource={imageSource}
        useGyro={useGyro}
        initialYaw={initialYaw}
        initialPitch={initialPitch}
      />
    );
  }

  // If HTML not loaded yet
  if (!htmlUri) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: htmlUri }}
        style={styles.webview}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // iOS specific props
        {...(Platform.OS === 'ios' && {
          allowsBackForwardNavigationGestures: false,
          automaticallyAdjustContentInsets: false,
          contentInsetAdjustmentBehavior: 'never',
        })}
        // Android specific props
        {...(Platform.OS === 'android' && {
          mixedContentMode: 'always',
          overScrollMode: 'never',
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
