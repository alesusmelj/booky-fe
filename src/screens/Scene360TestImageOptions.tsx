import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SimpleImageViewer } from '../components/SimpleImageViewer';

interface ImageOption {
  id: string;
  name: string;
  description: string;
  source: { uri?: string; base64?: string };
}

const IMAGE_OPTIONS: ImageOption[] = [
  {
    id: 'picsum-small',
    name: '🖼️ Imagen Pequeña (Picsum)',
    description: 'Imagen 2048x1024 - Rápida de cargar',
    source: { uri: 'https://picsum.photos/2048/1024' }
  },
  {
    id: 'picsum-medium',
    name: '🖼️ Imagen Mediana (Picsum)',
    description: 'Imagen 4096x2048 - Calidad media',
    source: { uri: 'https://picsum.photos/4096/2048' }
  },
  {
    id: 'panorama-original',
    name: '🌐 Panorama Original (Pixabay)',
    description: 'Imagen panorámica real 360°',
    source: { uri: 'https://cdn.pixabay.com/photo/2016/01/05/13/58/360-degree-1123718_1280.jpg' }
  },
  {
    id: 'panorama-hd',
    name: '🌐 Panorama HD (Unsplash)',
    description: 'Panorama alta calidad',
    source: { uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4096&h=2048&fit=crop' }
  },
  {
    id: 'test-base64',
    name: '📄 Imagen Base64',
    description: 'Imagen pequeña embebida en base64',
    source: { 
      base64: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQACADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEBf/EACQQAAIBAwMEAwEAAAAAAAAAAAECAwAEEQUSITFBUWETInGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAAAAQIRAv/aAAwDAQACEQMRAD8A5+iiivQPNFFFABRRRQAUUUUAf//Z'
    }
  }
];

export const Scene360TestImageOptions: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageOption | null>(null);
  const [useGyro, setUseGyro] = useState(true);

  const handleImageSelect = (option: ImageOption) => {
    console.log('🎯 [TEST] Seleccionando imagen:', option.name);
    setSelectedImage(option);
  };

  const handleBack = () => {
    setSelectedImage(null);
  };

  const showImageInfo = (option: ImageOption) => {
    Alert.alert(
      option.name,
      `${option.description}\n\nFuente: ${option.source.uri ? 'URL HTTP' : 'Base64'}\n${option.source.uri || 'Datos embebidos'}`,
      [{ text: 'OK' }]
    );
  };

  if (selectedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedImage.name}</Text>
          <TouchableOpacity 
            style={[styles.gyroButton, useGyro ? styles.gyroOn : styles.gyroOff]}
            onPress={() => setUseGyro(!useGyro)}
          >
            <Text style={styles.gyroButtonText}>
              {useGyro ? '📱 Gyro ON' : '👆 Touch'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewerContainer}>
          <SimpleImageViewer
            imageSource={selectedImage.source}
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
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Prueba de Imágenes 360°</Text>
        <Text style={styles.subtitle}>Selecciona una imagen para probar</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {IMAGE_OPTIONS.map((option) => (
          <View key={option.id} style={styles.optionCard}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleImageSelect(option)}
            >
              <Text style={styles.optionTitle}>{option.name}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
              <Text style={styles.optionSource}>
                {option.source.uri ? '🌐 HTTP' : '📄 Base64'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => showImageInfo(option)}
            >
              <Text style={styles.infoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
          <Text style={styles.instructionsText}>
            • Prueba cada imagen para ver cuál carga mejor en iOS{'\n'}
            • Observa los logs en la consola{'\n'}
            • Si ves cuadrícula azul = fallback (imagen no cargó){'\n'}
            • Si ves imagen real = carga exitosa{'\n'}
            • Usa el botón ℹ️ para ver detalles de cada imagen
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
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
    minWidth: 80,
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
    fontSize: 12,
    fontWeight: '600',
  },
  viewerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButton: {
    flex: 1,
    padding: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  optionSource: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoButton: {
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  infoButtonText: {
    fontSize: 18,
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
