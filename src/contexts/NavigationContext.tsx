import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BackHandler } from 'react-native';

export interface NavigationState {
  screen: string;
  params?: Record<string, any>;
}

interface NavigationContextType {
  currentScreen: NavigationState;
  navigate: (screen: string, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  resetToHome: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialScreen?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialScreen = 'home'
}) => {
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([
    { screen: initialScreen }
  ]);

  const currentScreen = navigationStack[navigationStack.length - 1];

  const navigate = (screen: string, params?: Record<string, any>) => {
    const newScreen: NavigationState = { screen, params };
    setNavigationStack(prev => [...prev, newScreen]);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const canGoBack = () => {
    return navigationStack.length > 1;
  };

  const resetToHome = () => {
    setNavigationStack([{ screen: 'home' }]);
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigationStack.length > 1) {
        // If we can go back, navigate back in our stack
        setNavigationStack(prev => prev.slice(0, -1));
        return true; // Prevent default behavior (exit app)
      }
      // If we're at the root, allow default behavior (exit app)
      return false;
    });

    return () => backHandler.remove();
  }, [navigationStack]);

  const value: NavigationContextType = {
    currentScreen,
    navigate,
    goBack,
    canGoBack,
    resetToHome,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
