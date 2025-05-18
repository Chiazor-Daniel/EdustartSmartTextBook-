import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import LinearBg from '../components/LinearBg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLoginMutation } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import Toast from 'react-native-toast-message';

const windowHeight = Dimensions.get('window').height;

export default function LoginScreen() {
  const [email, setEmail] = useState('sukkepipsi@gufum.com');
  const [password, setPassword] = useState('Tester12345');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Effect for keyboard events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const [login, { isLoading }] = useLoginMutation();
  const { login: setAuth } = useAuthStore();
 
  const handleLogin = async () => {
    try {
      const response = await login({ email, password }).unwrap();
      console.log(response);
      setAuth(response.token, response.expires_at, response.user);
      Toast.show({
        type: 'success',
        text1: 'Login successful!',
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
        onShow: () => {},
        onHide: () => { router.replace('/performance') }
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: 'Please check your credentials',
        position: 'bottom',
        visibilityTime: 4000,
        bottomOffset: 40
      });
      console.error('Login error:', err);
    }
  };

  return (
    <LinearBg>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="light" />
        
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
            source={require('../../assets/login.png')}
            style={[
              styles.loginImage,
              keyboardVisible && { opacity: 0 }
            ]}
          />

          <View style={styles.formSection}>
            <View style={styles.formHandle} />
            <Text style={styles.formTitle}>Login to Begin</Text>

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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Register now</Text>
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
    transition: '0.3s',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  loginImage: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: -30,
  },
});