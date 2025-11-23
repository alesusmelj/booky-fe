import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SimpleImageViewer } from './SimpleImageViewer';

interface PanoramaViewerMeetingProps {
  imageUrl: string;
  onClose: () => void;
}

export const PanoramaViewerMeeting: React.FC<PanoramaViewerMeetingProps> = ({
  imageUrl,
  onClose,
}) => {
  useEffect(() => {
    // Forzar orientación horizontal para mejor experiencia panorámica
    const lockToLandscape = async () => {
      try {
        // Permitir AMBAS orientaciones landscape (izquierda y derecha)
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        console.log('🔄 [PANORAMA] Orientación forzada a horizontal (ambas direcciones)');
      } catch (error) {
        console.warn('No se pudo bloquear la orientación a horizontal:', error);
      }
    };

    lockToLandscape();

    // Restaurar orientación al salir
    return () => {
      ScreenOrientation.unlockAsync()
        .then(() => console.log('🔓 [PANORAMA] Orientación desbloqueada'))
        .catch(console.warn);
    };
  }, []);

  // Obtener dimensiones completas de la pantalla
  const { width, height } = Dimensions.get('screen');

  return (
    <View style={[styles.container, { width, height }]}>
      <StatusBar hidden={true} />
      
      {/* Botón de retorno flotante */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onClose}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Visor panorámico ocupando absolutamente toda la pantalla */}
      <View style={[styles.viewerContainer, { width, height }]}>
        <SimpleImageViewer
          imageSource={{ uri: imageUrl }}
          useGyro={true}
          initialYaw={0}
          initialPitch={0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 9999,
  },
  viewerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
