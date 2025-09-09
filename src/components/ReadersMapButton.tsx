import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, strings } from '../constants';

interface ReadersMapButtonProps {
  onPress?: () => void;
}

export function ReadersMapButton({ onPress }: ReadersMapButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      testID="readers-map-button"
      accessible={true}
      accessibilityLabel={strings.search.readersMap}
    >
      <MaterialIcons
        name="map"
        size={20}
        color={colors.primary.main}
        style={styles.icon}
      />
      <Text style={styles.text}>{strings.search.readersMap}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: colors.primary.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
});