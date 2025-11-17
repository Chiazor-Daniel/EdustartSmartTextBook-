"use client";

import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  options: { label: string; value: string }[];
  type: "single" | "multiple";
}

interface OnboardingScreenProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
  selectedValue?: string;
  onSelectOption: (optionValue: string) => void;
  onNext: (value: string) => void;
  onBack: () => void;
  onComplete: () => void;
}

export default function OnboardingScreen({
  steps,
  currentStepIndex,
  selectedValue,
  onSelectOption,
  onNext,
  onBack,
  onComplete,
}: OnboardingScreenProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    selectedValue ? [selectedValue] : []
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Reset selection when step changes
    setSelectedOptions(selectedValue ? [selectedValue] : []);
    
    // Animate in
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIndex, selectedValue]);

  const currentStep =
    steps &&
    Array.isArray(steps) &&
    typeof currentStepIndex === "number" &&
    steps[currentStepIndex]
      ? steps[currentStepIndex]
      : {
          id: 0,
          title: "",
          subtitle: "",
          icon: "",
          options: [],
          type: "single",
        };

  const isLastStep =
    typeof currentStepIndex === "number" && Array.isArray(steps)
      ? currentStepIndex === steps.length - 1
      : true;

  const handleOptionPress = (value: string) => {
    if (currentStep.type === "single") {
      setSelectedOptions([value]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
    }
  };

  const handleNext = () => {
    if (selectedOptions.length > 0) {
      const selectedValue = selectedOptions[0]; // For single select
      if (isLastStep) {
        onComplete();
      } else {
        onNext(selectedValue);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{currentStep.icon}</Text>
          </View>

          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentStepIndex + 1} of {steps.length}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentStep.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOptions.includes(option.value) &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => handleOptionPress(option.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedOptions.includes(option.value) &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {selectedOptions.includes(option.value) && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedOptions.includes(option.value) &&
                      styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>
            {currentStepIndex === 0 ? "Exit" : "Go back"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedOptions.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedOptions.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {isLastStep ? "Start Diagnostic" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 100,
    justifyContent: "flex-start",
  },
  wave: {
    width: "100%",
    height: 60,
    backgroundColor: "#FFD700",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B7FD1",
    textAlign: "center",
    marginBottom: 25,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: "#E8F0FE",
    borderColor: "#4B7FD1",
    borderWidth: 2,
    shadowColor: "#4B7FD1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#4B7FD1",
    backgroundColor: "#4B7FD1",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  optionLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  optionLabelSelected: {
    color: "#4B7FD1",
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4B7FD1",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#4B7FD1",
    borderRadius: 25,
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
