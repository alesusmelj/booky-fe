import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SimpleImageViewer } from '../components/SimpleImageViewer';

interface ImageTest {
  id: string;
  name: string;
  source: { uri?: string; base64?: string };
}

const SAMPLE_IMAGES: ImageTest[] = [
  {
    id: 'sample-1',
    name: '🌐 Panorama Pequeño (Picsum)',
    source: { uri: 'https://picsum.photos/2048/1024' }
  },
  {
    id: 'sample-2', 
    name: '🏞️ Panorama Real (Pixabay)',
    source: { uri: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/360-degree-1123718_1280.jpg' }
  },
  {
    id: 'sample-3',
    name: '🌅 Panorama HD (Unsplash)',
    source: { uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4096&h=2048&fit=crop' }
  }
];

export const Scene360CustomImageTest: React.FC = () => {
  const [customUrl, setCustomUrl] = useState('');
  const [customBase64, setCustomBase64] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri?: string; base64?: string } | null>(null);
  const [useGyro, setUseGyro] = useState(true);
  const [testName, setTestName] = useState('');

  const handleCustomUrl = () => {
    if (!customUrl.trim()) {
      Alert.alert('Error', 'Por favor ingresa una URL válida');
      return;
    }
    
    console.log('🧪 [CUSTOM-TEST] Probando URL personalizada:', customUrl);
    setSelectedImage({ uri: customUrl.trim() });
    setTestName(`URL: ${customUrl.substring(0, 50)}...`);
  };

  const handleCustomBase64 = () => {
    if (!customBase64.trim()) {
      Alert.alert('Error', 'Por favor ingresa datos Base64 válidos');
      return;
    }
    
    console.log('🧪 [CUSTOM-TEST] Probando Base64 personalizado, length:', customBase64.length);
    setSelectedImage({ base64: customBase64.trim() });
    setTestName(`Base64: ${customBase64.length} caracteres`);
  };

  const handleSampleImage = (sample: ImageTest) => {
    console.log('🧪 [CUSTOM-TEST] Probando imagen de muestra:', sample.name);
    setSelectedImage(sample.source);
    setTestName(sample.name);
  };

  const handleProceduralTest = () => {
    console.log('🧪 [CUSTOM-TEST] Probando panorama procedural');
    setSelectedImage({});
    setTestName('🎨 Panorama Procedural');
  };

  const handleBack = () => {
    setSelectedImage(null);
    setTestName('');
  };

  if (selectedImage !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{testName}</Text>
          <TouchableOpacity 
            style={[styles.gyroButton, useGyro ? styles.gyroOn : styles.gyroOff]}
            onPress={() => setUseGyro(!useGyro)}
          >
            <Text style={styles.gyroButtonText}>
              {useGyro ? '📱 Gyro' : '👆 Touch'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewerContainer}>
          <SimpleImageViewer
            imageSource={selectedImage}
            useGyro={useGyro}
            initialYaw={0}
            initialPitch={0}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>🖼️ Prueba Tu Propia Imagen 360°</Text>
          <Text style={styles.subtitle}>
            Carga imágenes personalizadas con fallback garantizado
          </Text>
        </View>

        {/* Sección URL personalizada */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>🌐 URL de Imagen</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://ejemplo.com/mi-panorama.jpg"
            value={customUrl}
            onChangeText={setCustomUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.testButton} onPress={handleCustomUrl}>
            <Text style={styles.testButtonText}>🚀 Probar URL</Text>
          </TouchableOpacity>
        </View>

        {/* Sección Base64 personalizada */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>📄 Imagen Base64</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
            value={customBase64}
            onChangeText={setCustomBase64}
            multiline
            numberOfLines={3}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.testButton} onPress={handleCustomBase64}>
            <Text style={styles.testButtonText}>🚀 Probar Base64</Text>
          </TouchableOpacity>
        </View>

        {/* Imágenes de muestra */}
        <View style={styles.samplesSection}>
          <Text style={styles.sectionTitle}>🧪 Imágenes de Muestra</Text>
          {SAMPLE_IMAGES.map((sample) => (
            <TouchableOpacity
              key={sample.id}
              style={styles.sampleButton}
              onPress={() => handleSampleImage(sample)}
            >
              <Text style={styles.sampleButtonText}>{sample.name}</Text>
              <Text style={styles.sampleButtonUrl}>
                {sample.source.uri?.substring(0, 60)}...
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Panorama procedural */}
        <View style={styles.proceduralSection}>
          <TouchableOpacity style={styles.proceduralButton} onPress={handleProceduralTest}>
            <Text style={styles.proceduralButtonText}>🎨 Panorama Procedural</Text>
            <Text style={styles.proceduralButtonSubtext}>
              Fallback garantizado - Siempre funciona
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instrucciones */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>📋 Cómo Funciona:</Text>
          <Text style={styles.instructionsText}>
            1. <Text style={styles.bold}>Imagen Real</Text>: Si tu imagen carga correctamente, la verás en 360°{'\n'}
            2. <Text style={styles.bold}>Fallback Automático</Text>: Si falla, verás el panorama procedural{'\n'}
            3. <Text style={styles.bold}>Logs Detallados</Text>: Revisa la consola para ver qué pasó{'\n'}
            4. <Text style={styles.bold}>Sin Crashes</Text>: El sistema nunca se colgará
          </Text>
        </View>

        {/* Consejos */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Consejos para Mejores Resultados:</Text>
          <Text style={styles.tipsText}>
            • <Text style={styles.bold}>URLs HTTPS</Text>: Usa siempre URLs seguras{'\n'}
            • <Text style={styles.bold}>Formato Equirectangular</Text>: Proporción 2:1 (ej: 4096x2048){'\n'}
            • <Text style={styles.bold}>Tamaño Moderado</Text>: Imágenes muy grandes pueden dar timeout{'\n'}
            • <Text style={styles.bold}>Base64 Pequeño</Text>: Para Base64, usa imágenes comprimidas
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gyroButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  gyroOn: {
    backgroundColor: '#34C759',
  },
  gyroOff: {
    backgroundColor: '#FF9500',
  },
  gyroButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  viewerContainer: {
    flex: 1,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  samplesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sampleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  sampleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sampleButtonUrl: {
    fontSize: 12,
    color: '#666',
  },
  proceduralSection: {
    marginBottom: 20,
  },
  proceduralButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  proceduralButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proceduralButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  instructionsSection: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});
