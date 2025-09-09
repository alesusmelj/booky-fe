import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { strings, colors, theme } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface LoginScreenProps {
  onCreateAccountPress?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onCreateAccountPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, isLoading, error, clearError } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    clearError();

    // Validate inputs
    let hasErrors = false;

    if (!email.trim()) {
      setEmailError(strings.errors.invalidEmail);
      hasErrors = true;
    } else if (!validateEmail(email.trim())) {
      setEmailError(strings.errors.invalidEmail);
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError(strings.errors.passwordRequired);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      await signIn({ email: email.trim(), password });
      logger.info('User signed in successfully');
    } catch (err) {
      logger.error('Sign in failed:', err);
      Alert.alert('Error', strings.errors.loginFailed);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      strings.auth.forgotPassword,
      strings.placeholders.comingSoon,
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <MaterialIcons
            name="menu-book"
            size={64}
            color={colors.primary.main}
            style={styles.logo}
          />
          <Text style={styles.appName}>{strings.app.name}</Text>
          <Text style={styles.tagline}>{strings.auth.appTagline}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : null,
              ]}
              placeholder={strings.auth.email}
              placeholderTextColor={colors.neutral.gray400}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              testID="email-input"
              accessible={true}
              accessibilityLabel={strings.auth.email}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                passwordError ? styles.inputError : null,
              ]}
              placeholder={strings.auth.password}
              placeholderTextColor={colors.neutral.gray400}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              testID="password-input"
              accessible={true}
              accessibilityLabel={strings.auth.password}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              testID="remember-me-checkbox"
              accessible={true}
              accessibilityLabel={strings.auth.rememberMe}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && (
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={colors.neutral.white}
                  />
                )}
              </View>
              <Text style={styles.rememberMeText}>{strings.auth.rememberMe}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              testID="forgot-password-link"
              accessible={true}
              accessibilityLabel={strings.auth.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                {strings.auth.forgotPassword}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.signInButton,
              isLoading && styles.signInButtonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={isLoading}
            testID="sign-in-button"
            accessible={true}
            accessibilityLabel={strings.auth.signIn}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Cargando...' : strings.auth.signIn}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText} testID="auth-error">
              {error}
            </Text>
          )}

          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>{strings.auth.notRegistered} </Text>
            <TouchableOpacity
              onPress={onCreateAccountPress}
              testID="create-account-link"
              accessible={true}
              accessibilityLabel={strings.auth.createAccount}
            >
              <Text style={styles.signUpLink}>{strings.auth.createAccount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 56,
    backgroundColor: theme.background.primary,
    borderWidth: 1,
    borderColor: theme.border.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.text.primary,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.border.default,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  rememberMeText: {
    fontSize: 14,
    color: theme.text.primary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary.main,
  },
  signInButton: {
    height: 56,
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.shadow.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonDisabled: {
    backgroundColor: theme.button.disabled,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.inverse,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signUpText: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  signUpLink: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
});