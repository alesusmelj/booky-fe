import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SimpleImageViewer } from './SimpleImageViewer';

interface PanoramaViewerFullscreenProps {
  imageUrl: string;
  onClose: () => void;
}

export const PanoramaViewerFullscreen: React.FC<PanoramaViewerFullscreenProps> = ({
  imageUrl,
  onClose,
}) => {
  useEffect(() => {
    // Forzar orientación horizontal al entrar
    const lockToLandscape = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (error) {
        console.warn('No se pudo bloquear la orientación:', error);
      }
    };

    lockToLandscape();

    // Restaurar orientación al salir
    return () => {
      ScreenOrientation.unlockAsync().catch(console.warn);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Botón de retorno */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onClose}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Visor panorámico */}
      <SimpleImageViewer
        imageSource={{ uri: imageUrl }}
        useGyro={true}
        initialYaw={0}
        initialPitch={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});
