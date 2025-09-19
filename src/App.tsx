import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navbar, TopNavbar } from './components';
import { HomeScreen, SearchScreen, LoginScreen, SignUpScreen, CommunitiesScreen, CommunityDetailScreen, ReadingClubsScreen, ProfileScreen, LibraryScreen, Scene360TestScreen, Scene360TestScreenSimple, Scene360TestScreenSafe, Scene360TestImageOptions, Scene360ProceduralTest, Scene360CustomImageTest } from './screens';
import CommerceScreen from './screens/CommerceScreen';
import { strings, colors } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const { isAuthenticated, isLoading } = useAuth();
  const { currentScreen, goBack, canGoBack } = useNavigation();

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

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        {authScreen === 'login' ? (
          <LoginScreen 
            onCreateAccountPress={() => setAuthScreen('signup')}
          />
        ) : (
          <SignUpScreen 
            onBackToLoginPress={() => setAuthScreen('login')}
          />
        )}
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    // Handle navigation screens first
    switch (currentScreen.screen) {
      case 'community-detail':
        return <CommunityDetailScreen communityId={currentScreen.params?.communityId} />;
      case 'reading-clubs':
        return <ReadingClubsScreen />;
      case 'profile':
        return <ProfileScreen route={{ params: currentScreen.params }} />;
      case 'scene360-test':
        return <Scene360TestScreen />;
      case 'scene360-test-simple':
        return <Scene360TestScreenSimple />;
      case 'scene360-test-safe':
        return <Scene360TestScreenSafe />;
      case 'scene360-image-options':
        return <Scene360TestImageOptions />;
      case 'scene360-procedural':
        return <Scene360ProceduralTest />;
      case 'scene360-custom':
        return <Scene360CustomImageTest />;
      default:
        // Handle tab-based screens
        switch (activeTab) {
          case 'home':
            return <HomeScreen />;
          case 'search':
            return <SearchScreen />;
          case 'community':
            return <CommunitiesScreen />;
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
            return <LibraryScreen />;
          case 'profile':
            return <ProfileScreen />;
          default:
            return <HomeScreen />;
        }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {canGoBack() ? (
        <View style={styles.headerWithBack}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <TopNavbar 
            hasNotifications={true}
            onNotificationPress={() => {}}
          />
        </View>
      ) : (
        <TopNavbar 
          hasNotifications={true}
          onNotificationPress={() => {}}
        />
      )}
      <View style={styles.content}>
        {renderContent()}
      </View>
      {!canGoBack() && (
        <Navbar 
          activeTab={activeTab} 
          onTabPress={handleTabPress} 
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </AuthProvider>
    </SafeAreaProvider>
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
  headerWithBack: {
    backgroundColor: colors.neutral.white,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary.indigo600,
    fontWeight: '600',
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
