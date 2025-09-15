import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logger } from '../utils/logger';

interface TestModalComponentProps {
  onClose: () => void;
}

export const TestModalComponent: React.FC<TestModalComponentProps> = ({ onClose }) => {
  logger.info('🧪 [TEST-MODAL] Component rendered successfully');
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 TEST MODAL</Text>
        <Text style={styles.message}>
          If you can see this, the modal is working correctly!
        </Text>
        <Text style={styles.info}>
          This confirms that the modal system is functional.
          The issue is likely with the camera component rendering.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close Test Modal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.9)', // Red background to make it very visible
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'red',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
