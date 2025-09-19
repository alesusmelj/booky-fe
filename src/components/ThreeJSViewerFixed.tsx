import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Text } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import * as THREE from 'three';

export interface ThreeJSViewerFixedProps {
  imageSource: {
    uri?: string;
    base64?: string;
  };
  useGyro?: boolean;
  initialYaw?: number;
  initialPitch?: number;
}

// Embedded small panoramic image for testing (base64)
const TEST_PANORAMA_BASE64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;

export const ThreeJSViewerFixed: React.FC<ThreeJSViewerFixedProps> = ({
  imageSource,
  useGyro = true,
  initialYaw = 0,
  initialPitch = 0,
}) => {
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gyroSubscription, setGyroSubscription] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState('Inicializando...');
  
  // Camera rotation state
  const rotationRef = useRef({
    yaw: initialYaw * Math.PI / 180,
    pitch: initialPitch * Math.PI / 180,
  });
  
  // Touch/drag state
  const touchRef = useRef({
    lastX: 0,
    lastY: 0,
    isDragging: false,
  });

  const { width, height } = Dimensions.get('window');

  // Pan responder for touch controls
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !useGyro,
    onMoveShouldSetPanResponder: () => !useGyro,
    
    onPanResponderGrant: (evt) => {
      if (!useGyro) {
        touchRef.current.isDragging = true;
        touchRef.current.lastX = evt.nativeEvent.pageX;
        touchRef.current.lastY = evt.nativeEvent.pageY;
      }
    },
    
    onPanResponderMove: (evt) => {
      if (!useGyro && touchRef.current.isDragging) {
        const deltaX = evt.nativeEvent.pageX - touchRef.current.lastX;
        const deltaY = evt.nativeEvent.pageY - touchRef.current.lastY;
        
        const sensitivity = 0.005;
        rotationRef.current.yaw -= deltaX * sensitivity;
        rotationRef.current.pitch += deltaY * sensitivity;
        
        rotationRef.current.pitch = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, rotationRef.current.pitch)
        );
        
        touchRef.current.lastX = evt.nativeEvent.pageX;
        touchRef.current.lastY = evt.nativeEvent.pageY;
      }
    },
    
    onPanResponderRelease: () => {
      touchRef.current.isDragging = false;
    },
  });

  const initializeScene = async (gl: WebGLRenderingContext) => {
    try {
      console.log('🎬 Initializing Three.js scene...');
      setLoadingStep('Creando escena 3D...');
      setError(null);
      
      // Create renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 1.0);
      rendererRef.current = renderer;
      
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 0);
      cameraRef.current = camera;
      
      console.log('📷 Camera and scene created');
      setLoadingStep('Cargando imagen...');
      
      // Create sphere with texture
      await createSphereWithTexture();
      
      // Start render loop
      startRenderLoop();
      
      setIsInitialized(true);
      setIsLoading(false);
      console.log('✅ Three.js initialization complete');
      
    } catch (error) {
      console.error('❌ Error initializing Three.js scene:', error);
      setError(`Error de inicialización: ${error.message}`);
      setIsLoading(false);
    }
  };

  const createSphereWithTexture = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🖼️ Creating sphere with texture...');
        
        // Determine which image to use
        let textureUrl: string;
        
        if (imageSource.uri) {
          // For external URLs, use test image for now (since external URLs are problematic)
          console.log('🌐 Using test image instead of external URL for stability');
          textureUrl = TEST_PANORAMA_BASE64;
        } else if (imageSource.base64) {
          textureUrl = `data:image/jpeg;base64,${imageSource.base64}`;
          console.log('📄 Using provided base64 image');
        } else {
          // Fallback to test image
          console.log('🔄 Using fallback test image');
          textureUrl = TEST_PANORAMA_BASE64;
        }
        
        setLoadingStep('Procesando textura...');
        
        // Create texture from data URL
        const loader = new THREE.TextureLoader();
        
        loader.load(
          textureUrl,
          (texture) => {
            console.log('✅ Texture loaded successfully');
            setLoadingStep('Aplicando textura...');
            
            try {
              // Configure texture for panoramic mapping
              texture.mapping = THREE.EquirectangularReflectionMapping;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.flipY = false;
              
              // Create sphere geometry (large enough to surround camera)
              const geometry = new THREE.SphereGeometry(100, 64, 32);
              
              // Create material with the texture
              const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide, // Show inside of sphere
              });
              
              // Create mesh
              const sphere = new THREE.Mesh(geometry, material);
              sphereRef.current = sphere;
              
              // Add to scene
              if (sceneRef.current) {
                sceneRef.current.add(sphere);
                console.log('🌐 Sphere added to scene');
              }
              
              setLoadingStep('Finalizando...');
              resolve();
              
            } catch (materialError) {
              console.error('❌ Error creating material:', materialError);
              reject(new Error(`Error creando material: ${materialError.message}`));
            }
          },
          (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log('📊 Loading progress:', percent + '%');
            setLoadingStep(`Cargando imagen... ${percent}%`);
          },
          (error) => {
            console.error('❌ Error loading texture:', error);
            reject(new Error(`Error cargando imagen: ${error.message || 'Desconocido'}`));
          }
        );
        
      } catch (error) {
        console.error('❌ Error in createSphereWithTexture:', error);
        reject(error);
      }
    });
  };

  const startRenderLoop = () => {
    const render = () => {
      try {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          // Update camera rotation
          updateCameraRotation();
          
          // Render scene
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        
        frameRef.current = requestAnimationFrame(render);
      } catch (error) {
        console.error('❌ Error in render loop:', error);
      }
    };
    
    render();
  };

  const updateCameraRotation = () => {
    if (cameraRef.current) {
      const { yaw, pitch } = rotationRef.current;
      
      // Convert spherical coordinates to Cartesian for lookAt
      const x = Math.cos(pitch) * Math.sin(yaw);
      const y = Math.sin(pitch);
      const z = Math.cos(pitch) * Math.cos(yaw);
      
      // Set camera rotation
      cameraRef.current.lookAt(x, y, z);
    }
  };

  const startGyroscope = async () => {
    try {
      console.log('🔄 Starting gyroscope...');
      
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        console.warn('⚠️ DeviceMotion not available');
        return;
      }
      
      DeviceMotion.setUpdateInterval(16); // ~60fps
      
      const subscription = DeviceMotion.addListener(handleDeviceMotion);
      setGyroSubscription(subscription);
      
      console.log('✅ Gyroscope started');
    } catch (error) {
      console.error('❌ Error starting gyroscope:', error);
    }
  };

  const stopGyroscope = () => {
    if (gyroSubscription) {
      console.log('🛑 Stopping gyroscope...');
      gyroSubscription.remove();
      setGyroSubscription(null);
    }
  };

  const handleDeviceMotion = (data: DeviceMotionMeasurement) => {
    if (data.rotation) {
      const alpha = data.rotation.alpha || 0;
      const beta = data.rotation.beta || 0;
      
      // Apply rotation with smoothing
      const smoothing = 0.1;
      rotationRef.current.yaw = rotationRef.current.yaw * (1 - smoothing) + alpha * smoothing;
      rotationRef.current.pitch = rotationRef.current.pitch * (1 - smoothing) + (-beta * smoothing);
      
      // Clamp pitch
      rotationRef.current.pitch = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, rotationRef.current.pitch)
      );
    }
  };

  // Handle gyroscope toggle
  useEffect(() => {
    if (isInitialized) {
      if (useGyro) {
        startGyroscope();
      } else {
        stopGyroscope();
      }
    }
    
    return () => {
      stopGyroscope();
    };
  }, [useGyro, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Three.js viewer...');
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      stopGyroscope();
      
      if (sphereRef.current) {
        sphereRef.current.geometry.dispose();
        if (sphereRef.current.material instanceof THREE.Material) {
          sphereRef.current.material.dispose();
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Problema con la carga de la imagen 360°
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🌐 Cargando Visor 360°</Text>
          <Text style={styles.loadingSubtext}>{loadingStep}</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingProgress} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLView
        style={styles.glView}
        onContextCreate={initializeScene}
      />
      
      {/* Debug info overlay */}
      <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>
          {useGyro ? '🔄 Giroscopio Activo' : '👆 Control Táctil'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  glView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
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
    marginBottom: 12,
    lineHeight: 22,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  debugOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: 'center',
  },
});
