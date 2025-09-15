import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../constants';

interface TimePickerProps {
  selectedTime?: { hour: number; minute: number };
  onTimeSelect: (time: { hour: number; minute: number }) => void;
  format24Hour?: boolean;
  minuteInterval?: number;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  selectedTime,
  onTimeSelect,
  format24Hour = true,
  minuteInterval = 15,
}) => {
  const [selectedHour, setSelectedHour] = useState(selectedTime?.hour || 12);
  const [selectedMinute, setSelectedMinute] = useState(selectedTime?.minute || 0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  useEffect(() => {
    if (selectedTime) {
      setSelectedHour(selectedTime.hour);
      setSelectedMinute(selectedTime.minute);
      if (!format24Hour) {
        setSelectedPeriod(selectedTime.hour >= 12 ? 'PM' : 'AM');
      }
    }
  }, [selectedTime, format24Hour]);

  const generateHours = () => {
    if (format24Hour) {
      return Array.from({ length: 24 }, (_, i) => i);
    } else {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += minuteInterval) {
      minutes.push(i);
    }
    return minutes;
  };

  const handleTimeChange = (hour: number, minute: number, period?: 'AM' | 'PM') => {
    let finalHour = hour;
    
    if (!format24Hour && period) {
      if (period === 'PM' && hour !== 12) {
        finalHour = hour + 12;
      } else if (period === 'AM' && hour === 12) {
        finalHour = 0;
      }
    }

    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (period) setSelectedPeriod(period);

    onTimeSelect({ hour: finalHour, minute });
  };

  const formatDisplayHour = (hour: number) => {
    if (format24Hour) {
      return hour.toString().padStart(2, '0');
    } else {
      return hour.toString();
    }
  };

  const formatDisplayMinute = (minute: number) => {
    return minute.toString().padStart(2, '0');
  };

  const renderTimeColumn = (
    items: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    formatter: (value: number) => string
  ) => (
    <ScrollView
      style={styles.timeColumn}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.timeColumnContent}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.timeItem,
            selectedValue === item && styles.selectedTimeItem,
          ]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.timeItemText,
              selectedValue === item && styles.selectedTimeItemText,
            ]}
          >
            {formatter(item)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPeriodColumn = () => (
    <View style={styles.periodColumn}>
      {['AM', 'PM'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodItem,
            selectedPeriod === period && styles.selectedPeriodItem,
          ]}
          onPress={() => {
            setSelectedPeriod(period as 'AM' | 'PM');
            handleTimeChange(selectedHour, selectedMinute, period as 'AM' | 'PM');
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.periodItemText,
              selectedPeriod === period && styles.selectedPeriodItemText,
            ]}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar Hora</Text>
      
      <View style={styles.timePickerContainer}>
        {/* Hours */}
        <View style={styles.columnContainer}>
          <Text style={styles.columnLabel}>Hora</Text>
          {renderTimeColumn(
            generateHours(),
            format24Hour ? selectedHour : (selectedHour > 12 ? selectedHour - 12 : selectedHour === 0 ? 12 : selectedHour),
            (hour) => handleTimeChange(hour, selectedMinute, selectedPeriod),
            formatDisplayHour
          )}
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Text style={styles.separatorText}>:</Text>
        </View>

        {/* Minutes */}
        <View style={styles.columnContainer}>
          <Text style={styles.columnLabel}>Min</Text>
          {renderTimeColumn(
            generateMinutes(),
            selectedMinute,
            (minute) => handleTimeChange(selectedHour, minute, selectedPeriod),
            formatDisplayMinute
          )}
        </View>

        {/* AM/PM for 12-hour format */}
        {!format24Hour && (
          <>
            <View style={styles.separator} />
            <View style={styles.columnContainer}>
              <Text style={styles.columnLabel}>Período</Text>
              {renderPeriodColumn()}
            </View>
          </>
        )}
      </View>

      {/* Selected time display */}
      <View style={styles.selectedTimeContainer}>
        <Text style={styles.selectedTimeLabel}>Hora seleccionada:</Text>
        <Text style={styles.selectedTimeText}>
          {format24Hour 
            ? `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
            : `${(selectedHour > 12 ? selectedHour - 12 : selectedHour === 0 ? 12 : selectedHour)}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`
          }
        </Text>
      </View>
    </View>
  );
};

// const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 16,
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 200,
  },
  columnContainer: {
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.gray500,
    marginBottom: 8,
  },
  timeColumn: {
    width: 60,
    height: 160,
  },
  timeColumnContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeItem: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedTimeItem: {
    backgroundColor: colors.primary.indigo600,
  },
  timeItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  selectedTimeItemText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 24,
  },
  separatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral.gray400,
  },
  periodColumn: {
    width: 60,
    marginTop: 24,
  },
  periodItem: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  selectedPeriodItem: {
    backgroundColor: colors.primary.indigo600,
    borderColor: colors.primary.indigo600,
  },
  periodItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray700,
  },
  selectedPeriodItemText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
  selectedTimeContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.neutral.gray50,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeLabel: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginBottom: 4,
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary.indigo600,
  },
});
