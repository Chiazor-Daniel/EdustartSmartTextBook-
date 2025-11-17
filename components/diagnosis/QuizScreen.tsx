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

interface Question {
  id: number;
  question: string;
  options: string[];
  subject?: string;
  difficulty?: string;
}

interface QuizScreenProps {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer?: string;
  selectedConfidence?: string;
  onAnswerSelect: (option: string, confidence: string) => void;
  onNextQuestion: () => void;
  onComplete: () => void;
}

const confidenceLevels = [
  "Very Confident",
  "Confident",
  "Somewhat",
  "Guessing",
  "Not sure",
];

const optionLetters = ["A", "B", "C", "D"];

export default function QuizScreen({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  selectedConfidence,
  onAnswerSelect,
  onNextQuestion,
  onComplete,
}: QuizScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    selectedAnswer || null
  );
  const [selectedConfidenceIndex, setSelectedConfidenceIndex] = useState<
    number | null
  >(
    selectedConfidence
      ? confidenceLevels.indexOf(selectedConfidence)
      : null
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Reset when question changes
    setSelectedOption(selectedAnswer || null);
    setSelectedConfidenceIndex(
      selectedConfidence ? confidenceLevels.indexOf(selectedConfidence) : null
    );

    // Animate in
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
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
  }, [currentQuestionIndex, selectedAnswer, selectedConfidence]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSubmit = () => {
    if (selectedOption !== null && selectedConfidenceIndex !== null) {
      const confidence = confidenceLevels[selectedConfidenceIndex];
      onAnswerSelect(selectedOption, confidence);
      if (isLastQuestion) {
        onComplete();
      } else {
        onNextQuestion();
      }
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          {currentQuestion.subject && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentQuestion.subject}</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${progressPercentage}%` }]}
          />
        </View>
        {currentQuestion.difficulty && (
          <View style={styles.difficultyContainer}>
            <View
              style={[
                styles.difficultyDot,
                { backgroundColor: getDifficultyColor(currentQuestion.difficulty) },
              ]}
            />
            <Text style={styles.difficultyText}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() +
                currentQuestion.difficulty.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const optionLetter = optionLetters[index];
              const isSelected = selectedOption === optionLetter;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedOption(optionLetter)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionLetter,
                        isSelected && styles.optionLetterSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          isSelected && styles.optionLetterTextSelected,
                        ]}
                      >
                        {optionLetter}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.confidenceLabel}>
            How confident are you about this answer?
          </Text>

          <View style={styles.confidenceContainer}>
            {confidenceLevels.map((level, index) => {
              const isSelected = selectedConfidenceIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.confidenceButton,
                    isSelected && styles.confidenceButtonSelected,
                  ]}
                  onPress={() => setSelectedConfidenceIndex(index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.confidenceText,
                      isSelected && styles.confidenceTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedOption === null ||
              selectedConfidenceIndex === null) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedOption === null || selectedConfidenceIndex === null}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isLastQuestion ? "Complete Test 🎯" : "Next Question →"}
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: "#4B7FD1",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4B7FD1",
    borderRadius: 3,
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 30,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    borderColor: "#4B7FD1",
    backgroundColor: "#E8F0FE",
    shadowColor: "#4B7FD1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLetterSelected: {
    backgroundColor: "#4B7FD1",
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  optionLetterTextSelected: {
    color: "#FFFFFF",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: "#1F2937",
    fontWeight: "600",
  },
  confidenceLabel: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 12,
    marginTop: 10,
    fontWeight: "600",
  },
  confidenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  confidenceButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  confidenceButtonSelected: {
    backgroundColor: "#4B7FD1",
    borderColor: "#4B7FD1",
  },
  confidenceText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  confidenceTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  submitButton: {
    backgroundColor: "#4B7FD1",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#4B7FD1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
