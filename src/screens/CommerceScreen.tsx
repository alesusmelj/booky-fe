import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { CommerceToggle } from '../components/CommerceToggle';
import { TradeBooksView } from '../components/TradeBooksView';
import { MyLibraryView } from '../components/MyLibraryView';
import { strings, theme } from '../constants';

export default function CommerceScreen() {
  const [activeTab, setActiveTab] = useState<'trade' | 'library'>('trade');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.commerce.title}</Text>
      </View>
      
      <View style={styles.content}>
        <CommerceToggle
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === 'trade' ? <TradeBooksView /> : <MyLibraryView />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.default,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});