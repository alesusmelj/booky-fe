// EJEMPLO RÁPIDO: Cómo probar Scene360 inmediatamente
// Copia este código en tu App.tsx para probar rápidamente

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Scene360TestScreen } from './src/screens/Scene360TestScreen';

// Componente simple para alternar entre home y test
export default function App() {
  const [showTest, setShowTest] = React.useState(false);

  if (showTest) {
    return <Scene360TestScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌐 Booky - Visor 360°</Text>
        <Text style={styles.subtitle}>
          Prueba la funcionalidad de panorama 360° con giroscopio
        </Text>
        
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => setShowTest(true)}
        >
          <Text style={styles.testButtonText}>🚀 Probar Visor 360°</Text>
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={styles.infoTitle}>¿Qué puedes probar?</Text>
          <Text style={styles.infoText}>• Panorama 360° con imagen de ejemplo</Text>
          <Text style={styles.infoText}>• Control por giroscopio (mueve el teléfono)</Text>
          <Text style={styles.infoText}>• Control táctil (drag para rotar)</Text>
          <Text style={styles.infoText}>• Zoom y controles de navegación</Text>
          <Text style={styles.infoText}>• Fallback automático si hay problemas</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 22,
  },
  testButton: {
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
  testButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});

// INSTRUCCIONES RÁPIDAS:
// 1. Reemplaza tu App.tsx con este código
// 2. Instala dependencias: npx expo install expo-sensors expo-gl expo-three expo-asset expo-file-system react-native-webview
// 3. npm install three @types/three
// 4. npx expo start
// 5. Presiona el botón "Probar Visor 360°"
// 6. Selecciona "URL Externa" para ver un panorama real
// 7. Activa el giroscopio y mueve tu dispositivo!
