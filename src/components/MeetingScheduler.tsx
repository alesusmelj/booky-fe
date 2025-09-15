import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors } from '../constants';
import { Calendar } from './Calendar';
import { TimePicker } from './TimePicker';

interface MeetingSchedulerProps {
  initialDate?: Date;
  initialTime?: { hour: number; minute: number };
  initialChapter?: number;
  maxChapter?: number;
  onSchedule: (meetingData: {
    date: Date;
    time: { hour: number; minute: number };
    chapter?: number;
    notes?: string;
  }) => void;
  onCancel: () => void;
  title?: string;
  showChapterSelection?: boolean;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  initialDate,
  initialTime,
  initialChapter,
  maxChapter = 50,
  onSchedule,
  onCancel,
  title = 'Programar Meeting',
  showChapterSelection = true,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number } | undefined>(initialTime);
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter || 1);
  const [notes, setNotes] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'date' | 'time' | 'details'>('date');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep('time');
  };

  const handleTimeSelect = (time: { hour: number; minute: number }) => {
    setSelectedTime(time);
    if (showChapterSelection) {
      setCurrentStep('details');
    }
  };

  const handleScheduleMeeting = () => {
    if (selectedDate && selectedTime) {
      onSchedule({
        date: selectedDate,
        time: selectedTime,
        chapter: showChapterSelection ? selectedChapter : undefined,
        notes: notes.trim() || undefined,
      });
    }
  };

  const canSchedule = selectedDate && selectedTime;

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return '';
    
    const dateStr = selectedDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const timeStr = `${selectedTime.hour.toString().padStart(2, '0')}:${selectedTime.minute.toString().padStart(2, '0')}`;
    
    return `${dateStr} a las ${timeStr}`;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep === 'date' && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep === 'date' && styles.activeStepText]}>1</Text>
        </View>
        <Text style={styles.stepLabel}>Fecha</Text>
      </View>
      
      <View style={[styles.stepLine, selectedDate && styles.completedStepLine]} />
      
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle, 
          currentStep === 'time' && styles.activeStep,
          selectedDate && styles.completedStep
        ]}>
          <Text style={[
            styles.stepNumber, 
            currentStep === 'time' && styles.activeStepText,
            selectedDate && styles.completedStepText
          ]}>2</Text>
        </View>
        <Text style={styles.stepLabel}>Hora</Text>
      </View>
      
      {showChapterSelection && (
        <>
          <View style={[styles.stepLine, selectedTime && styles.completedStepLine]} />
          
          <View style={styles.stepContainer}>
            <View style={[
              styles.stepCircle, 
              currentStep === 'details' && styles.activeStep,
              selectedTime && styles.completedStep
            ]}>
              <Text style={[
                styles.stepNumber, 
                currentStep === 'details' && styles.activeStepText,
                selectedTime && styles.completedStepText
              ]}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Detalles</Text>
          </View>
        </>
      )}
    </View>
  );

  const renderDateStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Selecciona la fecha del meeting</Text>
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        minDate={new Date()}
      />
    </View>
  );

  const renderTimeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Selecciona la hora del meeting</Text>
      <TimePicker
        selectedTime={selectedTime}
        onTimeSelect={handleTimeSelect}
        format24Hour={true}
        minuteInterval={15}
      />
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('date')}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Detalles del meeting</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.chapterSection}>
          <Text style={styles.sectionLabel}>Capítulo a discutir</Text>
          <View style={styles.chapterSelector}>
            <TouchableOpacity
              style={styles.chapterButton}
              onPress={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
              activeOpacity={0.7}
            >
              <Text style={styles.chapterButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.chapterDisplay}>
              <Text style={styles.chapterNumber}>{selectedChapter}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.chapterButton}
              onPress={() => setSelectedChapter(Math.min(maxChapter, selectedChapter + 1))}
              activeOpacity={0.7}
            >
              <Text style={styles.chapterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.sectionLabel}>Notas adicionales (opcional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Agrega notas sobre el meeting..."
            placeholderTextColor={colors.neutral.gray400}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('time')}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        
        {renderStepIndicator()}
        
        {currentStep === 'date' && renderDateStep()}
        {currentStep === 'time' && renderTimeStep()}
        {currentStep === 'details' && renderDetailsStep()}
        
        {/* Summary */}
        {canSchedule && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumen del meeting</Text>
            <Text style={styles.summaryText}>{formatSelectedDateTime()}</Text>
            {showChapterSelection && (
              <Text style={styles.summaryText}>Capítulo: {selectedChapter}</Text>
            )}
            {notes && (
              <Text style={styles.summaryNotes}>Notas: {notes}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.scheduleButton, !canSchedule && styles.disabledButton]}
          onPress={handleScheduleMeeting}
          disabled={!canSchedule}
          activeOpacity={0.8}
        >
          <Text style={[styles.scheduleButtonText, !canSchedule && styles.disabledButtonText]}>
            Programar Meeting
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: colors.primary.indigo600,
  },
  completedStep: {
    backgroundColor: colors.status.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray600,
  },
  activeStepText: {
    color: colors.neutral.white,
  },
  completedStepText: {
    color: colors.neutral.white,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.neutral.gray500,
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.neutral.gray200,
    marginHorizontal: 8,
  },
  completedStepLine: {
    backgroundColor: colors.status.success,
  },
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: 16,
  },
  navigationButtons: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary.indigo600,
    fontWeight: '500',
  },
  detailsContainer: {
    gap: 24,
  },
  chapterSection: {
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray700,
    marginBottom: 12,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chapterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.indigo100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary.indigo600,
  },
  chapterDisplay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.indigo600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.white,
  },
  notesSection: {},
  notesInput: {
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.neutral.gray900,
    minHeight: 80,
  },
  summaryContainer: {
    backgroundColor: colors.neutral.gray50,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.neutral.gray700,
    marginBottom: 4,
  },
  summaryNotes: {
    fontSize: 14,
    color: colors.neutral.gray600,
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray600,
  },
  scheduleButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary.indigo600,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.neutral.gray300,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  disabledButtonText: {
    color: colors.neutral.gray500,
  },
});
