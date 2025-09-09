import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, strings } from '../constants';

interface SearchBoxProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBox({ value, onChangeText, placeholder }: SearchBoxProps) {
  return (
    <View style={styles.container}>
      <Feather 
        name="search" 
        size={20} 
        color={colors.neutral.gray400} 
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || strings.search.placeholder}
        placeholderTextColor={colors.neutral.gray400}
        testID="search-input"
        accessible={true}
        accessibilityLabel={strings.search.placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral.gray800,
  },
});