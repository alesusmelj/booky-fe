import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors } from '../constants';
import { Calendar, TimePicker } from './';

interface SetMeetingModalProps {
  visible: boolean;
  clubName: string;
  onClose: () => void;
  onSetMeeting: (meetingData: {
    chapter: number;
    nextMeeting: string;
  }) => void;
}

export const SetMeetingModal: React.FC<SetMeetingModalProps> = ({
  visible,
  clubName,
  onClose,
  onSetMeeting,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number } | undefined>(undefined);
  const [chapter, setChapter] = useState('');

  const handleSetMeeting = () => {
    if (selectedDate && selectedTime && chapter.trim()) {
      // Create a new Date object combining the selected date and time
      const meetingDateTime = new Date(selectedDate);
      meetingDateTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      
      // Format to ISO string with microseconds (similar to the requested format)
      const formattedDateTime = meetingDateTime.toISOString().replace('Z', '') + '000';
      
      onSetMeeting({
        chapter: parseInt(chapter, 10),
        nextMeeting: formattedDateTime,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setChapter('');
    onClose();
  };

  const isValid = selectedDate && selectedTime && chapter.trim() && !isNaN(parseInt(chapter, 10));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Programar Reunión para {clubName}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Meeting Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha de la Reunión</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.dateDisplay}>
                {selectedDate ? selectedDate.toLocaleDateString('es-ES') : 'DD/MM/AAAA'}
              </Text>
            </View>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              minDate={new Date()}
            />
          </View>

          {/* Meeting Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hora de la Reunión</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.timeDisplay}>
                {selectedTime 
                  ? `${selectedTime.hour.toString().padStart(2, '0')}:${selectedTime.minute.toString().padStart(2, '0')} ${selectedTime.hour >= 12 ? 'p.m.' : 'a.m.'}`
                  : 'HH:MM a.m./p.m.'
                }
              </Text>
            </View>
            <TimePicker
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              format24Hour={false}
              minuteInterval={15}
            />
          </View>

          {/* Chapter to Discuss */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desde página</Text>
            <TextInput
              style={styles.chapterInput}
              value={chapter}
              onChangeText={setChapter}
              placeholder="12"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.setMeetingButton, !isValid && styles.setMeetingButtonDisabled]}
            onPress={handleSetMeeting}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={[styles.setMeetingButtonText, !isValid && styles.setMeetingButtonTextDisabled]}>
              Programar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.neutral.gray600,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: colors.neutral.gray50,
  },
  dateDisplay: {
    fontSize: 16,
    color: colors.neutral.gray700,
  },
  timeDisplay: {
    fontSize: 16,
    color: colors.neutral.gray700,
  },
  chapterInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
    backgroundColor: colors.neutral.white,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray700,
  },
  setMeetingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setMeetingButtonDisabled: {
    backgroundColor: colors.neutral.gray300,
  },
  setMeetingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  setMeetingButtonTextDisabled: {
    color: colors.neutral.gray500,
  },
});
