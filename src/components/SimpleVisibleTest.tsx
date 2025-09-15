import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { logger } from '../utils/logger';

interface SimpleVisibleTestProps {
  onClose: () => void;
  onBarcodeScanned: (isbn: string) => void;
}

export const SimpleVisibleTest: React.FC<SimpleVisibleTestProps> = ({ onClose, onBarcodeScanned }) => {
  logger.info('🟢 [VISIBLE-TEST] Component rendered - THIS SHOULD BE VISIBLE!');
  
  const handleTestScan = () => {
    const testISBN = '9780451524935';
    logger.info('🟢 [VISIBLE-TEST] Simulating scan with ISBN:', testISBN);
    onBarcodeScanned(testISBN);
    onClose(); // Close scanner immediately after successful scan
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🟢 CAMERA WORKING!</Text>
        <Text style={styles.subtitle}>If you can see this, the modal system works!</Text>
        
        <Text style={styles.message}>
          The camera component is loading correctly.
          This proves the issue was with modal configuration.
        </Text>
        
        <TouchableOpacity style={styles.scanButton} onPress={handleTestScan}>
          <Text style={styles.scanButtonText}>📚 Simulate Book Scan</Text>
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
    backgroundColor: '#4CAF50', // Solid green background - NO transparency
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Highest z-index
  },
  content: {
    backgroundColor: '#2E7D32', // Darker green for contrast
    padding: 30,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'white',
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
    color: 'white',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#757575',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
