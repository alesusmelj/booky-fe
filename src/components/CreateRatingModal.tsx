import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, theme } from '../constants';
import { useRating } from '../hooks/useRating';

interface CreateRatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  exchangeId: string;
  otherUserName: string;
  onSuccess?: () => void;
}

export function CreateRatingModal({
  isVisible,
  onClose,
  exchangeId,
  otherUserName,
  onSuccess
}: CreateRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { createRating, loading } = useRating();

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    const ratingData = {
      rating,
      comment: comment.trim() || undefined,
    };

    const result = await createRating(exchangeId, ratingData);

    if (result) {
      Alert.alert(
        'Éxito',
        'Tu reseña ha sido enviada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess?.();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', 'No se pudo enviar la reseña. Inténtalo de nuevo.');
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={star <= rating ? 'star' : 'star-border'}
              size={32}
              color={star <= rating ? colors.status.warning : colors.neutral.gray400}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.container}>
                  <View style={styles.header}>
                    <Text style={styles.title}>Calificar Intercambio</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                      <MaterialIcons name="close" size={24} color={colors.neutral.gray600} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subtitle}>
                    ¿Cómo fue tu experiencia con {otherUserName}?
                  </Text>

                  <View style={styles.content}>
                    <Text style={styles.label}>Calificación</Text>
                    {renderStars()}

                    <Text style={styles.label}>Comentario (opcional)</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Comparte tu experiencia del intercambio..."
                      placeholderTextColor={colors.neutral.gray400}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleClose}
                        disabled={loading}
                      >
                        <Text style={styles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.submitButton, (rating === 0 || loading) && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || loading}
                      >
                        <Text style={[styles.submitText, (rating === 0 || loading) && styles.disabledText]}>
                          {loading ? 'Enviando...' : 'Enviar Reseña'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.text.primary,
    minHeight: 100,
    maxHeight: 120,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray600,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.white,
  },
  disabledButton: {
    backgroundColor: colors.neutral.gray300,
  },
  disabledText: {
    color: colors.neutral.gray500,
  },
});
