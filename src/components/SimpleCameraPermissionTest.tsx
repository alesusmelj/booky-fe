import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { logger } from '../utils/logger';
import { colors } from '../constants';

interface SimpleCameraPermissionTestProps {
  onClose: () => void;
}

export const SimpleCameraPermissionTest: React.FC<SimpleCameraPermissionTestProps> = ({ onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      logger.info('🧪 [PERMISSION-TEST] Component mounted');
      logger.info('🧪 [PERMISSION-TEST] Initial permission state:', permission);
    } catch (err) {
      logger.error('🧪 [PERMISSION-TEST] Error during mount:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    try {
      logger.info('🧪 [PERMISSION-TEST] Permission changed:', permission);
    } catch (err) {
      logger.error('🧪 [PERMISSION-TEST] Error during permission change:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [permission]);

  const handleRequestPermission = async () => {
    logger.info('🧪 [PERMISSION-TEST] User requested permission');
    
    try {
      logger.info('🧪 [PERMISSION-TEST] Calling requestPermission()...');
      const result = await requestPermission();
      logger.info('🧪 [PERMISSION-TEST] Permission result:', result);
      
      Alert.alert(
        'Permission Result',
        `Status: ${result.status}\nGranted: ${result.granted}\nCan Ask Again: ${result.canAskAgain}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      logger.error('🧪 [PERMISSION-TEST] Error requesting permission:', error);
      Alert.alert(
        'Error',
        `Failed to request permission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>❌ Permission Test Error</Text>
          <Text style={styles.info}>
            Error: {error}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Camera Permission Test</Text>
        
        <Text style={styles.info}>
          Current Status: {permission?.status || 'loading...'}
          {'\n'}Granted: {permission?.granted ? 'Yes' : 'No'}
          {'\n'}Can Ask Again: {permission?.canAskAgain ? 'Yes' : 'No'}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
          <Text style={styles.buttonText}>Request Camera Permission</Text>
        </TouchableOpacity>

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
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: colors.neutral.gray100,
    padding: 10,
    borderRadius: 5,
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
