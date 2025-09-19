import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { PanoramaViewerSafe } from '../components/PanoramaViewerSafe';

// Small example base64 image (1x1 pixel for testing)
const EXAMPLE_PANORAMA_BASE64 = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

// You can replace this with a real panoramic image base64
const REAL_PANORAMA_BASE64 = `// Pega tu imagen base64 aquí`.trim();

export const Scene360TestScreenSafe: React.FC = () => {
  const [useGyro, setUseGyro] = useState(true);
  const [currentImage, setCurrentImage] = useState<'example' | 'real' | 'url'>('url');
  const [showViewer, setShowViewer] = useState(false);

  const getImageSource = () => {
    switch (currentImage) {
      case 'example':
        return { base64: EXAMPLE_PANORAMA_BASE64 };
      case 'real':
        if (REAL_PANORAMA_BASE64.startsWith('//') || REAL_PANORAMA_BASE64.length < 100) {
          // Fallback to example if no real base64 is provided
          return { base64: EXAMPLE_PANORAMA_BASE64 };
        }
        return { base64: REAL_PANORAMA_BASE64 };
      case 'url':
        // Using a real panoramic image URL for testing
        return { uri: 'https://pannellum.org/images/cerro-toco-0.jpg' };
      default:
        return { base64: EXAMPLE_PANORAMA_BASE64 };
    }
  };

  if (showViewer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowViewer(false)}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <View style={styles.gyroToggle}>
            <Text style={styles.gyroToggleText}>Giroscopio</Text>
            <Switch
              value={useGyro}
              onValueChange={setUseGyro}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={useGyro ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <PanoramaViewerSafe
          imageSource={getImageSource()}
          useGyro={useGyro}
          initialYaw={0}
          initialPitch={0}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visor 360° (Modo Seguro)</Text>
        <Text style={styles.subtitle}>
          Solo Three.js - Sin WebView - Más estable en iOS
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Selecciona Imagen de Prueba</Text>
          
          <TouchableOpacity
            style={[
              styles.optionButton,
              currentImage === 'example' && styles.optionButtonActive
            ]}
            onPress={() => setCurrentImage('example')}
          >
            <Text style={styles.optionButtonText}>
              🔹 Imagen de Ejemplo (1x1 pixel)
            </Text>
            <Text style={styles.optionButtonSubtext}>
              Para probar funcionalidad básica
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              currentImage === 'url' && styles.optionButtonActive
            ]}
            onPress={() => setCurrentImage('url')}
          >
            <Text style={styles.optionButtonText}>
              🌐 URL de Prueba (Recomendado)
            </Text>
            <Text style={styles.optionButtonSubtext}>
              Imagen panorámica real desde internet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              currentImage === 'real' && styles.optionButtonActive
            ]}
            onPress={() => setCurrentImage('real')}
          >
            <Text style={styles.optionButtonText}>
              📷 Imagen Real Base64
            </Text>
            <Text style={styles.optionButtonSubtext}>
              {REAL_PANORAMA_BASE64.startsWith('//') ? 
                'No configurada - usará ejemplo' : 
                'Imagen personalizada configurada'
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Giroscopio</Text>
            <Switch
              value={useGyro}
              onValueChange={setUseGyro}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={useGyro ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setShowViewer(true)}
        >
          <Text style={styles.startButtonText}>🚀 Iniciar Visor Seguro</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🛡️ Modo Seguro</Text>
          <Text style={styles.infoText}>
            Esta versión usa solo Three.js sin WebView para evitar crashes en iOS.
          </Text>
          <Text style={styles.infoText}>
            • ✅ Más estable en dispositivos iOS
          </Text>
          <Text style={styles.infoText}>
            • ✅ Soporte completo de giroscopio
          </Text>
          <Text style={styles.infoText}>
            • ✅ Control táctil como fallback
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    flex: 1,
  },
  backButton: {
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gyroToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gyroToggleText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#28a745',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
