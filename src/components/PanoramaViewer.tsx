import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import { Renderer } from 'expo-three';
import * as ExpoTHREE from 'expo-three';
import * as THREE from 'three';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { DeviceMotion, Gyroscope } from 'expo-sensors';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PanoramaViewerProps {
  /** Image source - can be a URL or base64 encoded image */
  imageSource: {
    uri?: string;
    base64?: string;
  };
  /** Enable gyroscope control (default: true) */
  useGyro?: boolean;
  /** Initial horizontal rotation in degrees (default: 0) */
  initialYaw?: number;
  /** Initial vertical rotation in degrees (default: 0) */
  initialPitch?: number;
  /** Callback when user closes the viewer */
  onClose?: () => void;
  /** Show close button (default: true) */
  showCloseButton?: boolean;
  /** Show controls overlay (default: true) */
  showControls?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TEST_PANORAMA_URI = 'https://cdn.pixabay.com/photo/2016/01/05/13/58/360-degree-1123718_1280.jpg';

// ============================================================================
// TEXTURE LOADING UTILITIES
// ============================================================================

const uriFromSource = async (src: { uri?: string; base64?: string }): Promise<string> => {
  try {
    if (src?.base64) {
      const filePath = `${FileSystem.documentDirectory}panorama_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(filePath, src.base64, { encoding: 'base64' });
      return filePath;
    }
    
    if (src?.uri) {
      const asset = Asset.fromURI(src.uri);
      await asset.downloadAsync();
      return asset.localUri ?? asset.uri;
    }
    
    const asset = Asset.fromURI(TEST_PANORAMA_URI);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri;
  } catch (error) {
    console.error('❌ [URI] Error getting local URI:', error);
    throw error;
  }
};

type LoadOpts = {
  timeoutMs?: number;
  noMipmaps?: boolean;
  maxWidth?: number;
};

const loadTextureRobustAsync = async (
  url: string,
  opts: LoadOpts = {}
): Promise<THREE.Texture> => {
  const timeoutMs = opts.timeoutMs ?? 10000;
  const maxWidth = opts.maxWidth ?? 4096;

  if (url.startsWith('http://')) {
    throw new Error('iOS/ATS blocks http:// — use https://');
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
  );

  const loadOp = (async () => {
    const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

    if (isNative) {
      let localUri = url;
      
      // Direct load for Android with HTTP/HTTPS URLs
      if (Platform.OS === 'android' && url.startsWith('https://')) {
        try {
          const texture: THREE.Texture = await ExpoTHREE.loadAsync(url);
          if (opts.noMipmaps) {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
          }
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.flipY = true;
          if ((texture as any).colorSpace !== undefined) {
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          }
          texture.needsUpdate = true;
          return texture;
        } catch {
          // Fall through to asset method
        }
      }
      
      // Standard method with expo-asset
      const asset = /^\d+$/.test(url) ? Asset.fromModule(Number(url)) : Asset.fromURI(url);
      
      try {
        await asset.downloadAsync();
        localUri = asset.localUri ?? asset.uri;
      } catch (downloadError) {
        throw new Error(`Error downloading image: ${downloadError}`);
      }

      // Resize to avoid MAX_TEXTURE_SIZE issues
      try {
        const resized = await ImageManipulator.manipulateAsync(
          localUri,
          [{ resize: { width: maxWidth } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        localUri = resized.uri;
      } catch {
        // Use original if resize fails
      }

      const texture: THREE.Texture = await ExpoTHREE.loadAsync(localUri);

      if (opts.noMipmaps) {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
      }
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.flipY = true;
      
      if ((texture as any).colorSpace !== undefined) {
        (texture as any).colorSpace = THREE.SRGBColorSpace;
      }
      
      texture.needsUpdate = true;
      return texture;
    }

    // Web fallback
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    return await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          if (opts.noMipmaps) {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
          }
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.flipY = true;
          if ((texture as any).colorSpace !== undefined) {
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          }
          texture.needsUpdate = true;
          resolve(texture);
        },
        undefined,
        (err: any) => reject(new Error(`TextureLoader failed: ${err?.message ?? 'Unknown'}`))
      );
    });
  })();

  return Promise.race([loadOp, timeout]);
};

// Procedural texture fallback
const createProceduralTexture = (): THREE.Texture => {
  const width = 2048;
  const height = 1024;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  
  for (let i = 0; i < size; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const stride = i * 4;
    
    const u = x / width;
    const v = y / height;
    
    const skyRegion = v < 0.4;
    const mountainRegion = v >= 0.4 && v < 0.7;
    
    if (skyRegion) {
      const skyIntensity = 1 - (v / 0.4);
      const cloudNoise = Math.sin(u * Math.PI * 6) * Math.sin(v * Math.PI * 8) * Math.sin(u * Math.PI * 15);
      const hasCloud = cloudNoise > 0.4;
      
      if (hasCloud) {
        data[stride] = 255;
        data[stride + 1] = 255;
        data[stride + 2] = 255;
      } else {
        data[stride] = Math.floor(100 + skyIntensity * 55);
        data[stride + 1] = Math.floor(150 + skyIntensity * 56);
        data[stride + 2] = Math.floor(200 + skyIntensity * 55);
      }
    } else if (mountainRegion) {
      const mountainHeight = Math.sin(u * Math.PI * 8) * 0.15 + 0.55;
      const isAboveMountain = v < mountainHeight;
      
      if (isAboveMountain) {
        const mountainShade = Math.sin(u * Math.PI * 20) * 0.3 + 0.7;
        const grayValue = Math.floor(80 + mountainShade * 60);
        data[stride] = grayValue;
        data[stride + 1] = grayValue;
        data[stride + 2] = grayValue + 10;
      } else {
        data[stride] = 60;
        data[stride + 1] = 120;
        data[stride + 2] = 40;
      }
    } else {
      const grassVariation = Math.sin(u * Math.PI * 25) * Math.sin(v * Math.PI * 30) * 0.3 + 0.7;
      data[stride] = Math.floor(20 + grassVariation * 40);
      data[stride + 1] = Math.floor(80 + grassVariation * 60);
      data[stride + 2] = Math.floor(20 + grassVariation * 30);
    }
    
    // Reference lines
    const isVerticalLine = (x % (width / 8)) < 2;
    const isHorizontalLine = Math.abs(y - height/2) < 1;
    
    if (isVerticalLine || isHorizontalLine) {
      data[stride] = Math.min(255, data[stride] + 100);
      data[stride + 1] = Math.min(255, data[stride + 1] + 100);
      data[stride + 2] = Math.max(0, data[stride + 2] - 50);
    }
    
    data[stride + 3] = 255;
  }
  
  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.flipY = true;
  
  if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = THREE.SRGBColorSpace;
  }
  
  return texture;
};

const loadPanoramaTexture = async (src: { uri?: string; base64?: string }): Promise<THREE.Texture> => {
  if (src?.uri || src?.base64) {
    try {
      if (src.uri && src.uri.startsWith('http')) {
        try {
          return await loadTextureRobustAsync(src.uri, {
            timeoutMs: 20000,
            noMipmaps: true,
            maxWidth: 4096
          });
        } catch {
          // Fall through to local method
        }
      }
      
      const localUri = await uriFromSource(src);
      return await loadTextureRobustAsync(localUri, {
        timeoutMs: 10000,
        noMipmaps: true,
        maxWidth: 4096
      });
    } catch {
      // Fall through to procedural
    }
  }
  
  return createProceduralTexture();
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  imageSource,
  useGyro = true,
  initialYaw = 0,
  initialPitch = 0,
  onClose,
  showCloseButton = true,
  showControls = true,
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentUseGyro, setCurrentUseGyro] = useState(useGyro);
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation | null>(null);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('screen'));
  
  // Refs for camera control
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const filteredYawRef = useRef(0);
  const filteredPitchRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const yaw0Ref = useRef(0);
  const pitch0Ref = useRef(0);
  const sensorSubscription = useRef<any>(null);
  const touchRef = useRef({ lastX: 0, lastY: 0, isDragging: false });
  
  const insets = useSafeAreaInsets();

  // ============================================================================
  // ORIENTATION MANAGEMENT
  // ============================================================================

  useEffect(() => {
    let isMounted = true;

    const lockToLandscape = async () => {
      try {
        // Lock to landscape (allows both left and right)
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        console.log('🔄 [PANORAMA] Locked to landscape');
      } catch (error) {
        console.warn('Could not lock orientation:', error);
      }
    };

    const unlockOrientation = async () => {
      try {
        // Unlock and return to default (portrait for most apps)
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        // Then unlock completely
        await ScreenOrientation.unlockAsync();
        console.log('🔓 [PANORAMA] Orientation unlocked');
      } catch (error) {
        console.warn('Could not unlock orientation:', error);
      }
    };

    lockToLandscape();

    // Listen for orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      if (isMounted) {
        setOrientation(event.orientationInfo.orientation);
        setScreenDimensions(Dimensions.get('screen'));
      }
    });

    // Get initial orientation
    ScreenOrientation.getOrientationAsync().then((orient) => {
      if (isMounted) {
        setOrientation(orient);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
      unlockOrientation();
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onClose) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [onClose]);

  // Update dimensions when screen changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenDimensions(screen);
    });

    return () => subscription.remove();
  }, []);

  // ============================================================================
  // SENSOR MANAGEMENT
  // ============================================================================

  const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
  const normalizePi = (v: number): number => {
    const twoPi = Math.PI * 2;
    return ((v + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
  };
  const ema = (prev: number, target: number, dt: number, tau: number = 0.1): number => {
    return prev + (target - prev) * (1 - Math.exp(-dt / tau));
  };
  const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

  const processSensorData = useCallback((data: any) => {
    if (!data.rotation) return;

    const currentTime = Date.now() / 1000;
    const dt = lastTimeRef.current ? (currentTime - lastTimeRef.current) : 1 / 60;
    lastTimeRef.current = currentTime;

    const r = data.rotation;
    let yaw = r.alpha ?? 0;
    let pitch = r.beta ?? 0;
    const roll = r.gamma ?? 0;

    // Detect landscape by dimensions if orientation is null
    let effectiveOrientation = orientation;
    if (!effectiveOrientation) {
      const dims = Dimensions.get('window');
      effectiveOrientation = dims.width > dims.height
        ? ScreenOrientation.Orientation.LANDSCAPE_LEFT
        : ScreenOrientation.Orientation.PORTRAIT_UP;
    }

    // Compensate for screen orientation - CRITICAL for landscape
    switch (effectiveOrientation) {
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        yaw = normalizePi(yaw - Math.PI / 2);
        pitch = roll;
        break;
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        yaw = normalizePi(yaw + Math.PI / 2);
        pitch = -roll;
        break;
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        yaw = normalizePi(yaw + Math.PI);
        break;
      default:
        yaw = normalizePi(yaw);
        pitch = -pitch;
        break;
    }

    // Initial calibration
    if (yaw0Ref.current === 0 && pitch0Ref.current === 0) {
      yaw0Ref.current = yaw;
      pitch0Ref.current = pitch;
    }

    // Apply calibration offsets
    const yawEff = normalizePi(yaw - yaw0Ref.current);
    const pitchEff = pitch - pitch0Ref.current;

    // Apply smoothing
    filteredYawRef.current = ema(filteredYawRef.current, yawEff, dt, 0.1);
    filteredPitchRef.current = ema(filteredPitchRef.current, pitchEff, dt, 0.1);

    // Store values
    yawRef.current = filteredYawRef.current;
    pitchRef.current = clamp(filteredPitchRef.current, degToRad(-85), degToRad(85));
  }, [orientation]);

  const startSensorSystem = useCallback(async () => {
    try {
      const deviceMotionAvailable = await DeviceMotion.isAvailableAsync();
      
      if (deviceMotionAvailable) {
        DeviceMotion.setUpdateInterval(16); // ~60Hz
        const subscription = DeviceMotion.addListener(processSensorData);
        sensorSubscription.current = subscription;
        console.log('✅ DeviceMotion started');
      } else {
        const gyroAvailable = await Gyroscope.isAvailableAsync();
        
        if (gyroAvailable) {
          Gyroscope.setUpdateInterval(16);
          const subscription = Gyroscope.addListener((gyroData) => {
            const currentTime = Date.now() / 1000;
            const dt = lastTimeRef.current ? (currentTime - lastTimeRef.current) : 1 / 60;
            lastTimeRef.current = currentTime;
            
            yawRef.current += (gyroData.z ?? 0) * dt;
            pitchRef.current += (-(gyroData.x || 0)) * dt;
            yawRef.current = normalizePi(yawRef.current);
            pitchRef.current = clamp(pitchRef.current, degToRad(-85), degToRad(85));
          });
          
          sensorSubscription.current = subscription;
          console.log('✅ Gyroscope fallback started');
        }
      }
    } catch (error) {
      console.error('❌ Sensor system error:', error);
    }
  }, [processSensorData]);

  const stopSensorSystem = useCallback(() => {
    if (sensorSubscription.current) {
      sensorSubscription.current.remove();
      sensorSubscription.current = null;
    }
  }, []);

  useEffect(() => {
    if (currentUseGyro) {
      startSensorSystem();
    } else {
      stopSensorSystem();
    }
    
    return () => stopSensorSystem();
  }, [currentUseGyro, startSensorSystem, stopSensorSystem]);

  // ============================================================================
  // TOUCH CONTROLS
  // ============================================================================

  const DRAG_YAW_K = 0.005;
  const DRAG_PITCH_K = 0.003;

  const handleTouchStart = useCallback((evt: any) => {
    if (!currentUseGyro) {
      touchRef.current.isDragging = true;
      touchRef.current.lastX = evt.nativeEvent.pageX;
      touchRef.current.lastY = evt.nativeEvent.pageY;
    }
  }, [currentUseGyro]);

  const handleTouchMove = useCallback((evt: any) => {
    if (!currentUseGyro && touchRef.current.isDragging) {
      const dx = evt.nativeEvent.pageX - touchRef.current.lastX;
      const dy = evt.nativeEvent.pageY - touchRef.current.lastY;

      yawRef.current -= dx * DRAG_YAW_K;
      const nextPitch = pitchRef.current + dy * DRAG_PITCH_K;
      pitchRef.current = clamp(nextPitch, degToRad(-85), degToRad(85));

      touchRef.current.lastX = evt.nativeEvent.pageX;
      touchRef.current.lastY = evt.nativeEvent.pageY;
    }
  }, [currentUseGyro]);

  const handleTouchEnd = useCallback(() => {
    touchRef.current.isDragging = false;
  }, []);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleCenterView = useCallback(() => {
    yawRef.current = 0;
    pitchRef.current = 0;
    filteredYawRef.current = 0;
    filteredPitchRef.current = 0;
    yaw0Ref.current = 0;
    pitch0Ref.current = 0;
  }, []);

  const handleToggleGyro = useCallback(() => {
    setCurrentUseGyro(prev => !prev);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setImageLoaded(false);
  }, []);

  // ============================================================================
  // 3D RENDERING
  // ============================================================================

  const onContextCreate = useCallback(async (gl: WebGLRenderingContext) => {
    const { drawingBufferWidth: glWidth, drawingBufferHeight: glHeight } = gl;

    try {
      gl.viewport(0, 0, glWidth, glHeight);

      const renderer = new Renderer({ gl });
      renderer.setSize(glWidth, glHeight);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 1);

      const scene = new THREE.Scene();
      const aspectRatio = glWidth / glHeight;
      const fov = 100;
      const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000);
      camera.position.set(0, 0, 0);
      camera.rotation.order = 'YXZ';

      const geometry = new THREE.SphereGeometry(30, 64, 64);

      let texture;
      try {
        texture = await loadPanoramaTexture(imageSource);
      } catch {
        texture = createProceduralTexture();
      }

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.scale.set(1, 1, 1);
      scene.add(sphere);

      setImageLoaded(true);
      setIsLoading(false);

      // Update camera aspect on resize
      const updateCameraAspect = () => {
        const { width: sw, height: sh } = Dimensions.get('window');
        camera.aspect = sw / sh;
        camera.updateProjectionMatrix();
        gl.viewport(0, 0, glWidth, glHeight);
      };

      const dimensionsSubscription = Dimensions.addEventListener('change', updateCameraAspect);

      // Render loop
      const render = () => {
        requestAnimationFrame(render);
        camera.rotation.y = yawRef.current;
        camera.rotation.x = pitchRef.current;
        camera.rotation.z = 0;
        renderer.render(scene, camera);
        (gl as any).endFrameEXP();
      };

      render();

      // Return cleanup function (will be called on unmount via effect)
      return () => {
        dimensionsSubscription.remove();
      };
    } catch (err) {
      console.error('❌ [3D] Error:', err);
      setError('Error initializing 3D viewer');
      setIsLoading(false);
    }
  }, [imageSource]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const { width, height } = screenDimensions;

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { width, height }]}>
        <StatusBar hidden />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
          {showCloseButton && onClose && (
            <TouchableOpacity style={styles.closeButtonError} onPress={handleClose}>
              <Text style={styles.closeButtonErrorText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { width, height }]}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hide status bar completely */}
      <StatusBar hidden translucent backgroundColor="transparent" />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>🌐 Loading 360° Viewer...</Text>
          <Text style={styles.loadingSubtext}>
            {imageSource.uri ? 'Downloading image...' : 'Initializing...'}
          </Text>
        </View>
      )}
      
      {/* 3D Viewer - fills entire screen */}
      <View style={styles.viewerContainer}>
        <GLView 
          style={styles.glView}
          onContextCreate={onContextCreate} 
        />
      </View>
      
      {/* Close button - positioned in safe area */}
      {showCloseButton && onClose && (
        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              top: Platform.OS === 'ios' ? Math.max(20, insets.top) : 20,
              left: Platform.OS === 'ios' ? Math.max(20, insets.left) : 20,
            },
          ]}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
      
      {/* Controls overlay */}
      {showControls && imageLoaded && (
        <View
          style={[
            styles.controlsOverlay,
            {
              bottom: Platform.OS === 'ios' ? Math.max(30, insets.bottom + 10) : 30,
              paddingHorizontal: Platform.OS === 'ios' ? Math.max(20, insets.left) : 20,
            },
          ]}
        >
          <TouchableOpacity style={styles.controlButton} onPress={handleCenterView}>
            <Text style={styles.controlButtonText}>🎯 Center</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.controlButton,
              currentUseGyro ? styles.controlButtonActive : styles.controlButtonInactive,
            ]}
            onPress={handleToggleGyro}
          >
            <Text style={styles.controlButtonText}>
              {currentUseGyro ? '🔄 Gyro ON' : '🔄 Gyro OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Debug info */}
      {imageLoaded && (
        <View
          style={[
            styles.debugOverlay,
            {
              top: Platform.OS === 'ios' ? Math.max(20, insets.top) : 20,
              right: Platform.OS === 'ios' ? Math.max(20, insets.right) : 20,
            },
          ]}
        >
          <Text style={styles.debugText}>
            {currentUseGyro ? '🎥 Gyroscope' : '👆 Touch'}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 99999,
    elevation: 99999,
  },
  viewerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  glView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonError: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    zIndex: 10000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  controlsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderColor: 'rgba(0, 122, 255, 1)',
  },
  controlButtonInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 50,
  },
  debugText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
});
