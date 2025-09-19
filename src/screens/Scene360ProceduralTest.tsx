import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SimpleImageViewer } from '../components/SimpleImageViewer';

export const Scene360ProceduralTest: React.FC = () => {
  const [useGyro, setUseGyro] = useState(true);
  const [showViewer, setShowViewer] = useState(false);

  const handleStartTest = () => {
    console.log('🧪 [PROCEDURAL-TEST] Iniciando test de panorama procedural');
    setShowViewer(true);
  };

  const handleBack = () => {
    setShowViewer(false);
  };

  if (showViewer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎨 Panorama Procedural</Text>
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
            imageSource={{}} // Vacío para forzar textura procedural
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
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Panorama Procedural para iOS</Text>
          <Text style={styles.subtitle}>Solución sin dependencia de red</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🍎 Solución Específica para iOS</Text>
          <Text style={styles.infoText}>
            Basado en tus pruebas, todas las imágenes HTTP dan timeout y Base64 también falla. 
            Esta solución crea una textura panorámica directamente en memoria, sin necesidad de cargar archivos externos.
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Características del Panorama Procedural:</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>🌤️ Cielo azul con nubes blancas</Text>
            <Text style={styles.featureItem}>🏔️ Montañas grises realistas</Text>
            <Text style={styles.featureItem}>🌱 Tierra verde en la base</Text>
            <Text style={styles.featureItem}>📐 Líneas de referencia amarillas cada 45°</Text>
            <Text style={styles.featureItem}>🔄 Wrap-around 360° perfecto</Text>
            <Text style={styles.featureItem}>⚡ Carga instantánea (sin red)</Text>
          </View>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>🎯 Beneficios:</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>✅ Sin timeouts de red</Text>
            <Text style={styles.benefitItem}>✅ Sin problemas de CORS</Text>
            <Text style={styles.benefitItem}>✅ Sin conversión Base64</Text>
            <Text style={styles.benefitItem}>✅ Funciona offline</Text>
            <Text style={styles.benefitItem}>✅ Carga instantánea</Text>
            <Text style={styles.benefitItem}>✅ Calidad consistente</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Text style={styles.startButtonText}>🚀 Iniciar Panorama Procedural</Text>
          <Text style={styles.startButtonSubtext}>
            Experiencia 360° garantizada sin dependencias externas
          </Text>
        </TouchableOpacity>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Qué Esperar:</Text>
          <Text style={styles.instructionsText}>
            • Carga instantánea (sin esperas){'\n'}
            • Paisaje realista con cielo, montañas y tierra{'\n'}
            • Líneas amarillas de referencia para orientación{'\n'}
            • Giroscopio funcionando suavemente{'\n'}
            • Experiencia 360° completa sin bordes negros
          </Text>
        </View>

        <View style={styles.technicalCard}>
          <Text style={styles.technicalTitle}>🔧 Detalles Técnicos:</Text>
          <Text style={styles.technicalText}>
            • Textura: 2048x1024 píxeles (calidad HD){'\n'}
            • Formato: DataTexture con RGBA{'\n'}
            • Generación: Algoritmos matemáticos en tiempo real{'\n'}
            • Memoria: ~8MB (eficiente){'\n'}
            • Compatibilidad: 100% React Native/iOS
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 10,
  },
  featuresList: {
    marginLeft: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 18,
  },
  benefitsCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 10,
  },
  benefitsList: {
    marginLeft: 10,
  },
  benefitItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  startButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  technicalCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#607d8b',
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#455a64',
    marginBottom: 10,
  },
  technicalText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
