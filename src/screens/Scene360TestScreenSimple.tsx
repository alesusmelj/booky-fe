import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

// Simple test screen to diagnose crash issues
export const Scene360TestScreenSimple: React.FC = () => {
  const [step, setStep] = useState<'menu' | 'loading' | 'viewer'>('menu');

  const handleStartTest = () => {
    try {
      console.log('Starting 360 test...');
      setStep('loading');
      
      // Simulate loading
      setTimeout(() => {
        console.log('Loading complete, showing viewer...');
        setStep('viewer');
      }, 1000);
      
    } catch (error) {
      console.error('Error in handleStartTest:', error);
      Alert.alert('Error', 'Error al iniciar la prueba: ' + error.message);
      setStep('menu');
    }
  };

  const handleGoBack = () => {
    try {
      console.log('Going back to menu...');
      setStep('menu');
    } catch (error) {
      console.error('Error in handleGoBack:', error);
      Alert.alert('Error', 'Error al volver: ' + error.message);
    }
  };

  if (step === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Cargando...</Text>
          <Text style={styles.subtitle}>Preparando visor 360°</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'viewer') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerContent}>
          <Text style={styles.title}>Visor 360° (Simulado)</Text>
          <Text style={styles.subtitle}>
            Esta es una versión simplificada para diagnosticar problemas
          </Text>
          
          <View style={styles.mockViewer}>
            <Text style={styles.mockViewerText}>
              🌐 Aquí iría el visor 360°
            </Text>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlButtonText}>🎯 Centrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlButtonText}>🔄 Giroscopio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Menu screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prueba 360° (Diagnóstico)</Text>
        <Text style={styles.subtitle}>
          Versión simplificada para diagnosticar problemas
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartTest}
        >
          <Text style={styles.startButtonText}>🚀 Iniciar Prueba Simple</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Información de Diagnóstico</Text>
          <Text style={styles.infoText}>
            Esta versión simplificada ayuda a identificar si el problema está en:
          </Text>
          <Text style={styles.infoText}>• La navegación básica</Text>
          <Text style={styles.infoText}>• Los componentes React Native</Text>
          <Text style={styles.infoText}>• El WebView o Three.js</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#007AFF',
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
  backButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mockViewer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  mockViewerText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
