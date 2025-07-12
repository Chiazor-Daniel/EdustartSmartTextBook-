import { useSignupMutation } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import LinearBg from '../components/LinearBg';

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

  const handleSignUp = async () => {
    if (!fullName || !gender || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }
    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }
    if (email.length > 254) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email must be less than 254 characters',
      });
      return;
    }
    if (fullName.length > 255) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Full name must be less than 255 characters',
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must contain a capital letter, a number, and be minimum of 6 characters',
      });
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
      Toast.show({
        type: 'success',
        text1: 'Account created successfully!',
        text2: 'Please check your email to verify your account',
      });
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (error: any) {
      console.log('Signup Error:', error);
      let errorMessage = 'Signup failed. Please try again.';
      if (error && typeof error === 'object' && error !== null) {
        if (error.data && error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data && error.data.errors) {
          errorMessage = Object.values(error.data.errors).join('\n');
        }
      }
      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearBg>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="light" />
        <Toast />
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          extraScrollHeight={20}
          enableOnAndroid={true}
          scrollEnabled={true}
        >
          <View style={[
            styles.topSection,
            keyboardVisible && { height: 120, opacity: 0.6 }
          ]}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Unlock Your Potential With</Text>
              <Text style={styles.boldTitle}>Our Interactive Textbook.</Text>
              {!keyboardVisible && (
                <Text style={styles.subtitle}>
                  Discover a smarter way to learn with interactive textbooks for a 21st-century education.
                </Text>
              )}
            </View>
          </View>
          <Image
            source={require('../../assets/signup.png')}
            style={[
              styles.signupImage,
              keyboardVisible && { opacity: 0 }
            ]}
          />
          <View style={styles.formSection}>
            <View style={styles.formHandle} />
            <Text style={styles.formTitle}>Create an Account</Text>
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
                <TouchableOpacity
                  style={[styles.genderOption, gender === 'Other' && styles.genderOptionSelected]}
                  onPress={() => setGender('Other')}
                >
                  <Text style={[styles.genderOptionText, gender === 'Other' && styles.genderOptionTextSelected]}>Other</Text>
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
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </LinearBg>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    padding: 20,
    paddingTop: 60,
    height: 200,
  },
  textContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    lineHeight: 22,
  },
  boldTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  formSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  formHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordRequirements: {
    fontSize: 12,
    color: '#666',
    marginBottom: 25,
  },
  bold: {
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  signupImage: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: -30,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  genderOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  genderOptionText: {
    color: '#666',
    fontSize: 16,
  },
  genderOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
});