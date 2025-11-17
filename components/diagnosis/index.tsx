"use client";

import { CustomAlert } from "@/app/components/custom-alert";
import {
  useStartDiagnosticMutation,
  useSubmitDiagnosticAnswersMutation,
  type DiagnosticQuestion,
  type DiagnosticResults,
} from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import OnboardingScreen from "./OnboardingScreen";
import QuizScreen from "./QuizScreen";
import SuccessScreen from "./SuccessScreen";

type ScreenType = "success" | "quiz" | "onboarding" | "loading";

// Mapping functions for onboarding data
const mapExamType = (value: string): string => {
  const mapping: Record<string, string> = {
    waec: "WAEC / NECO Preparations",
    jamb: "JAMB Preparations",
    alevels: "A-Levels",
    postutme: "Post UTME",
    igcse: "IGCSE",
  };
  return mapping[value] || "JAMB Preparations";
};

const mapMonthsUntilExam = (value: string): number => {
  const mapping: Record<string, number> = {
    less_2_weeks: 0.5,
    "2_4_weeks": 1,
    "1_2_months": 1.5,
    "3_6_months": 4.5,
    more_6_months: 6,
  };
  return mapping[value] || 3;
};

const mapDailyStudyMinutes = (value: string): number => {
  const mapping: Record<string, number> = {
    "15_30_min": 22.5,
    "30_60_min": 45,
    "1_2_hours": 90,
    "2_3_hours": 150,
    more_3_hours: 180,
  };
  return mapping[value] || 120;
};

export default function Diagnosis() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("onboarding");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [diagnosticId, setDiagnosticId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Array<{ question_id: number; selected_option: string; confidence: string }>
  >([]);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { user } = useAuthStore();
  const [startDiagnostic, { isLoading: isStarting }] =
    useStartDiagnosticMutation();
  const [submitAnswers, { isLoading: isSubmitting }] =
    useSubmitDiagnosticAnswersMutation();

  // Onboarding Steps Data
  const onboardingSteps = [
    {
      id: 1,
      title: "What is your goal?",
      subtitle: "Choose your primary target",
      icon: "🎯",
      options: [
        { label: "Preparing for an Exam", value: "exam" },
        { label: "I want to improve on a subject", value: "improve" },
        { label: "Other", value: "other" },
      ],
      type: "single" as const,
    },
    {
      id: 2,
      title: "What Exam are you preparing for?",
      subtitle: "Choose your primary target",
      icon: "📚",
      options: [
        { label: "WAEC / NECO Preparations", value: "waec" },
        { label: "JAMB Preparations", value: "jamb" },
        { label: "A-Levels", value: "alevels" },
        { label: "Post UTME", value: "postutme" },
        { label: "IGCSE", value: "igcse" },
      ],
      type: "single" as const,
    },
    {
      id: 3,
      title: "When is your exam?",
      subtitle: "Help us create the right timeline",
      icon: "⏰",
      options: [
        { label: "Less than 2 weeks", value: "less_2_weeks" },
        { label: "2 - 4 weeks", value: "2_4_weeks" },
        { label: "1 - 2 months", value: "1_2_months" },
        { label: "3 - 6 months", value: "3_6_months" },
        { label: "More than 6 months", value: "more_6_months" },
      ],
      type: "single" as const,
    },
    {
      id: 4,
      title: "Daily study time?",
      subtitle: "How much time can you dedicate daily?",
      icon: "⏱️",
      options: [
        { label: "15-30 minutes", value: "15_30_min" },
        { label: "30-60 minutes", value: "30_60_min" },
        { label: "1-2 hours", value: "1_2_hours" },
        { label: "2-3 hours", value: "2_3_hours" },
        { label: "More than 3 hours", value: "more_3_hours" },
      ],
      type: "single" as const,
    },
  ];

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<
    Record<number, string>
  >({});

  const handleStartDiagnostic = async () => {
    if (!user) return;

    const examType = mapExamType(onboardingAnswers[2] || "jamb");
    const monthsUntilExam = mapMonthsUntilExam(onboardingAnswers[3] || "3_6_months");
    const dailyStudyMinutes = mapDailyStudyMinutes(onboardingAnswers[4] || "1_2_hours");

    try {
      setCurrentScreen("loading");
      const response = await startDiagnostic({
        user: {
          name: user.full_name,
          email: user.email,
        },
        exam_type: examType,
        daily_study_minutes: dailyStudyMinutes,
        months_until_exam: monthsUntilExam,
      }).unwrap();
      console.log(response);

      setDiagnosticId(response.diagnostic_id);
      setQuestions(response.questions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setCurrentScreen("quiz");
    } catch (error: any) {
      console.error("Error starting diagnostic:", error);
      setCurrentScreen("onboarding");
      // You could show an error alert here
    }
  };

  const handleAnswerSelect = (
    questionId: number,
    selectedOption: string,
    confidence: string,
  ) => {
    const existingAnswerIndex = answers.findIndex(
      (a) => a.question_id === questionId,
    );
    const newAnswer = {
      question_id: questionId,
      selected_option: selectedOption,
      confidence,
    };

    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setAnswers(updatedAnswers);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  const handleQuizNext = () => {
    // Save current answer before moving
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - submit all answers
      handleSubmitAllAnswers();
    }
  };

  const handleSubmitAllAnswers = async () => {
    if (!diagnosticId) {
      return;
    }

    // Ensure all questions are answered
    const allQuestionIds = questions.map((q) => q.id);
    const answeredQuestionIds = answers.map((a) => a.question_id);
    const missingQuestions = allQuestionIds.filter(
      (id) => !answeredQuestionIds.includes(id)
    );

    if (missingQuestions.length > 0) {
      // Find the first unanswered question and go to it
      const firstMissingIndex = questions.findIndex((q) =>
        missingQuestions.includes(q.id)
      );
      if (firstMissingIndex >= 0) {
        setCurrentQuestionIndex(firstMissingIndex);
      }
      return;
    }

    try {
      setCurrentScreen("loading");
      const response = await submitAnswers({
        diagnostic_id: diagnosticId,
        body: { answers },
      }).unwrap();

      setResults(response);
      setCurrentScreen("success");
    } catch (error: any) {
      console.error("Error submitting answers:", error);
      setCurrentScreen("quiz");
      // You could show an error alert here
    }
  };

  const handleOnboardingContinue = (value: string) => {
    setOnboardingAnswers({
      ...onboardingAnswers,
      [onboardingSteps[onboardingStep].id]: value,
    });

    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // All steps completed, start diagnostic
      handleStartDiagnostic();
    }
  };

  const handleOnboardingBack = () => {
    if (onboardingStep === 0) {
      // First step - show confirmation
      setShowExitConfirm(true);
    } else {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleExitConfirm = async () => {
    setShowExitConfirm(false);
    // Logout user first so they can go back to login
    const { logout } = useAuthStore.getState();
    await logout();
    // Small delay to ensure state updates
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 100);
  };

  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

  // Convert API questions to quiz format
  const quizQuestions = questions.map((q) => ({
    id: q.id,
    question: q.prompt,
    options: [q.options.A, q.options.B, q.options.C, q.options.D],
    subject: q.subject,
    difficulty: q.difficulty,
  }));

  const currentAnswer = answers.find(
    (a) => a.question_id === questions[currentQuestionIndex]?.id,
  );

  if (currentScreen === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B7FD1" />
        <Text style={styles.loadingText}>
          {isStarting
            ? "Preparing your diagnostic test..."
            : isSubmitting
            ? "Calculating your results..."
            : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {currentScreen === "onboarding" && (
        <OnboardingScreen
          steps={onboardingSteps as any}
          currentStepIndex={onboardingStep}
          selectedValue={onboardingAnswers[onboardingSteps[onboardingStep]?.id]}
          onSelectOption={(value) => {
            // Store temporarily but don't advance yet
          }}
          onNext={handleOnboardingContinue}
          onBack={handleOnboardingBack}
          onComplete={handleStartDiagnostic}
        />
      )}

      {currentScreen === "quiz" && questions.length > 0 && (
        <QuizScreen
          questions={quizQuestions}
          currentQuestionIndex={currentQuestionIndex}
          selectedAnswer={currentAnswer?.selected_option}
          selectedConfidence={currentAnswer?.confidence}
          onAnswerSelect={(option, confidence) => {
            handleAnswerSelect(
              questions[currentQuestionIndex].id,
              option,
              confidence,
            );
          }}
          onNextQuestion={handleQuizNext}
          onComplete={handleSubmitAllAnswers}
        />
      )}

      {currentScreen === "success" && results && (
        <SuccessScreen
          results={results}
          onContinue={() => {
            router.replace("/(tabs)/home");
          }}
        />
      )}

      <CustomAlert
        visible={showExitConfirm}
        title="Exit Diagnostic?"
        message="Are you sure you want to go back to login? Your progress will be lost."
        type="warning"
        onClose={handleExitCancel}
        onConfirm={handleExitConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
