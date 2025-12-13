import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { PanoramaViewer } from '../components/PanoramaViewer';
import { generateSceneImage } from '../services/api';

interface SceneImageData {
  imageUrl?: string;
  imageBase64?: string;
  bookId: string;
  craftedPrompt: string;
  size: string;
  createdAt: string;
}

export const Scene360Screen: React.FC = () => {
  const [bookId, setBookId] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sceneData, setSceneData] = useState<SceneImageData | null>(null);
  const [useGyro, setUseGyro] = useState(true);

  const handleGenerateScene = async () => {
    if (!bookId.trim() || !text.trim()) {
      Alert.alert('Error', 'Por favor ingresa el ID del libro y el fragmento de texto');
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateSceneImage({
        bookId: bookId.trim(),
        text: text.trim(),
        style: 'photorealistic',
        seed: Math.floor(Math.random() * 1000),
        returnBase64: false,
        size: '4096x2048',
      });

      setSceneData(response);
    } catch (error) {
      console.error('Error generating scene:', error);
      Alert.alert(
        'Error',
        'No se pudo generar la escena. Verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetView = () => {
    setSceneData(null);
  };

  // When viewing the panorama, render it fullscreen
  if (sceneData) {
    return (
      <PanoramaViewer
        imageSource={{
          uri: sceneData.imageUrl,
          base64: sceneData.imageBase64,
        }}
        useGyro={useGyro}
        initialYaw={0}
        initialPitch={0}
        onClose={resetView}
        showCloseButton={true}
        showControls={true}
      />
    );
  }

  // Form view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.inputContainer}>
        <Text style={styles.title}>Generador de Escenas 360°</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ID del Libro</Text>
          <TextInput
            style={styles.input}
            value={bookId}
            onChangeText={setBookId}
            placeholder="Ej: 123"
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fragmento del Libro</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={text}
            onChangeText={setText}
            placeholder="Ingresa un fragmento narrado del libro..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Usar Giroscopio</Text>
          <Switch
            value={useGyro}
            onValueChange={setUseGyro}
            disabled={isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleGenerateScene}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generar Escena 360°</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
