import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants';
import { logger } from '../utils/logger';

const { width, height } = Dimensions.get('window');

interface TestOverlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TestOverlayModal: React.FC<TestOverlayModalProps> = ({ visible, onClose }) => {
  logger.info('🔴 [TestOverlayModal] Rendered with visible:', visible);

  if (!visible) {
    logger.info('🔴 [TestOverlayModal] Not visible, returning null');
    return null;
  }

  logger.info('🔴 [TestOverlayModal] Rendering overlay content');

  return (
    <View style={styles.overlay}>
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      <View style={styles.backdrop} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.neutral.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔴 OVERLAY MODAL TEST 🔴</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>🎉 OVERLAY MODAL IS WORKING! 🎉</Text>
          <Text style={styles.subtitle}>This is a custom overlay implementation</Text>
          <Text style={styles.subtitle}>Position: absolute with highest z-index</Text>
          <Text style={styles.subtitle}>Screen size: {width}x{height}</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              Alert.alert('Success', 'Overlay modal button works!');
              onClose();
            }}
          >
            <MaterialIcons name="check-circle" size={20} color="#FF0000" />
            <Text style={styles.testButtonText}>SUCCESS - Close Modal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButtonBottom}
            onPress={() => {
              logger.info('🔴 [TestOverlayModal] Close button pressed');
              Alert.alert('Debug', 'Overlay close button pressed!');
              onClose();
            }}
          >
            <Text style={styles.closeButtonText}>Close Overlay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999, // Maximum z-index
    elevation: 999999, // Android elevation
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    backgroundColor: '#FF0000', // Bright red
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF0000',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: 16,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    minHeight: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.white,
    marginBottom: 15,
    textAlign: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  testButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButtonBottom: {
    backgroundColor: colors.neutral.gray800,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
