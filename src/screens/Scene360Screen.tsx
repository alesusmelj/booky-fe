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

  return (
    <SafeAreaView style={styles.container}>
      {!sceneData ? (
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
      ) : (
        <View style={styles.viewerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={resetView}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            
            <View style={styles.gyroToggle}>
              <Text style={styles.gyroLabel}>Giroscopio</Text>
              <Switch value={useGyro} onValueChange={setUseGyro} />
            </View>
          </View>

          <PanoramaViewer
            imageSource={{
              uri: sceneData.imageUrl,
              base64: sceneData.imageBase64,
            }}
            useGyro={useGyro}
            initialYaw={0}
            initialPitch={0}
          />

          <View style={styles.info}>
            <Text style={styles.infoText}>
              Libro: {sceneData.bookId} | Tamaño: {sceneData.size}
            </Text>
          </View>
        </View>
      )}
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
  viewerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  gyroToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gyroLabel: {
    fontSize: 14,
    color: '#333',
  },
  info: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
