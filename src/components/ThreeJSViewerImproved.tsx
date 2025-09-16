import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Alert, Text } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import * as THREE from 'three';

export interface ThreeJSViewerImprovedProps {
  imageSource: {
    uri?: string;
    base64?: string;
  };
  useGyro?: boolean;
  initialYaw?: number;   // degrees
  initialPitch?: number; // degrees
}

export const ThreeJSViewerImproved: React.FC<ThreeJSViewerImprovedProps> = ({
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

  // Screen dimensions
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
        
        // Convert touch movement to rotation
        const sensitivity = 0.005;
        rotationRef.current.yaw -= deltaX * sensitivity;
        rotationRef.current.pitch += deltaY * sensitivity;
        
        // Clamp pitch to prevent gimbal lock
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
      
      // Load texture and create sphere
      await loadTextureAndCreateSphere();
      
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

  const loadTextureAndCreateSphere = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🖼️ Loading texture...', imageSource);
        
        let textureUrl: string;
        
        if (imageSource.uri) {
          textureUrl = imageSource.uri;
          console.log('📡 Using URI:', textureUrl);
        } else if (imageSource.base64) {
          textureUrl = `data:image/jpeg;base64,${imageSource.base64}`;
          console.log('📄 Using base64 data URI');
        } else {
          throw new Error('No image source provided');
        }
        
        // Create texture loader
        const loader = new THREE.TextureLoader();
        
        // Add CORS handling for web URLs
        loader.setCrossOrigin('anonymous');
        
        loader.load(
          textureUrl,
          (texture) => {
            console.log('✅ Texture loaded successfully');
            
            // Configure texture
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.flipY = false;
            
            // Create sphere geometry (inverted)
            const geometry = new THREE.SphereGeometry(50, 64, 32);
            
            // Create material with texture
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
            
            resolve();
          },
          (progress) => {
            console.log('📊 Loading progress:', (progress.loaded / progress.total * 100) + '%');
          },
          (error) => {
            console.error('❌ Error loading texture:', error);
            reject(new Error(`Error cargando imagen: ${error.message || 'Desconocido'}`));
          }
        );
        
      } catch (error) {
        console.error('❌ Error in loadTextureAndCreateSphere:', error);
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
      
      // Convert spherical coordinates to Cartesian
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
      
      // Check if DeviceMotion is available
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        console.warn('⚠️ DeviceMotion not available');
        return;
      }
      
      // Set update interval
      DeviceMotion.setUpdateInterval(16); // ~60fps
      
      // Start listening
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
      // Convert device rotation to camera rotation
      // Note: These mappings might need adjustment based on device orientation
      const alpha = data.rotation.alpha || 0; // Z axis (yaw)
      const beta = data.rotation.beta || 0;   // X axis (pitch)
      const gamma = data.rotation.gamma || 0; // Y axis (roll)
      
      // Update rotation with some smoothing
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
      
      // Stop render loop
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Stop gyroscope
      stopGyroscope();
      
      // Clean up Three.js objects
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

  // Handle image source changes
  useEffect(() => {
    if (isInitialized && sceneRef.current) {
      console.log('🔄 Image source changed, reloading...');
      setIsLoading(true);
      setError(null);
      
      // Remove old sphere
      if (sphereRef.current) {
        sceneRef.current.remove(sphereRef.current);
        sphereRef.current.geometry.dispose();
        if (sphereRef.current.material instanceof THREE.Material) {
          sphereRef.current.material.dispose();
        }
      }
      
      // Load new texture
      loadTextureAndCreateSphere()
        .then(() => {
          setIsLoading(false);
          console.log('✅ Image reloaded successfully');
        })
        .catch((error) => {
          console.error('❌ Error reloading image:', error);
          setError(error.message);
          setIsLoading(false);
        });
    }
  }, [imageSource, isInitialized]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Verifica tu conexión a internet y la URL de la imagen
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🌐 Cargando imagen 360°...</Text>
          <Text style={styles.loadingSubtext}>
            {imageSource.uri ? 'Descargando desde internet...' : 'Procesando imagen...'}
          </Text>
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
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
