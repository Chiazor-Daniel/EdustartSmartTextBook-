import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  Dimensions,
  PanResponder,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import LinearBg from '../components/LinearBg';
import { useSignupMutation } from '@/services/api';
import Toast from 'react-native-toast-message';

const windowHeight = Dimensions.get('window').height;

export default function AuthScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animated values
  const formHeight = useRef(new Animated.Value(400)).current;
  const topSectionOpacity = useRef(new Animated.Value(1)).current;
  const imageTranslateY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Signup mutation hook with isLoading
  const [signup, { isLoading }] = useSignupMutation();

  // Pan responder for drag gestures  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if ((gestureState.dy < 0 && formHeight._value < 600) ||
            (gestureState.dy > 0 && formHeight._value > 400)) {
          const newHeight = Math.max(400, Math.min(600, formHeight._value - gestureState.dy));
          formHeight.setValue(newHeight);

          const progress = (newHeight - 400) / 200;
          topSectionOpacity.setValue(1 - progress);
          
          if (!keyboardVisible) {
            imageTranslateY.setValue(-150 * progress);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const expand = gestureState.dy < 0;
        animateFormState(expand);
      },
    })
  ).current;

  // Effect for keyboard events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        animateFormState(true, true);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        animateFormState(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Animation function
  const animateFormState = (expand, isKeyboard = false) => {
    Animated.parallel([
      Animated.timing(formHeight, {
        toValue: expand ? 600 : 400,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(topSectionOpacity, {
        toValue: expand ? 0 : 1,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(imageTranslateY, {
        toValue: expand ? (isKeyboard ? 300 : -150) : 0,
        duration: 300,
        useNativeDriver: false
      })
    ]).start();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    // Validate required fields
    if (!fullName || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    // Validate email length
    if (email.length > 254) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email must be less than 254 characters',
      });
      return;
    }

    // Validate full name length
    if (fullName.length > 255) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Full name must be less than 255 characters',
      });
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    // Validate password requirements
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must contain a capital letter, a number, and be minimum of 6 characters',
      });
      return;
    }

    try {
      const response = await signup({
        email,
        full_name: fullName,
        password,
        confirm_password: confirmPassword,
        user_type: 'student',
        is_active: true,
        phone_number: '',
        gender: '',
      }).unwrap();

      console.log('Signup Response:', response);

      Toast.show({
        type: 'success',
        text1: 'Account created successfully!',
        text2: 'Please check your email to verify your account',
      });

      // Navigate to login after successful signup
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (error: any) {
      console.log('Signup Error:ww', error);

      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: error.data.email[0]
      });

     
    }
  };

  return (
    <LinearBg>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Toast />

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={!keyboardVisible}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <Animated.View style={[
            styles.topSection,
            { opacity: topSectionOpacity }
          ]}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Unlock Your Potential With</Text>
              <Text style={styles.boldTitle}>Our Interactive Textbook.</Text>
              
              <Text style={styles.subtitle}>
                Discover a smarter way to learn with interactive textbooks for a 21st-century education.
              </Text>
            </View>
          </Animated.View>
          
          <Animated.Image 
            source={require('../../assets/signup.png')} 
            style={[
              styles.signupImage,
              {
                transform: [
                  { translateX: -100 }, 
                  { translateY: Animated.add(180, imageTranslateY) }, 
                  { scale: 0.9 }
                ],
                zIndex: keyboardVisible ? 0 : 99
              }
            ]} 
          />
          
          <Animated.View 
            style={[
              styles.formSection,
              { height: formHeight }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.formHandle} />
            <Text style={styles.formTitle}>Create an Account</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder=""
                maxLength={255}
              />
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
                maxLength={254}
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
          </Animated.View>
          
          <View style={styles.robotAssistant} />
        </ScrollView>
      </View>
    </LinearBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    padding: 20,
    paddingTop: 80,
  },
  textContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
  },
  boldTitle: {
    fontSize: 24,
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
  formSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    marginBottom: 60,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  robotAssistant: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  signupImage: {
    position: 'absolute',
    objectFit: 'cover',
    top: '0%',
    left: '50%',
  },
});