import React, { useState, useRef, useEffect } from 'react';
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
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const termsScrollViewRef = useRef<ScrollView>(null);

  const { signUp, isLoading, error, clearError } = useAuth();

  // Reset scroll position when modal opens
  useEffect(() => {
    if (showTermsModal) {
      const timer = setTimeout(() => {
        if (termsScrollViewRef.current) {
          termsScrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showTermsModal]);

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
    setShowTermsModal(true);
  };

  // Check if form is valid in real-time
  const isFormValid = (): boolean => {
    // Check if all fields are filled
    if (!formData.username.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()) {
      return false;
    }

    // Check if all validations pass
    if (!validateUsername(formData.username.trim())) return false;
    if (!validateName(formData.firstName.trim())) return false;
    if (!validateName(formData.lastName.trim())) return false;
    if (!validateEmail(formData.email.trim())) return false;
    if (!validatePassword(formData.password)) return false;
    if (formData.password !== formData.confirmPassword) return false;

    // Check if terms are accepted
    if (!acceptedTerms) return false;

    return true;
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior="height"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
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
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.password ? styles.inputError : null,
                  ]}
                  placeholder={strings.auth.password}
                  placeholderTextColor={colors.neutral.gray400}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  testID="password-input"
                  accessible={true}
                  accessibilityLabel={strings.auth.password}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  testID="toggle-password-visibility"
                  accessible={true}
                  accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={colors.neutral.gray400}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.confirmPassword ? styles.inputError : null,
                  ]}
                  placeholder={strings.auth.confirmPassword}
                  placeholderTextColor={colors.neutral.gray400}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  testID="confirmPassword-input"
                  accessible={true}
                  accessibilityLabel={strings.auth.confirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  testID="toggle-confirm-password-visibility"
                  accessible={true}
                  accessibilityLabel={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={colors.neutral.gray400}
                  />
                </TouchableOpacity>
              </View>
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
                (isLoading || !isFormValid()) && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isLoading || !isFormValid()}
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

      {/* Terms and Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.termsModal}>
          <View style={styles.termsModalHeader}>
            <Text style={styles.termsModalTitle}>Términos y Condiciones de Uso</Text>
            <TouchableOpacity
              onPress={() => setShowTermsModal(false)}
              style={styles.termsModalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={colors.neutral.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView
            key={showTermsModal ? 'terms-open' : 'terms-closed'}
            ref={termsScrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
            showsVerticalScrollIndicator={true}
            overScrollMode="always"
          >
            <Text style={styles.termsModalDate}>Última actualización: Enero 2026</Text>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalText}>
                Bienvenido a Booky. Al registrarte y utilizar nuestra plataforma, aceptas estar sujeto a los siguientes términos y condiciones. Por favor, léelos cuidadosamente antes de continuar.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>1. Restricción de Edad</Text>
              <Text style={styles.termsModalHighlight}>
                Debes tener al menos 18 años de edad para utilizar Booky.
              </Text>
              <Text style={styles.termsModalText}>
                Al registrarte, confirmas que eres mayor de edad según las leyes de tu jurisdicción. No permitimos el registro de menores de edad.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>2. Descripción del Servicio</Text>
              <Text style={styles.termsModalText}>
                Booky es una plataforma que facilita el intercambio de libros entre usuarios. Proporcionamos un espacio digital donde los lectores pueden:
              </Text>
              <Text style={styles.termsModalBullet}>• Crear perfiles y bibliotecas personales</Text>
              <Text style={styles.termsModalBullet}>• Buscar y conectar con otros lectores</Text>
              <Text style={styles.termsModalBullet}>• Coordinar intercambios de libros</Text>
              <Text style={styles.termsModalBullet}>• Participar en comunidades de lectura</Text>
              <Text style={styles.termsModalBullet}>• Calificar y reseñar experiencias</Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>3. Responsabilidades del Usuario</Text>
              <Text style={styles.termsModalText}>
                Como usuario de Booky, te comprometes a:
              </Text>
              <Text style={styles.termsModalBullet}>• Proporcionar información precisa y actualizada</Text>
              <Text style={styles.termsModalBullet}>• Mantener la seguridad de tu cuenta</Text>
              <Text style={styles.termsModalBullet}>• Comportarte de manera respetuosa con otros usuarios</Text>
              <Text style={styles.termsModalBullet}>• Cumplir con todas las leyes aplicables</Text>
              <Text style={styles.termsModalBullet}>• No utilizar la plataforma para actividades ilegales</Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>4. Descargo de Responsabilidad - Intercambios de Libros</Text>
              <Text style={styles.termsModalHighlight}>
                IMPORTANTE: Booky actúa únicamente como intermediario digital para facilitar el contacto entre usuarios.
              </Text>
              <Text style={styles.termsModalText}>
                NO somos responsables por:
              </Text>
              <Text style={styles.termsModalBullet}>• Robos, pérdidas o daños de libros durante intercambios</Text>
              <Text style={styles.termsModalBullet}>• Fraudes o engaños entre usuarios</Text>
              <Text style={styles.termsModalBullet}>• La condición, autenticidad o calidad de los libros intercambiados</Text>
              <Text style={styles.termsModalBullet}>• Incumplimientos de acuerdos entre usuarios</Text>
              <Text style={styles.termsModalBullet}>• Situaciones de seguridad personal durante encuentros</Text>
              <Text style={styles.termsModalBullet}>• Disputas o conflictos entre usuarios</Text>

              <Text style={[styles.termsModalText, { marginTop: 12 }]}>
                <Text style={{ fontWeight: '600' }}>Recomendaciones de Seguridad:</Text>
              </Text>
              <Text style={styles.termsModalBullet}>• Realiza intercambios en lugares públicos y concurridos</Text>
              <Text style={styles.termsModalBullet}>• Informa a alguien de confianza sobre tus encuentros</Text>
              <Text style={styles.termsModalBullet}>• Verifica la identidad del otro usuario antes de encontrarte</Text>
              <Text style={styles.termsModalBullet}>• Confía en tu instinto y cancela si algo no se siente bien</Text>

              <Text style={[styles.termsModalHighlight, { marginTop: 12 }]}>
                Los intercambios se realizan bajo tu propio riesgo y responsabilidad.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>5. Actividades Prohibidas</Text>
              <Text style={styles.termsModalText}>
                Está estrictamente prohibido:
              </Text>
              <Text style={styles.termsModalBullet}>• Publicar contenido ilegal, ofensivo o inapropiado</Text>
              <Text style={styles.termsModalBullet}>• Acosar, amenazar o intimidar a otros usuarios</Text>
              <Text style={styles.termsModalBullet}>• Realizar actividades fraudulentas o engañosas</Text>
              <Text style={styles.termsModalBullet}>• Vender o comercializar libros (solo intercambios)</Text>
              <Text style={styles.termsModalBullet}>• Utilizar la plataforma para spam o publicidad no autorizada</Text>
              <Text style={styles.termsModalBullet}>• Intentar acceder a cuentas de otros usuarios</Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>6. Contenido y Propiedad Intelectual</Text>
              <Text style={styles.termsModalText}>
                Todo el contenido que publiques (reseñas, comentarios, fotos) sigue siendo de tu propiedad, pero nos otorgas una licencia para mostrarlo en la plataforma. Respeta los derechos de autor y no publiques contenido que no te pertenezca sin autorización.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>7. Privacidad y Datos Personales</Text>
              <Text style={styles.termsModalText}>
                Recopilamos y procesamos tus datos personales de acuerdo con nuestra Política de Privacidad. Esto incluye:
              </Text>
              <Text style={styles.termsModalBullet}>• Información de perfil (nombre, email, ubicación)</Text>
              <Text style={styles.termsModalBullet}>• Datos de uso de la plataforma</Text>
              <Text style={styles.termsModalBullet}>• Información de intercambios y calificaciones</Text>
              <Text style={[styles.termsModalText, { marginTop: 8 }]}>
                Utilizamos esta información para mejorar el servicio, facilitar intercambios y mantener la seguridad de la comunidad. No vendemos tus datos a terceros.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>8. Limitación de Responsabilidad</Text>
              <Text style={styles.termsModalText}>
                Booky se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos:
              </Text>
              <Text style={styles.termsModalBullet}>• La disponibilidad ininterrumpida del servicio</Text>
              <Text style={styles.termsModalBullet}>• La exactitud de la información proporcionada por usuarios</Text>
              <Text style={styles.termsModalBullet}>• Resultados específicos de los intercambios</Text>
              <Text style={styles.termsModalBullet}>• La seguridad absoluta de las transacciones entre usuarios</Text>

              <Text style={[styles.termsModalText, { marginTop: 12 }]}>
                En ningún caso seremos responsables por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar Booky.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>9. Terminación de Cuenta</Text>
              <Text style={styles.termsModalText}>
                Nos reservamos el derecho de suspender o terminar tu cuenta si:
              </Text>
              <Text style={styles.termsModalBullet}>• Violas estos términos y condiciones</Text>
              <Text style={styles.termsModalBullet}>• Participas en actividades fraudulentas o ilegales</Text>
              <Text style={styles.termsModalBullet}>• Recibes múltiples reportes negativos de otros usuarios</Text>
              <Text style={styles.termsModalBullet}>• Proporcionas información falsa o engañosa</Text>

              <Text style={[styles.termsModalText, { marginTop: 8 }]}>
                Puedes eliminar tu cuenta en cualquier momento desde la configuración de tu perfil.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>10. Modificaciones a los Términos</Text>
              <Text style={styles.termsModalText}>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos a través de la aplicación o por email. El uso continuado de Booky después de las modificaciones constituye tu aceptación de los nuevos términos.
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>11. Contacto</Text>
              <Text style={styles.termsModalText}>
                Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos en:
              </Text>
              <Text style={[styles.termsModalText, { marginTop: 8, fontWeight: '500' }]}>
                Email: soporte@booky.app{'\n'}
                Sitio web: www.booky.app
              </Text>
            </View>

            <View style={styles.termsModalSection}>
              <Text style={styles.termsModalSectionTitle}>12. Aceptación</Text>
              <Text style={styles.termsModalHighlight}>
                Al marcar la casilla de aceptación y crear una cuenta en Booky, confirmas que:
              </Text>
              <Text style={styles.termsModalBullet}>• Tienes al menos 18 años de edad</Text>
              <Text style={styles.termsModalBullet}>• Has leído y comprendido estos términos</Text>
              <Text style={styles.termsModalBullet}>• Aceptas cumplir con todas las condiciones establecidas</Text>
              <Text style={styles.termsModalBullet}>• Entiendes los riesgos asociados con los intercambios de libros</Text>
              <Text style={styles.termsModalBullet}>• Asumes toda responsabilidad por tus interacciones con otros usuarios</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
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
    width: 80,
    height: 80,
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
  passwordInputContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
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
  // Terms Modal Styles
  termsModal: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  termsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  termsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.gray900,
    flex: 1,
  },
  termsModalCloseButton: {
    padding: 4,
  },
  termsModalDate: {
    fontSize: 12,
    color: colors.neutral.gray500,
    marginTop: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  termsModalSection: {
    marginBottom: 24,
  },
  termsModalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.gray900,
    marginBottom: 12,
  },
  termsModalText: {
    fontSize: 14,
    color: colors.neutral.gray700,
    lineHeight: 22,
    marginBottom: 8,
  },
  termsModalBullet: {
    fontSize: 14,
    color: colors.neutral.gray700,
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 4,
  },
  termsModalHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    lineHeight: 22,
    marginBottom: 8,
  },
});
