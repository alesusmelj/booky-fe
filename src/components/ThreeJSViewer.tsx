import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Alert } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import * as THREE from 'three';

export interface ThreeJSViewerProps {
  imageSource: {
    uri?: string;
    base64?: string;
  };
  useGyro?: boolean;
  initialYaw?: number;   // degrees
  initialPitch?: number; // degrees
}

export const ThreeJSViewer: React.FC<ThreeJSViewerProps> = ({
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
    onMoveShouldSetPanResponder: () => !useGyro, // Only handle touch when gyro is off
    onPanResponderGrant: (evt) => {
      touchRef.current.isDragging = true;
      touchRef.current.lastX = evt.nativeEvent.pageX;
      touchRef.current.lastY = evt.nativeEvent.pageY;
    },
    onPanResponderMove: (evt) => {
      if (!touchRef.current.isDragging || useGyro) return;
      
      const deltaX = evt.nativeEvent.pageX - touchRef.current.lastX;
      const deltaY = evt.nativeEvent.pageY - touchRef.current.lastY;
      
      // Update rotation based on touch movement
      rotationRef.current.yaw -= deltaX * 0.01;
      rotationRef.current.pitch += deltaY * 0.01;
      
      // Clamp pitch to avoid gimbal lock
      rotationRef.current.pitch = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, rotationRef.current.pitch)
      );
      
      touchRef.current.lastX = evt.nativeEvent.pageX;
      touchRef.current.lastY = evt.nativeEvent.pageY;
    },
    onPanResponderRelease: () => {
      touchRef.current.isDragging = false;
    },
  });

  // Initialize Three.js scene
  const initializeScene = async (gl: WebGLRenderingContext) => {
    try {
      // Create renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000);
      rendererRef.current = renderer;

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 0);
      cameraRef.current = camera;

      // Create sphere geometry (inverted for panorama)
      const geometry = new THREE.SphereGeometry(50, 64, 64);
      
      // Load texture
      const texture = await loadTexture();
      if (!texture) {
        throw new Error('Failed to load texture');
      }
      
      // Create material with inverted sphere
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide, // Render inside of sphere
      });

      // Create mesh
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      sphereRef.current = sphere;

      setIsInitialized(true);
      
      // Start render loop
      startRenderLoop();
      
    } catch (error) {
      console.error('Error initializing Three.js scene:', error);
      Alert.alert('Error', 'No se pudo inicializar el visor 3D');
    }
  };

  // Load texture from image source
  const loadTexture = async (): Promise<THREE.Texture | null> => {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      
      let imageUrl: string;
      if (imageSource.uri) {
        imageUrl = imageSource.uri;
      } else if (imageSource.base64) {
        imageUrl = `data:image/png;base64,${imageSource.base64}`;
      } else {
        resolve(null);
        return;
      }
      
      loader.load(
        imageUrl,
        (texture) => {
          // Configure texture for equirectangular mapping
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.flipY = false;
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          resolve(null);
        }
      );
    });
  };

  // Start render loop
  const startRenderLoop = () => {
    const render = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Update camera rotation
        updateCameraRotation();
        
        // Render scene
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameRef.current = requestAnimationFrame(render);
    };
    
    render();
  };

  // Update camera rotation based on gyro or touch
  const updateCameraRotation = () => {
    if (!cameraRef.current) return;
    
    const { yaw, pitch } = rotationRef.current;
    
    // Convert spherical coordinates to camera rotation
    cameraRef.current.rotation.set(pitch, yaw, 0, 'YXZ');
  };

  // Setup gyroscope
  useEffect(() => {
    if (useGyro && isInitialized) {
      startGyroscope();
    } else {
      stopGyroscope();
    }
    
    return () => stopGyroscope();
  }, [useGyro, isInitialized]);

  const startGyroscope = async () => {
    try {
      // Check if device motion is available
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        console.log('Device motion not available');
        return;
      }

      // Set update interval (60 FPS)
      DeviceMotion.setUpdateInterval(16);

      // Subscribe to device motion
      const subscription = DeviceMotion.addListener(handleDeviceMotion);
      setGyroSubscription(subscription);
      
    } catch (error) {
      console.error('Error starting gyroscope:', error);
    }
  };

  const stopGyroscope = () => {
    if (gyroSubscription) {
      gyroSubscription.remove();
      setGyroSubscription(null);
    }
  };

  const handleDeviceMotion = (data: DeviceMotionMeasurement) => {
    if (!useGyro || !data.rotation) return;
    
    // Get rotation data (in radians)
    const { alpha, beta, gamma } = data.rotation;
    
    if (alpha !== null && beta !== null && gamma !== null) {
      // Convert device orientation to camera rotation
      // Note: This is a simplified conversion, you might need to adjust based on device orientation
      rotationRef.current.yaw = alpha;
      rotationRef.current.pitch = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, beta)
      );
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      stopGyroscope();
    };
  }, []);

  // Update texture when image source changes
  useEffect(() => {
    if (isInitialized && sphereRef.current) {
      loadTexture().then((texture) => {
        if (texture && sphereRef.current) {
          const material = sphereRef.current.material as THREE.MeshBasicMaterial;
          material.map = texture;
          material.needsUpdate = true;
        }
      });
    }
  }, [imageSource, isInitialized]);

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
});
