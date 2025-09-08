import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Navbar, TopNavbar } from './components';
import { HomeScreen } from './screens';
import { strings, colors } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.placeholders.search.title}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      case 'community':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.placeholders.communities.title}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      case 'market':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.navigation.market}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      case 'messages':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.navigation.messages}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      case 'library':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.placeholders.library.title}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.placeholders.profile.title}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar 
        hasNotifications={true}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />
      <View style={styles.content}>
        {renderContent()}
      </View>
      <Navbar 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.gray50,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.neutral.gray800,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: colors.neutral.gray500,
  },
});
