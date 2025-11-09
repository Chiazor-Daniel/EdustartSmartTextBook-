import { useSignupMutation } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CustomAlert } from '../components/custom-alert';
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const [signup] = useSignupMutation();

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showCustomAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleSignUp = async () => {
    // Check if user agreed to terms
    if (!agreeToTerms) {
      showCustomAlert(
        'Terms Required',
        'Please agree to the Privacy Policy & Terms of Service to continue.',
        'warning'
      );
      return;
    }

    if (!fullName || !gender || !email || !password || !confirmPassword) {
      showCustomAlert(
        'Missing Information',
        'Please fill in all required fields to create your account.',
        'error'
      );
      return;
    }

    if (!validateEmail(email)) {
      showCustomAlert(
        'Invalid Email',
        'Please enter a valid email address.',
        'error'
      );
      return;
    }

    if (email.length > 254) {
      showCustomAlert(
        'Email Too Long',
        'Email must be less than 254 characters.',
        'error'
      );
      return;
    }

    if (fullName.length > 255) {
      showCustomAlert(
        'Name Too Long',
        'Full name must be less than 255 characters.',
        'error'
      );
      return;
    }

    if (password !== confirmPassword) {
      showCustomAlert(
        'Passwords Don\'t Match',
        'Please make sure both password fields match.',
        'error'
      );
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      showCustomAlert(
        'Weak Password',
        'Password must contain a capital letter, a number, and be minimum of 6 characters.',
        'error'
      );
      return;
    }

    setIsLoading(true);
    try {
      const signupData = {
        email,
        full_name: fullName,
        gender,
        password,
        confirm_password: confirmPassword
      };
      console.log('POST https://api.class-fi.com/organization/users/signup/student/', signupData);
      const response = await signup(signupData).unwrap();
      
      showCustomAlert(
        'Account Created!',
        'Your account has been created successfully. Please check your email to verify your account.',
        'success',
        () => {
          hideAlert();
          router.replace('/(auth)/login');
        }
      );
    } catch (error: any) {
      console.log('Signup Error:', error);
    
      let errorMessage = 'Signup failed. Please try again.';
    
      if (error && typeof error === 'object' && error !== null) {
        if (error.data) {
          // If there are field-specific errors (like email, password, recaptcha_token)
          if (typeof error.data === 'object') {
            // Collect all array messages into one string
            const messages = Object.values(error.data)
              .flat() // flatten arrays
              .join('\n');
            if (messages) {
              errorMessage = messages;
            }
          }
          // If there's a generic message key
          if (error.data.message) {
            errorMessage = error.data.message;
          }
        }
      }
    
      showCustomAlert(
        'Signup Failed',
        errorMessage,
        'error'
      );
    }
     finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Header area - space for logo */}
        <View style={styles.headerSpace}>
         <Image source={require('@/assets/logo-1-png.png')} style={{width: 300, height: 300}}/>
        </View>

        {/* Main content area */}
        <View style={styles.mainContent}>
          {/* Modal Card */}
          <View style={styles.modalCard}>
            <Text style={styles.mainTitle}>Create an Account</Text>
            <Text style={styles.subtitle}>
              Discover a smarter way to learn with interactive textbooks for a 21st-century education.
            </Text>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder=""
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderOption, gender === 'Male' && styles.genderOptionSelected]}
                    onPress={() => setGender('Male')}
                  >
                    <Text style={[styles.genderOptionText, gender === 'Male' && styles.genderOptionTextSelected]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderOption, gender === 'Female' && styles.genderOptionSelected]}
                    onPress={() => setGender('Female')}
                  >
                    <Text style={[styles.genderOptionText, gender === 'Female' && styles.genderOptionTextSelected]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder=""
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder=""
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Re-enter Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder=""
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.passwordRequirements}>
                Password must contain a <Text style={styles.bold}>capital letter</Text>, a <Text style={styles.bold}>number</Text>, and be minimum of <Text style={styles.bold}>6 characters</Text>.
              </Text>

              {/* Terms and conditions checkbox */}
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                    {agreeToTerms && <Feather name="check" size={12} color="white" />}
                  </View>
                  <Text style={styles.checkboxText}>I agree to the website </Text>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Privacy Policy & Terms of Service</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom space for illustration */}
        <View style={styles.bottomSpace} />
      </KeyboardAwareScrollView>

      {/* Background Images */}
      <Image source={require('@/assets/login2.png')} style={styles.bottomImage} />
      <Image source={require('@/assets/top.png')} style={styles.topImage} />

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSpace: {
    height: windowHeight * 0.12,
    paddingTop: 150,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  passwordContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 8,
  },
  passwordRequirements: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  genderOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  genderOptionText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 0,
  },
  linkText: {
    fontSize: 12,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpace: {
    height: windowHeight * 0.1,
  },
  // Background Images with proper z-index
  bottomImage: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  topImage: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  // Custom Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  singleButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  singleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});