import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { logger } from '../utils/logger';
import { colors } from '../constants';

interface IOSCameraScannerProps {
  onBarcodeScanned: (isbn: string) => void;
  onClose: () => void;
}

export const IOSCameraScanner: React.FC<IOSCameraScannerProps> = ({
  onBarcodeScanned,
  onClose,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [cameraModule, setCameraModule] = useState<any>(null);

  useEffect(() => {
    logger.info('📱 [iOS-CAMERA] Component initialized on platform:', Platform.OS);
    initializeCamera();
  }, []);

  const initializeCamera = async () => {
    try {
      logger.info('📱 [iOS-CAMERA] Attempting to load expo-camera...');
      
      // Try to import expo-camera
      const expoCameraModule = require('expo-camera');
      logger.info('📱 [iOS-CAMERA] expo-camera loaded successfully');
      logger.info('📱 [iOS-CAMERA] Available exports:', Object.keys(expoCameraModule));
      
      setCameraModule(expoCameraModule);
      
      // Check if we have the required components
      const { CameraView, useCameraPermissions } = expoCameraModule;
      
      if (!CameraView || !useCameraPermissions) {
        logger.error('📱 [iOS-CAMERA] Required components not found');
        setPermissionStatus('unavailable');
        return;
      }
      
      logger.info('📱 [iOS-CAMERA] Components found, checking permissions...');
      
      // For iOS, we need to handle permissions manually
      await checkCameraPermissions(expoCameraModule);
      
    } catch (error) {
      logger.error('📱 [iOS-CAMERA] Failed to initialize camera:', error);
      setPermissionStatus('error');
    }
  };

  const checkCameraPermissions = async (cameraModule: any) => {
    try {
      logger.info('📱 [iOS-CAMERA] Checking camera permissions...');
      
      // Try to get permissions using the Camera API directly
      if (cameraModule.Camera && cameraModule.Camera.getPermissionsAsync) {
        logger.info('📱 [iOS-CAMERA] Using legacy Camera.getPermissionsAsync');
        const { status } = await cameraModule.Camera.getPermissionsAsync();
        logger.info('📱 [iOS-CAMERA] Permission status:', status);
        setPermissionStatus(status);
      } else if (cameraModule.getCameraPermissionsAsync) {
        logger.info('📱 [iOS-CAMERA] Using getCameraPermissionsAsync');
        const { status } = await cameraModule.getCameraPermissionsAsync();
        logger.info('📱 [iOS-CAMERA] Permission status:', status);
        setPermissionStatus(status);
      } else {
        logger.warn('📱 [iOS-CAMERA] No permission check method found, assuming undetermined');
        setPermissionStatus('undetermined');
      }
    } catch (error) {
      logger.error('📱 [iOS-CAMERA] Error checking permissions:', error);
      setPermissionStatus('undetermined');
    }
  };

  const requestCameraPermission = async () => {
    if (!cameraModule) {
      Alert.alert('Error', 'Camera module not loaded');
      return;
    }

    try {
      logger.info('📱 [iOS-CAMERA] Requesting camera permission...');
      
      let result;
      
      // Try different permission request methods
      if (cameraModule.Camera && cameraModule.Camera.requestPermissionsAsync) {
        logger.info('📱 [iOS-CAMERA] Using legacy Camera.requestPermissionsAsync');
        result = await cameraModule.Camera.requestPermissionsAsync();
      } else if (cameraModule.requestCameraPermissionsAsync) {
        logger.info('📱 [iOS-CAMERA] Using requestCameraPermissionsAsync');
        result = await cameraModule.requestCameraPermissionsAsync();
      } else {
        throw new Error('No permission request method available');
      }
      
      logger.info('📱 [iOS-CAMERA] Permission request result:', result);
      
      if (result.status === 'granted') {
        logger.info('📱 [iOS-CAMERA] Permission granted! Loading camera...');
        setPermissionStatus('granted');
        // Here we would load the actual camera component
        loadCameraComponent();
      } else {
        logger.warn('📱 [iOS-CAMERA] Permission denied:', result.status);
        setPermissionStatus(result.status);
        
        Alert.alert(
          'Camera Permission Required',
          'To scan barcodes, please enable camera access in Settings > Privacy & Security > Camera > Expo Go',
          [
            { text: 'Cancel', onPress: onClose },
            { text: 'Try Again', onPress: requestCameraPermission }
          ]
        );
      }
    } catch (error) {
      logger.error('📱 [iOS-CAMERA] Error requesting permission:', error);
      Alert.alert(
        'Permission Error',
        `Failed to request camera permission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [
          { text: 'Cancel', onPress: onClose },
          { text: 'Try Again', onPress: requestCameraPermission }
        ]
      );
    }
  };

  const loadCameraComponent = () => {
    logger.info('📱 [iOS-CAMERA] Loading camera component...');
    // For now, just show success message
    Alert.alert(
      'Camera Ready!',
      'Camera permissions granted successfully. The camera scanner would load here.',
      [
        { text: 'Test Scan', onPress: () => {
          // Simulate a successful scan
          const testISBN = '9780451524935';
          onBarcodeScanned(testISBN);
          Alert.alert(
            'Test Scan Successful!',
            `Scanned ISBN: ${testISBN}`,
            [{ text: 'OK', onPress: onClose }]
          );
        }},
        { text: 'Close', onPress: onClose }
      ]
    );
  };

  const renderContent = () => {
    switch (permissionStatus) {
      case 'checking':
        return (
          <>
            <Text style={styles.title}>📱 Initializing Camera...</Text>
            <Text style={styles.message}>Checking camera availability on iOS...</Text>
          </>
        );
        
      case 'undetermined':
        return (
          <>
            <Text style={styles.title}>📱 Camera Permission Required</Text>
            <Text style={styles.message}>
              We need your permission to use the camera to scan ISBN barcodes.
            </Text>
            <Text style={styles.debugInfo}>
              Platform: {Platform.OS}
              {'\n'}Status: {permissionStatus}
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
              <Text style={styles.buttonText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          </>
        );
        
      case 'granted':
        return (
          <>
            <Text style={styles.title}>📱 Camera Ready!</Text>
            <Text style={styles.message}>Camera permissions granted successfully.</Text>
            <TouchableOpacity style={styles.button} onPress={loadCameraComponent}>
              <Text style={styles.buttonText}>Open Camera Scanner</Text>
            </TouchableOpacity>
          </>
        );
        
      case 'denied':
        return (
          <>
            <Text style={styles.title}>📱 Camera Permission Denied</Text>
            <Text style={styles.message}>
              Camera access was denied. Please enable it in Settings.
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        );
        
      case 'unavailable':
      case 'error':
      default:
        return (
          <>
            <Text style={styles.title}>📱 Camera Not Available</Text>
            <Text style={styles.message}>
              Camera scanner is not available on this device or in Expo Go.
            </Text>
            <Text style={styles.debugInfo}>
              Status: {permissionStatus}
              {'\n'}Platform: {Platform.OS}
            </Text>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  debugInfo: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: colors.neutral.gray100,
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  button: {
    backgroundColor: colors.primary.blue500,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: colors.neutral.gray500,
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
