import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../constants';
import { logger } from '../utils/logger';

interface WorkingExpoCameraScannerProps {
  onBarcodeScanned: (isbn: string) => void;
  onClose: () => void;
}

export const WorkingExpoCameraScanner: React.FC<WorkingExpoCameraScannerProps> = ({
  onBarcodeScanned,
  onClose,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const processingRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      logger.info('📷 [WORKING-CAMERA] Component initialized');
      logger.info('📷 [WORKING-CAMERA] Permission object:', permission);
    } catch (error) {
      logger.error('📷 [WORKING-CAMERA] Error during initialization:', error);
      setInitError(error instanceof Error ? error.message : String(error));
    }
  }, [permission]);

  // Cleanup refs when component unmounts
  useEffect(() => {
    return () => {
      processingRef.current = false;
      lastScannedRef.current = null;
      logger.info('📷 [WORKING-CAMERA] Component cleanup completed');
    };
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Multiple protection layers to prevent duplicate processing
    if (scanned || processingRef.current) {
      logger.info('📷 [WORKING-CAMERA] Ignoring duplicate scan - already processed');
      return;
    }
    
    // Validate data before processing
    if (!data || typeof data !== 'string') {
      logger.warn('📷 [WORKING-CAMERA] Invalid barcode data received:', data);
      return;
    }
    
    const cleanedData = data.replace(/[-\s]/g, '');
    
    // Check if we just processed this same ISBN
    if (lastScannedRef.current === cleanedData) {
      logger.info('📷 [WORKING-CAMERA] Ignoring duplicate scan - same ISBN:', cleanedData);
      return;
    }
    
    // Set all protection flags immediately
    setScanned(true);
    processingRef.current = true;
    lastScannedRef.current = cleanedData;
    
    logger.info('📷 [WORKING-CAMERA] Processing barcode:', { type, data: cleanedData });
    
    if (cleanedData.length === 10 || cleanedData.length === 13) {
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        logger.info('📷 [WORKING-CAMERA] Calling onBarcodeScanned with:', cleanedData);
        onBarcodeScanned(cleanedData);
        onClose(); // Close scanner immediately after successful scan
      }, 50);
    } else {
      Alert.alert(
        'Invalid ISBN',
        'The scanned code does not appear to be a valid ISBN. Please try again.',
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setScanned(false);
              processingRef.current = false;
              lastScannedRef.current = null;
            }
          },
          { text: 'Cancel', onPress: onClose },
        ]
      );
    }
  };

  const handleRequestPermission = async () => {
    logger.info('📷 [WORKING-CAMERA] User tapped Grant Permission button');
    logger.info('📷 [WORKING-CAMERA] Current permission state:', permission);
    
    try {
      logger.info('📷 [WORKING-CAMERA] Calling requestPermission()...');
      const result = await requestPermission();
      logger.info('📷 [WORKING-CAMERA] Permission request completed');
      logger.info('📷 [WORKING-CAMERA] Permission result:', result);
      
      if (!result.granted) {
        logger.warn('📷 [WORKING-CAMERA] Permission was denied');
        Alert.alert(
          'Camera Permission Denied',
          `Permission status: ${result.status}\nTo scan barcodes, please enable camera access in your device settings:\n\n1. Go to Settings\n2. Find this app\n3. Enable Camera access`,
          [
            { text: 'Cancel', onPress: onClose },
            { text: 'Try Again', onPress: handleRequestPermission }
          ]
        );
      } else {
        logger.info('📷 [WORKING-CAMERA] Permission granted successfully!');
      }
    } catch (error) {
      logger.error('📷 [WORKING-CAMERA] Error requesting permission:', error);
      Alert.alert(
        'Permission Error', 
        `Failed to request camera permission: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThis might be an Expo Go limitation.`,
        [
          { text: 'Cancel', onPress: onClose },
          { text: 'Try Again', onPress: handleRequestPermission }
        ]
      );
    }
  };

  // Handle initialization errors
  if (initError) {
    logger.error('📷 [WORKING-CAMERA] Rendering error state:', initError);
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>❌ Camera Error</Text>
          <Text style={styles.message}>
            Failed to initialize camera: {initError}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!permission) {
    logger.info('📷 [WORKING-CAMERA] Permission is null, loading...');
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>📷 Loading Camera...</Text>
          <Text style={styles.message}>Checking camera permissions...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    logger.info('📷 [WORKING-CAMERA] Permission not granted, showing request');
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>📷 Camera Permission Required</Text>
          <Text style={styles.message}>
            We need your permission to use the camera to scan ISBN barcodes.
          </Text>
          <Text style={styles.debugInfo}>
            Status: {permission.status}
            {'\n'}Can Ask Again: {permission.canAskAgain ? 'Yes' : 'No'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.neutral.gray600 }]} 
            onPress={() => {
              logger.info('📷 [WORKING-CAMERA] User requested permission check');
              Alert.alert(
                'Permission Debug Info',
                `Current State:\n• Status: ${permission?.status || 'unknown'}\n• Granted: ${permission?.granted || false}\n• Can Ask Again: ${permission?.canAskAgain || false}\n• Expires: ${permission?.expires || 'unknown'}`,
                [
                  { text: 'OK' },
                  { text: 'Check Settings', onPress: () => {
                    Alert.alert(
                      'Manual Permission Setup',
                      'If permissions are blocked:\n\n1. Go to iPhone Settings\n2. Scroll down to find "Expo Go"\n3. Tap on it\n4. Enable "Camera" permission\n5. Return to the app and try again'
                    );
                  }}
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>🔍 Debug Permissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  logger.info('📷 [WORKING-CAMERA] Permission granted, rendering camera');

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'codabar', 'upc_a', 'upc_e'],
        }}
      >
        {/* Simple overlay */}
        <View style={styles.overlay}>
          <View style={styles.topSection}>
            <Text style={styles.instructionText}>
              📷 Point camera at ISBN barcode
            </Text>
          </View>
          
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            {scanned && (
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setScanned(false)}
              >
                <Text style={styles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray900,
    padding: 20,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  debugInfo: {
    fontSize: 12,
    color: colors.neutral.gray300,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: colors.neutral.gray900,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Camera overlay styles
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  topSection: {
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanFrame: {
    width: 280,
    height: 120,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.primary.main,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 10,
  },
});

export default WorkingExpoCameraScanner;
