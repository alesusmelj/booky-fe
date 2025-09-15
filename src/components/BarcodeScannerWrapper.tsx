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
    if (manualISBN.trim()) {
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
              // Import and show simple permission test
              setTimeout(() => {
                import('./SimpleCameraPermissionTest').then(({ SimpleCameraPermissionTest }) => {
                  // This is a quick test - in a real app you'd handle this better
                  logger.info('🧪 [CAMERA] SimpleCameraPermissionTest loaded successfully');
                  alert('Check logs for permission test results. This will test if expo-camera permissions work.');
                }).catch((error) => {
                  logger.error('🧪 [CAMERA] Failed to load SimpleCameraPermissionTest:', error);
                  alert('Failed to load permission test: ' + error.message);
                });
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
              // Import and show iOS camera test
              setTimeout(() => {
                import('./IOSCameraScanner').then(({ IOSCameraScanner }) => {
                  logger.info('📱 [CAMERA] IOSCameraScanner loaded successfully');
                  alert('Testing iOS-specific camera implementation. Check logs for detailed results.');
                }).catch((error) => {
                  logger.error('📱 [CAMERA] Failed to load IOSCameraScanner:', error);
                  alert('Failed to load iOS camera test: ' + error.message);
                });
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

// Dynamic import component for expo-camera scanner
const DynamicCameraScanner: React.FC<BarcodeScannerWrapperProps> = (props) => {
  const [CameraScannerComponent, setCameraScannerComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCameraScanner = async () => {
      try {
        logger.info('📷 [CAMERA] Starting to load camera component...');
        
        // Load the real camera component now that modal system works
        const { WorkingExpoCameraScanner } = await import('./WorkingExpoCameraScanner');
        logger.info('📷 [CAMERA] WorkingExpoCameraScanner imported successfully');
        
        setCameraScannerComponent(() => WorkingExpoCameraScanner);
        logger.info('📷 [CAMERA] WorkingExpoCameraScanner component set successfully');
      } catch (error) {
        logger.error('📷 [CAMERA] Failed to load camera scanner:', error);
        logger.error('📷 [CAMERA] Error details:', error instanceof Error ? error.message : String(error));
        setError('Failed to load camera scanner');
      } finally {
        setLoading(false);
      }
    };

    loadCameraScanner();
  }, []);

  if (loading) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackMessage}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (error || !CameraScannerComponent) {
    logger.warn('📷 [CAMERA] Falling back to manual entry due to error:', error);
    logger.warn('📷 [CAMERA] Component loaded:', !!CameraScannerComponent);
    return <FallbackScanner {...props} />;
  }

  logger.info('📷 [CAMERA] Rendering CameraScannerComponent successfully');
  return <CameraScannerComponent {...props} />;
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
    return <DynamicCameraScanner {...props} />;
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
});

export default BarcodeScannerWrapper;
