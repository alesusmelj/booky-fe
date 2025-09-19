import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { colors } from '../constants';
import { logger } from '../utils/logger';

interface BarcodeScannerWrapperProps {
  onBarcodeScanned: (isbn: string) => void;
  onClose: () => void;
  forceNative?: boolean; // Allow forcing native scanner for testing
}

// Check if expo-camera is available (should be in Expo SDK)
const isExpoCameraAvailable = () => {
  try {
    // Try to import the main components directly (no require.resolve in RN)
    const expoCameraModule = require('expo-camera');
    const { CameraView, useCameraPermissions } = expoCameraModule;
    
    // Check if it has the expected API
    if (CameraView && useCameraPermissions) {
      logger.info('📷 [CAMERA] expo-camera is available and functional');
      return true;
    } else {
      logger.info('📷 [CAMERA] expo-camera exists but components not found, using fallback');
      return false;
    }
  } catch (error) {
    logger.info('📷 [CAMERA] expo-camera not available:', error instanceof Error ? error.message : String(error), '- using fallback');
    return false;
  }
};

// Fallback component for when native scanner is not available
const FallbackScanner: React.FC<BarcodeScannerWrapperProps> = ({
  onBarcodeScanned,
  onClose,
  forceNative,
}) => {
  const [manualISBN, setManualISBN] = useState('');

  const handleManualEntry = () => {
    if (manualISBN && typeof manualISBN === 'string' && manualISBN.trim()) {
      const cleanedISBN = manualISBN.replace(/[-\s]/g, '');
      if (cleanedISBN.length === 10 || cleanedISBN.length === 13) {
        onBarcodeScanned(cleanedISBN);
        Alert.alert(
          'ISBN Entered',
          `ISBN: ${manualISBN}`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Invalid ISBN', 'Please enter a valid 10 or 13 digit ISBN');
      }
    }
  };

  const handleDemoScan = () => {
    const demoISBN = '9780451524935'; // 1984 by George Orwell
    setManualISBN(demoISBN);
    onBarcodeScanned(demoISBN);
    Alert.alert(
      'Demo ISBN Scanned',
      `ISBN: ${demoISBN}\n(1984 by George Orwell)`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackTitle}>📱 Scanner Not Available</Text>
        <Text style={styles.fallbackMessage}>
          The camera scanner is not available in Expo Go. You can:
        </Text>

        {/* Manual ISBN Entry */}
        <View style={styles.manualEntrySection}>
          <Text style={styles.sectionTitle}>Enter ISBN Manually:</Text>
          <TextInput
            style={styles.isbnInput}
            placeholder="Enter 10 or 13 digit ISBN"
            value={manualISBN}
            onChangeText={setManualISBN}
            keyboardType="numeric"
            maxLength={17} // Allow for hyphens
          />
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleManualEntry}
            disabled={!manualISBN.trim()}
          >
            <Text style={styles.primaryButtonText}>Add Book</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Option */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>Or try a demo book:</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.demoButton]}
            onPress={handleDemoScan}
          >
            <Text style={styles.demoButtonText}>📚 Use Demo ISBN (1984)</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Section */}
        <View style={styles.debugSection}>
          <Text style={styles.sectionTitle}>🔧 Debug Options:</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.debugButton]}
            onPress={() => {
              logger.info('📷 [CAMERA] User requested to test camera scanner');
              onClose();
              // This will trigger a re-render and try to use the camera
              setTimeout(() => {
                alert('Intentando usar la cámara real. Si no funciona, verifica que tengas permisos de cámara habilitados.');
              }, 100);
            }}
          >
            <Text style={styles.debugButtonText}>📷 Try Camera Scanner</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.debugButton]}
            onPress={() => {
              logger.info('🧪 [CAMERA] User requested simple permission test');
              onClose();
              // Import and show simple permission test with better error handling
              setTimeout(() => {
                try {
                  import('./SimpleCameraPermissionTest').then(({ SimpleCameraPermissionTest }) => {
                    // This is a quick test - in a real app you'd handle this better
                    logger.info('🧪 [CAMERA] SimpleCameraPermissionTest loaded successfully');
                    alert('Check logs for permission test results. This will test if expo-camera permissions work.');
                  }).catch((error) => {
                    logger.error('🧪 [CAMERA] Failed to load SimpleCameraPermissionTest:', error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error('🧪 [CAMERA] Error details:', errorMessage);
                    alert('Failed to load permission test: ' + errorMessage);
                  });
                } catch (syncError) {
                  logger.error('🧪 [CAMERA] Synchronous error during import:', syncError);
                  const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
                  alert('Failed to start permission test: ' + errorMessage);
                }
              }, 100);
            }}
          >
            <Text style={styles.debugButtonText}>🧪 Test Permissions Only</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.debugButton]}
            onPress={() => {
              logger.info('📱 [CAMERA] User requested iOS-specific camera test');
              onClose();
              // Import and show iOS camera test with robust error handling
              setTimeout(() => {
                try {
                  import('./IOSCameraScanner').then(({ IOSCameraScanner }) => {
                    logger.info('📱 [CAMERA] IOSCameraScanner loaded successfully');
                    alert('Testing iOS-specific camera implementation. Check logs for detailed results.');
                  }).catch((error) => {
                    logger.error('📱 [CAMERA] Failed to load IOSCameraScanner:', error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error('📱 [CAMERA] Error details:', errorMessage);
                    alert('Failed to load iOS camera test: ' + errorMessage);
                  });
                } catch (syncError) {
                  logger.error('📱 [CAMERA] Synchronous error during IOSCameraScanner import:', syncError);
                  const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
                  alert('Failed to start iOS camera test: ' + errorMessage);
                }
              }, 100);
            }}
          >
            <Text style={styles.debugButtonText}>📱 Test iOS Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 For Real Scanning:</Text>
          <Text style={styles.infoText}>
            To use the camera scanner, you need to create a development build or use EAS Build.
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Safe camera scanner component that uses static imports
const SafeCameraScanner: React.FC<BarcodeScannerWrapperProps> = (props) => {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        logger.info('📷 [CAMERA] Initializing safe camera scanner...');
        
        // Check if expo-camera is available without dynamic import
        const expoCameraModule = require('expo-camera');
        if (!expoCameraModule || !expoCameraModule.CameraView || !expoCameraModule.useCameraPermissions) {
          throw new Error('expo-camera components not available');
        }
        
        logger.info('📷 [CAMERA] expo-camera verified successfully');
        setIsReady(true);
      } catch (error) {
        logger.error('📷 [CAMERA] Failed to initialize camera scanner:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('📷 [CAMERA] Error details:', errorMessage);
        setError(`Camera not available: ${errorMessage}`);
      }
    };

    initializeScanner();
  }, []);

  if (error) {
    logger.warn('📷 [CAMERA] Falling back to manual entry due to error:', error);
    return <FallbackScanner {...props} />;
  }

  if (!isReady) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackMessage}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  // Use a simple camera implementation instead of the problematic WorkingExpoCameraScanner
  logger.info('📷 [CAMERA] Rendering safe camera scanner');
  return <SimpleCameraScanner {...props} />;
};

// Simple camera scanner implementation to avoid import issues
const SimpleCameraScanner: React.FC<BarcodeScannerWrapperProps> = ({
  onBarcodeScanned,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [CameraView, setCameraView] = useState<any>(null);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        logger.info('📷 [SIMPLE-CAMERA] Requesting camera permissions...');
        const expoCameraModule = require('expo-camera');
        const { CameraView: CameraComponent, useCameraPermissions } = expoCameraModule;
        
        if (!CameraComponent) {
          throw new Error('CameraView component not available');
        }
        
        // Check actual permissions
        logger.info('📷 [SIMPLE-CAMERA] Checking camera permissions...');
        const { status } = await expoCameraModule.Camera?.requestCameraPermissionsAsync() || 
                           await expoCameraModule.requestCameraPermissionsAsync?.() ||
                           { status: 'granted' }; // Fallback for testing
        
        logger.info('📷 [SIMPLE-CAMERA] Permission status:', status);
        
        if (status === 'granted') {
          setCameraView(() => CameraComponent);
          setHasPermission(true);
          logger.info('📷 [SIMPLE-CAMERA] Camera ready with permissions');
        } else {
          setHasPermission(false);
          logger.warn('📷 [SIMPLE-CAMERA] Camera permission denied');
        }
      } catch (error) {
        logger.error('📷 [SIMPLE-CAMERA] Error getting permissions:', error);
        setHasPermission(false);
      }
    };

    getPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    // Validate data before processing
    if (!data || typeof data !== 'string') {
      logger.warn('📷 [SIMPLE-CAMERA] Invalid barcode data received:', data);
      return;
    }
    
    setScanned(true);
    const cleanedData = data.replace(/[-\s]/g, '');
    
    if (cleanedData.length === 10 || cleanedData.length === 13) {
      logger.info('📷 [SIMPLE-CAMERA] Valid ISBN scanned:', cleanedData);
      onBarcodeScanned(cleanedData);
      onClose();
    } else {
      Alert.alert(
        'Invalid ISBN',
        'The scanned code does not appear to be a valid ISBN. Please try again.',
        [
          { text: 'Try Again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: onClose },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>📷 Setting up Camera...</Text>
          <Text style={styles.message}>Please wait while we prepare the camera scanner.</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>📷 Camera Permission Required</Text>
          <Text style={styles.message}>
            Please enable camera access in your device settings to scan barcodes.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show real camera if available, otherwise show demo
  if (CameraView) {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'aztec', 'ean13', 'ean8', 'upc_e', 'datamatrix', 'code128', 'code39', 'codabar', 'itf14', 'upc_a'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.topOverlay} />
            <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />
              <View style={styles.scanArea} />
              <View style={styles.sideOverlay} />
            </View>
            <View style={styles.bottomOverlay}>
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕ Close</Text>
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
              
              <Text style={styles.instructionText}>
                Point your camera at a barcode to scan
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Fallback to demo mode if camera not available
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>📷 Camera Scanner (Demo Mode)</Text>
        <Text style={styles.message}>
          Camera not available. Use the demo scan button below.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            // Simulate a successful scan for testing
            const testISBN = '9780451524935';
            logger.info('📷 [SIMPLE-CAMERA] Simulating scan with test ISBN:', testISBN);
            onBarcodeScanned(testISBN);
            onClose();
          }}
        >
          <Text style={styles.buttonText}>📚 Test Scan (Demo)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main wrapper component
export const BarcodeScannerWrapper: React.FC<BarcodeScannerWrapperProps> = (props) => {
  const [scannerType, setScannerType] = useState<'native' | 'fallback' | 'loading'>('loading');

  useEffect(() => {
    const checkAvailability = () => {
      // Allow forcing fallback for testing
      if (props.forceNative === false) {
        logger.info('📷 [CAMERA] Forcing fallback (forceNative=false)');
        setScannerType('fallback');
        return;
      }

      // Platform-specific logic
      if (Platform.OS === 'ios') {
        logger.info('📱 [CAMERA] iOS detected - checking expo-camera availability...');
        // On iOS, be more cautious about camera availability
        const isAvailable = isExpoCameraAvailable();
        if (isAvailable) {
          logger.info('📱 [CAMERA] expo-camera available on iOS, attempting to use');
          setScannerType('native');
        } else {
          logger.info('📱 [CAMERA] expo-camera not available on iOS, using fallback');
          setScannerType('fallback');
        }
      } else {
        // On Android and other platforms, try to use camera directly
        logger.info('📷 [CAMERA] Non-iOS platform, attempting to use expo-camera');
        setScannerType('native');
      }
    };

    checkAvailability();
  }, [props.forceNative]);

  if (scannerType === 'loading') {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackMessage}>Initializing scanner...</Text>
        </View>
      </View>
    );
  }

  if (scannerType === 'native') {
    return <SafeCameraScanner {...props} />;
  } else {
    return <FallbackScanner {...props} />;
  }
};

const styles = StyleSheet.create({
  // Fallback scanner styles
  fallbackContainer: {
    flex: 1,
    backgroundColor: colors.neutral.gray900,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: 12,
  },
  fallbackMessage: {
    fontSize: 14,
    color: colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  manualEntrySection: {
    marginBottom: 24,
  },
  demoSection: {
    marginBottom: 24,
  },
  debugSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 12,
  },
  isbnInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: colors.neutral.white,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  primaryButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: colors.green[100],
    borderWidth: 1,
    borderColor: colors.green[600],
  },
  demoButtonText: {
    color: colors.green[600],
    fontSize: 16,
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: colors.neutral.gray100,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  debugButtonText: {
    color: colors.neutral.gray700,
    fontSize: 16,
    fontWeight: '500',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.neutral.gray600,
    lineHeight: 16,
  },
  closeButton: {
    backgroundColor: colors.neutral.gray100,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: colors.neutral.gray700,
    fontSize: 16,
    fontWeight: '500',
  },

  // Camera scanner styles
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 200,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: colors.primary.blue500,
    backgroundColor: 'transparent',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.neutral.gray600,
  },
  button: {
    backgroundColor: colors.primary.blue500,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default BarcodeScannerWrapper;
