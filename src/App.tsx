import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { Navbar, TopNavbar } from './components';
import { HomeScreen, SearchScreen, LoginScreen } from './screens';
import CommerceScreen from './screens/CommerceScreen';
import { strings, colors } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { isAuthenticated, isLoading } = useAuth();

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LoginScreen />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'community':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>{strings.placeholders.communities.title}</Text>
            <Text style={styles.placeholderSubtitle}>{strings.placeholders.comingSoon}</Text>
          </View>
        );
      case 'commerce':
        return <CommerceScreen />;
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
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
