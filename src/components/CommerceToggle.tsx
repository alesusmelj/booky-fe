import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors, theme } from '../constants';

interface CommerceToggleProps {
  activeTab: 'trade' | 'library';
  onTabChange: (tab: 'trade' | 'library') => void;
}

export function CommerceToggle({ activeTab, onTabChange }: CommerceToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'trade' && styles.activeTab]}
        onPress={() => onTabChange('trade')}
        testID="trade-books-tab"
        accessible={true}
        accessibilityLabel={strings.commerce.tabs.tradeBooks}
      >
        <MaterialIcons 
          name="swap-horiz" 
          size={20} 
          color={activeTab === 'trade' ? colors.neutral.white : theme.text.secondary} 
        />
        <Text style={[styles.tabText, activeTab === 'trade' && styles.activeTabText]}>
          {strings.commerce.tabs.tradeBooks}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'library' && styles.activeTab]}
        onPress={() => onTabChange('library')}
        testID="my-library-tab"
        accessible={true}
        accessibilityLabel={strings.commerce.tabs.myLibrary}
      >
        <MaterialIcons 
          name="menu-book" 
          size={20} 
          color={activeTab === 'library' ? colors.neutral.white : theme.text.secondary} 
        />
        <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
          {strings.commerce.tabs.myLibrary}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 16,
    backgroundColor: colors.neutral.gray100,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  activeTabText: {
    color: colors.neutral.white,
  },
});