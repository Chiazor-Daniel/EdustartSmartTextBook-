import {
    useCheckUserDiagnosticMutation,
    useLoginMutation,
} from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Keyboard,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { CustomAlert } from "../components/custom-alert";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function LoginScreen() {
  const [email, setEmail] = useState("danieltari873@gmail.com");
  const [password, setPassword] = useState("bugzbugz111##B");
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const [login, { isLoading }] = useLoginMutation();
  const [checkDiagnostic, { isLoading: isCheckingDiagnostic }] =
    useCheckUserDiagnosticMutation();
  const { login: setAuth } = useAuthStore();

  const showCustomAlert = (title, message, type = "info", onConfirm = null) => {
    setAlertConfig({ title, message, type, onConfirm });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      showCustomAlert(
        "Missing Information",
        "Please enter both email and password to continue.",
        "warning",
      );
      return;
    }

    if (!validateEmail(email)) {
      showCustomAlert(
        "Invalid Email",
        "Please enter a valid email address.",
        "error",
      );
      return;
    }

    if (!agreeToTerms) {
      showCustomAlert(
        "Terms Required",
        "Please agree to the Privacy Policy & Terms of Service to continue.",
        "warning",
      );
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      await setAuth(response.token, response.user);

      // Check if user has completed diagnostic
      try {
        const diagnosticCheck = await checkDiagnostic({
          email: response.user.email,
        }).unwrap();

        showCustomAlert(
          "Welcome Back!",
          "You have been successfully logged in to your account.",
          "success",
          () => {
            hideAlert();
            // Navigate based on diagnostic completion status
            if (diagnosticCheck.has_completed_diagnostic) {
              router.replace("/(tabs)/home");
            } else {
              router.replace("/(auth)/student-diagnosis");
            }
          },
        );
      } catch (diagnosticErr) {
        // If check fails, default to diagnosis screen
        console.error("Error checking diagnostic:", diagnosticErr);
        showCustomAlert(
          "Welcome Back!",
          "You have been successfully logged in to your account.",
          "success",
          () => {
            hideAlert();
            router.replace("/(auth)/student-diagnosis");
          },
        );
      }
    } catch (err) {
      console.error("Login error:", err.message || "Invalid Credentials");

      let errorMessage = "Please check your email and password and try again.";
      if (err && typeof err === "object" && err !== null) {
        if (err.data && err.data.message) {
          errorMessage = err.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      showCustomAlert("Login Failed", errorMessage, "error");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />

      {/* Header area - space for logo */}
      <View style={styles.headerSpace}>
        <Image
          source={require("@/assets/logo-1-png.png")}
          style={{ width: 300, height: 300 }}
        />
      </View>

      {/* Main content area */}
      <View style={styles.mainContent}>
        {/* Modal Card */}
        <View style={styles.modalCard}>
          <Text style={styles.mainTitle}>Login to Begin</Text>
          <Text style={styles.subtitle}>
            Unlock your potential with our interactive textbook.
          </Text>

          {/* Form */}
          <View style={styles.formContainer}>
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
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms checkbox */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeToTerms && (
                    <Feather name="check" size={12} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxText}>I agree to the website </Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>
                    Privacy Policy & Terms of Service
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading || isCheckingDiagnostic}
            >
              {isLoading || isCheckingDiagnostic ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLink}>Register now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Background Images */}
      <Image
        source={require("@/assets/login2.png")}
        style={styles.bottomImage}
      />
      <Image source={require("@/assets/top.png")} style={styles.topImage} />

      {/* Bottom space for illustration */}
      <View style={styles.bottomSpace} />

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
    backgroundColor: "#FFFFFF",
    position: "relative",
  },

  headerSpace: {
    height: windowHeight * 0.15,
    paddingTop: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "flex-start",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  passwordContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  checkboxText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 0,
  },
  linkText: {
    fontSize: 12,
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signupLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSpace: {
    height: windowHeight * 0.15,
  },
  // Background Images with proper z-index
  bottomImage: {
    position: "absolute",
    bottom: 0,
    zIndex: 1,
  },
  topImage: {
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
});
