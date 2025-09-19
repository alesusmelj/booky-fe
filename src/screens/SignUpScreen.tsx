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
import { UserSignUpDto } from '../types/api';

interface SignUpScreenProps {
  onBackToLoginPress?: () => void;
}

interface FormErrors {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onBackToLoginPress,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { signUp, isLoading, error, clearError } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 30;
  };

  const validateName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50;
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field as keyof FormErrors);
    if (error) clearError();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    let hasErrors = false;

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = strings.errors.usernameRequired;
      hasErrors = true;
    } else if (!validateUsername(formData.username.trim())) {
      newErrors.username = strings.errors.usernameInvalid;
      hasErrors = true;
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = strings.errors.firstNameRequired;
      hasErrors = true;
    } else if (!validateName(formData.firstName.trim())) {
      newErrors.firstName = strings.errors.nameInvalid;
      hasErrors = true;
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = strings.errors.lastNameRequired;
      hasErrors = true;
    } else if (!validateName(formData.lastName.trim())) {
      newErrors.lastName = strings.errors.nameInvalid;
      hasErrors = true;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = strings.errors.invalidEmail;
      hasErrors = true;
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = strings.errors.invalidEmail;
      hasErrors = true;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = strings.errors.passwordRequired;
      hasErrors = true;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = strings.errors.passwordTooShort;
      hasErrors = true;
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = strings.errors.passwordRequired;
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = strings.errors.passwordsDoNotMatch;
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSignUp = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Términos y condiciones', 'Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    try {
      const signUpData: UserSignUpDto = {
        username: formData.username.trim(),
        name: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      await signUp(signUpData);
      logger.info('User signed up successfully');
    } catch (err: any) {
      logger.error('Sign up failed:', err);
      
      // Handle specific error messages
      if (err.message?.includes('email')) {
        setErrors(prev => ({ ...prev, email: strings.errors.emailAlreadyExists }));
      } else if (err.message?.includes('username')) {
        setErrors(prev => ({ ...prev, username: strings.errors.usernameAlreadyExists }));
      } else {
        Alert.alert('Error', strings.errors.signUpFailed);
      }
    }
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Términos y condiciones',
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialIcons
            name="menu-book"
            size={56}
            color={colors.primary.main}
            style={styles.logo}
          />
          <Text style={styles.appName}>{strings.app.name}</Text>
          <Text style={styles.tagline}>{strings.auth.signUpTagline}</Text>
        </View>

        <View style={styles.form}>
          {/* Username */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.username ? styles.inputError : null,
              ]}
              placeholder={strings.auth.username}
              placeholderTextColor={colors.neutral.gray400}
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              testID="username-input"
              accessible={true}
              accessibilityLabel={strings.auth.username}
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, styles.nameInput]}>
              <TextInput
                style={[
                  styles.input,
                  errors.firstName ? styles.inputError : null,
                ]}
                placeholder={strings.auth.firstName}
                placeholderTextColor={colors.neutral.gray400}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name-given"
                testID="firstName-input"
                accessible={true}
                accessibilityLabel={strings.auth.firstName}
              />
              {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.nameInput]}>
              <TextInput
                style={[
                  styles.input,
                  errors.lastName ? styles.inputError : null,
                ]}
                placeholder={strings.auth.lastName}
                placeholderTextColor={colors.neutral.gray400}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name-family"
                testID="lastName-input"
                accessible={true}
                accessibilityLabel={strings.auth.lastName}
              />
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.email ? styles.inputError : null,
              ]}
              placeholder={strings.auth.email}
              placeholderTextColor={colors.neutral.gray400}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              testID="email-input"
              accessible={true}
              accessibilityLabel={strings.auth.email}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.password ? styles.inputError : null,
              ]}
              placeholder={strings.auth.password}
              placeholderTextColor={colors.neutral.gray400}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password-new"
              testID="password-input"
              accessible={true}
              accessibilityLabel={strings.auth.password}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword ? styles.inputError : null,
              ]}
              placeholder={strings.auth.confirmPassword}
              placeholderTextColor={colors.neutral.gray400}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password-new"
              testID="confirmPassword-input"
              accessible={true}
              accessibilityLabel={strings.auth.confirmPassword}
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            testID="terms-checkbox"
            accessible={true}
            accessibilityLabel={strings.auth.termsAndConditions}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && (
                <MaterialIcons
                  name="check"
                  size={16}
                  color={colors.neutral.white}
                />
              )}
            </View>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                Al registrarte, aceptas nuestros{' '}
                <Text style={styles.termsLink} onPress={handleTermsPress}>
                  términos y condiciones
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              (isLoading || !acceptedTerms) && styles.signUpButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={isLoading || !acceptedTerms}
            testID="sign-up-button"
            accessible={true}
            accessibilityLabel={strings.auth.signUp}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? 'Creando cuenta...' : strings.auth.signUp}
            </Text>
          </TouchableOpacity>

          {/* Global Error */}
          {error && (
            <Text style={styles.errorText} testID="auth-error">
              {error}
            </Text>
          )}

          {/* Back to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{strings.auth.alreadyRegistered} </Text>
            <TouchableOpacity
              onPress={onBackToLoginPress}
              testID="back-to-login-link"
              accessible={true}
              accessibilityLabel={strings.auth.backToLogin}
            >
              <Text style={styles.loginLink}>{strings.auth.backToLogin}</Text>
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
    marginBottom: 40,
  },
  logo: {
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 6,
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.border.default,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  signUpButton: {
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
  signUpButtonDisabled: {
    backgroundColor: theme.button.disabled,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.inverse,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
