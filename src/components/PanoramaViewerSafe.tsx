import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Alert, Text, TouchableOpacity } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { SimpleImageViewer } from './SimpleImageViewer';

export interface PanoramaViewerSafeProps {
  imageSource: {
    uri?: string;
    base64?: string;
  };
  useGyro?: boolean;
  initialYaw?: number;
  initialPitch?: number;
}

/**
 * Safe version of PanoramaViewer that only uses Three.js
 * Avoids WebView crashes on iOS
 */
export const PanoramaViewerSafe: React.FC<PanoramaViewerSafeProps> = ({
  imageSource,
  useGyro = true,
  initialYaw = 0,
  initialPitch = 0,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUseGyro, setCurrentUseGyro] = useState(useGyro);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleToggleGyro = () => {
    setCurrentUseGyro(!currentUseGyro);
  };

  const handleCenterView = () => {
    // This will be handled by ThreeJSViewer internally
    console.log('Center view requested');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🌐 Cargando Visor 360°...</Text>
          <Text style={styles.loadingSubtext}>Usando Three.js (Modo Seguro)</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Controls overlay */}
      <View style={styles.controlsOverlay}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleCenterView}
        >
          <Text style={styles.controlButtonText}>🎯 Centrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.controlButton,
            currentUseGyro ? styles.controlButtonActive : styles.controlButtonInactive
          ]}
          onPress={handleToggleGyro}
        >
          <Text style={styles.controlButtonText}>
            {currentUseGyro ? '🔄 Giroscopio ON' : '🔄 Giroscopio OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info overlay */}
      <View style={styles.infoOverlay}>
        <Text style={styles.infoText}>
          Modo Seguro: Imagen Simple • {currentUseGyro ? 'Giroscopio Activo' : 'Control Táctil'}
        </Text>
      </View>

      {/* Simple Image Viewer */}
      <SimpleImageViewer
        imageSource={imageSource}
        useGyro={currentUseGyro}
        initialYaw={initialYaw}
        initialPitch={initialPitch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 100,
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderColor: 'rgba(0, 122, 255, 1)',
  },
  controlButtonInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 20,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: 'center',
  },
});
