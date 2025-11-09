import { useUIStore } from "@/store/uiStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";

// IGCSE/WAEC Question Interfaces
interface MCQQuestion {
  questionType: "MCQ";
  questionText: string;
  diagramUrl: string | null;
}

interface TheoryQuestion {
  questionType: "Theory";
  questionText: string;
  diagramUrl: string | null;
}

type IgcseWaecQuestion = MCQQuestion | TheoryQuestion;

const { width } = Dimensions.get("window");

// IGCSE/WAEC Exam Session Screen
const IgcseWaecExamSessionScreen = ({ examConfig, onRetakeExam }: any) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<number, string>>(
    {},
  );
  const [timeRemaining, setTimeRemaining] = useState(examConfig.timerDuration);
  const [timerActive, setTimerActive] = useState(true);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResults, setExamResults] = useState<any>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentView, setCurrentView] = useState("exam");

  // IMPORTANT: These endpoints exist in this backend:
  // - POST /api/answers/mcq/submit
  // - POST /api/answers/theory/evaluate (multipart/form-data)
  // There is NOT a /api/solve-question nor /api/analyze-student-answer in this repo.
  const BACKEND_BASE_URL = "https://igcse-wine.vercel.app";

  const { setHeaderVisible, setBottomNavVisible } = useUIStore();
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    setHeaderVisible(false);
    setBottomNavVisible(false);
    return () => {
      setHeaderVisible(true);
      setBottomNavVisible(true);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera and gallery permissions to upload answer images.",
        );
      }
    })();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeRemaining > 0 && !examCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setTimerActive(false);
            handleSubmitExam();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining, examCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Robust MCQ parser: strips options out of the question display, supports:
  // - Multi-line options: "A. ...\nB. ...\nC. ...\nD. ..."
  // - Parentheses format: "A) ...\nB) ...\nC) ...\nD) ..."
  // - Handles "Q1:" prefixes
  // - Extracts correct answer from asterisk
  const parseMCQQuestion = (questionText: string) => {
    if (!questionText) {
      return {
        question: "",
        options: [] as { letter: string; text: string; isCorrect: boolean }[],
      };
    }

    let text = questionText;

    // Remove "Q1:", "Q2:", etc. prefix if present (matches web version)
    text = text.replace(/^Q\d+:\s*/i, "");

    // Find the first occurrence of an option marker (A/B/C/D with . or ))
    const firstOptionIdx = text.search(/(?:^|\n)[A-D][\.\)]\s/);
    let mainQuestion = text;
    let optionsText = "";

    if (firstOptionIdx !== -1) {
      mainQuestion = text.slice(0, firstOptionIdx).trim();
      optionsText = text.slice(firstOptionIdx).trim();
    } else {
      // Same-line options fallback: try to detect A/B/C/D sequence on one line
      const inlineMatch = text.match(
        /([A-D])[\.\)]\s+[^*]+(\*?)(?=\s+[A-D][\.\)]|\s*$)/g,
      );
      if (inlineMatch && inlineMatch.length >= 2) {
        // Assume everything before the first match is the main question
        const firstInlineIndex = text.indexOf(inlineMatch[0]);
        mainQuestion = text.slice(0, firstInlineIndex).trim();
        optionsText = text.slice(firstInlineIndex).trim();
      }
    }

    const options: { letter: string; text: string; isCorrect: boolean }[] = [];
    if (optionsText) {
      // Split options by newline or space before option markers
      const rawOptions = optionsText.split(
        /\n(?=[A-D][\.\)]\s)|(?<=\S)\s(?=[A-D][\.\)]\s)/g,
      );
      rawOptions.forEach((chunk) => {
        const m = chunk.trim().match(/^([A-D])[\.\)]\s+([\s\S]*?)\s*(\*?)$/);
        if (m) {
          const [, letter, text, star] = m;
          options.push({
            letter,
            text: text.replace(/\*/g, "").trim(),
            isCorrect: !!star,
          });
        }
      });
    }

    // If we still didn't find options, try the final fallback splitting
    if (options.length === 0) {
      const fallback = text.split(/(?=(?:^|\n)[A-D][\.\)]\s)/g);
      if (fallback.length > 1) {
        mainQuestion = fallback[0].trim();
        fallback.slice(1).forEach((opt) => {
          const m = opt.trim().match(/^([A-D])[\.\)]\s+([\s\S]*?)\s*(\*?)$/);
          if (m) {
            const [, letter, text, star] = m;
            options.push({
              letter,
              text: text.replace(/\*/g, "").trim(),
              isCorrect: !!star,
            });
          }
        });
      }
    }

    // As a last resort, if no options parsed, leave the whole thing as the question
    if (options.length === 0) {
      return { question: text.trim(), options: [] };
    }

    return { question: mainQuestion.trim(), options };
  };

  const handleMCQAnswerSelect = async (letter: string) => {
    if (examCompleted) return;

    const currentQuestion = examConfig.questions[
      currentQuestionIndex
    ] as MCQQuestion;
    const { options } = parseMCQQuestion(currentQuestion.questionText);
    const selectedOption = options.find((opt) => opt?.letter === letter);
    if (!selectedOption) return;

    setMcqAnswers((prev) => ({ ...prev, [currentQuestionIndex]: letter }));

    try {
      const questionId = `q${currentQuestionIndex + 1}`;
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/answers/mcq/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId,
            selectedOption: letter,
            examType: examConfig.examType,
            subject: examConfig.subject,
            timestamp: new Date().toISOString(),
          }),
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Failed to submit MCQ answer:", error);
    }
  };

  const isAnswerCorrect = (questionIndex: number): boolean => {
    const question = examConfig.questions[questionIndex];
    if (question.questionType !== "MCQ") return false;
    const { options } = parseMCQQuestion(question.questionText);
    const selectedLetter = mcqAnswers[questionIndex];
    const selectedOption = options.find(
      (opt) => opt?.letter === selectedLetter,
    );
    return selectedOption?.isCorrect ?? false;
  };

  const getAnswerStatus = (questionIndex: number) => {
    const question = examConfig.questions[questionIndex];
    if (question.questionType === "MCQ") {
      if (!mcqAnswers[questionIndex]) return "unanswered";
      if (!examCompleted) return "answered";
      return isAnswerCorrect(questionIndex) ? "correct" : "incorrect";
    } else {
      return theoryAnswers[questionIndex] ? "answered" : "unanswered";
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setTheoryAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: imageUri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setTheoryAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: imageUri,
        }));
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const removeImage = () => {
    setTheoryAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestionIndex];
      return next;
    });
  };

  const navigateToQuestion = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const handleSubmitExam = () => {
    setTimerActive(false);
    setExamCompleted(true);

    let correctAnswers = 0;
    let totalMCQ = 0;

    examConfig.questions.forEach(
      (question: IgcseWaecQuestion, index: number) => {
        if (question.questionType === "MCQ") {
          totalMCQ++;
          const userAnswer = mcqAnswers[index];
          if (userAnswer) {
            const { options } = parseMCQQuestion(question.questionText);
            const selectedOption = options.find(
              (opt) => opt?.letter === userAnswer,
            );
            if (selectedOption?.isCorrect) correctAnswers++;
          }
        }
      },
    );

    const score =
      totalMCQ > 0 ? Math.round((correctAnswers / totalMCQ) * 100) : 0;
    setExamResults({
      score,
      correctAnswers,
      totalMCQ,
      totalQuestions: examConfig.questions.length,
      timeUsed: examConfig.timerDuration - timeRemaining,
    });

    setCurrentView("results");
    setShowSubmitConfirm(false);
  };

  // Evaluate theory answer using the backend route that exists: /api/answers/theory/evaluate
  // It expects multipart/form-data with fields: question, subject, and either 'answer' or 'answerImage' file.
  const evaluateTheoryAnswer = async (questionIndex: number) => {
    const question = examConfig.questions[questionIndex] as TheoryQuestion;
    const answerImageUri = theoryAnswers[questionIndex];
    if (!answerImageUri) {
      Alert.alert(
        "Error",
        "Please upload an image of your answer before evaluating.",
      );
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("question", question.questionText);
      form.append("subject", examConfig.subject);
      form.append("answer", ""); // leave empty; image is provided
      form.append("answerImage", {
        uri: answerImageUri,
        name: "answer.jpg",
        type: "image/jpeg",
      } as any);

      const resp = await fetch(
        `${BACKEND_BASE_URL}/api/answers/theory/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          body: form,
        },
      );

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Evaluate failed: ${resp.status} ${t}`);
      }

      const data = await resp.json();
      // This endpoint returns { solution, imageReceived }
      setSolution(
        data?.solution || "<p>No evaluation available for this answer.</p>",
      );
      setShowSolution(true);
    } catch (error) {
      console.error("Failed to evaluate answer:", error);
      Alert.alert("Error", "Failed to evaluate answer.");
    } finally {
      setUploading(false);
    }
  };

  // Get model solution by reusing the same evaluate endpoint with a minimal text answer
  const getQuestionSolution = async (questionText: string) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("question", questionText);
      form.append("subject", examConfig.subject);
      form.append("answer", "Please provide a full model solution."); // satisfies API requirement

      const resp = await fetch(
        `${BACKEND_BASE_URL}/api/answers/theory/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          body: form,
        },
      );

      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const data = await resp.json();
      setSolution(data?.solution || "<p>No solution available.</p>");
      setShowSolution(true);
    } catch (error) {
      console.error("Failed to get solution:", error);
      Alert.alert("Error", "Failed to get solution.");
    } finally {
      setLoading(false);
    }
  };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudioExplanation = async (explanationText: string) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }

      setAudioLoading(true);
      // Optional: only call if your backend implements this
      const response = await fetch(`${BACKEND_BASE_URL}/api/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanation: explanationText }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const audioData = await response.json();
      if (!audioData.audioDataUri)
        throw new Error("No audio data received from server");

      const newSound = new Audio.Sound();
      await newSound.loadAsync({ uri: audioData.audioDataUri });
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setSound(null);
          }
        }
      });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to generate or play audio:", error);
      Alert.alert("Error", "Audio not available.");
    } finally {
      setAudioLoading(false);
    }
  };

  const renderMCQQuestion = (question: MCQQuestion) => {
    const { question: questionText, options } = parseMCQQuestion(
      question.questionText,
    );
    const selectedAnswer = mcqAnswers[currentQuestionIndex];

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{questionText}</Text>

        {question.diagramUrl && (
          <Image
            source={{ uri: question.diagramUrl }}
            style={styles.diagramImage}
          />
        )}

        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = selectedAnswer === option.letter;
            return (
              <TouchableOpacity
                key={option.letter}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                ]}
                onPress={() => handleMCQAnswerSelect(option.letter)}
                activeOpacity={0.7}
                disabled={examCompleted}
              >
                <View
                  style={[
                    styles.optionIndicator,
                    isSelected && styles.optionIndicatorSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetter,
                      isSelected && styles.optionLetterSelected,
                    ]}
                  >
                    {option.letter}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {examCompleted && (
          <TouchableOpacity
            style={styles.seeSolutionButton}
            onPress={() => getQuestionSolution(question.questionText)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={16}
                  color="#4A90E2"
                />
                <Text style={styles.seeSolutionText}>See Solution</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTheoryQuestion = (question: TheoryQuestion) => {
    const currentAnswer = theoryAnswers[currentQuestionIndex];

    return (
      <View style={styles.theoryContainer}>
        <Text style={styles.questionText}>{question.questionText}</Text>

        {question.diagramUrl && (
          <Image
            source={{ uri: question.diagramUrl }}
            style={styles.diagramImage}
          />
        )}

        <Text style={styles.theoryAnswerLabel}>Upload Your Answer:</Text>

        {currentAnswer ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: currentAnswer }} style={styles.answerImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeImage}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadButtonsContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={24} color="#4A90E2" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <MaterialCommunityIcons name="image" size={24} color="#4A90E2" />
              <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {!examCompleted && currentAnswer && (
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={() => evaluateTheoryAnswer(currentQuestionIndex)}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.evaluateButtonText}>Evaluate Answer</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {examCompleted && !currentAnswer && (
          <TouchableOpacity
            style={styles.seeSolutionButton}
            onPress={() => getQuestionSolution(question.questionText)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={16}
                  color="#4A90E2"
                />
                <Text style={styles.seeSolutionText}>See Solution</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuestionContent = (question: IgcseWaecQuestion) => {
    return question.questionType === "MCQ"
      ? renderMCQQuestion(question)
      : renderTheoryQuestion(question);
  };

  const renderExamView = () => (
    <>
      <View style={styles.examHeader}>
        <View style={styles.examHeaderContent}>
          <View style={styles.examInfo}>
            <Text style={styles.examSubject}>
              {examConfig.subject} - {examConfig.examType}
            </Text>
            <Text style={styles.examDetails}>{examConfig.year} Exam</Text>
            <Text style={styles.questionNumber}>
              Question {currentQuestionIndex + 1}/{examConfig.questions.length}{" "}
              •{examConfig.questions[currentQuestionIndex]?.questionType}
            </Text>
          </View>
          <View style={styles.examHeaderRight}>
            <View style={styles.timerBadge}>
              <View style={styles.clockContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color="#856404"
                />
                <Text style={styles.timerBadgeText}>
                  {formatTime(timeRemaining)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setShowSubmitConfirm(true)}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.examContent}
        showsVerticalScrollIndicator={false}
      >
        {examConfig.questions.length > 0 && (
          <View style={styles.questionCard}>
            {renderQuestionContent(examConfig.questions[currentQuestionIndex])}
          </View>
        )}

        <View style={styles.questionGrid}>
          {examConfig.questions.map(
            (question: IgcseWaecQuestion, index: number) => {
              const status = getAnswerStatus(index);
              const isAnswered = status !== "unanswered";
              const isCurrent = currentQuestionIndex === index;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridItem,
                    isAnswered && styles.gridItemAnswered,
                    isCurrent && styles.gridItemCurrent,
                    status === "correct" && styles.gridItemCorrect,
                    status === "incorrect" && styles.gridItemIncorrect,
                    question.questionType === "Theory" && styles.gridItemTheory,
                  ]}
                  onPress={() => navigateToQuestion(index)}
                >
                  <Text
                    style={[
                      styles.gridItemText,
                      (isAnswered || isCurrent) && styles.gridItemTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                  {question.questionType === "Theory" && (
                    <Text style={styles.theoryIndicator}>T</Text>
                  )}
                </TouchableOpacity>
              );
            },
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.backButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={() =>
              currentQuestionIndex > 0 &&
              navigateToQuestion(currentQuestionIndex - 1)
            }
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons name="chevron-back" size={16} color="#000" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              currentQuestionIndex === examConfig.questions.length - 1 &&
                styles.navButtonDisabled,
            ]}
            onPress={() =>
              currentQuestionIndex < examConfig.questions.length - 1 &&
              navigateToQuestion(currentQuestionIndex + 1)
            }
            disabled={currentQuestionIndex === examConfig.questions.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );

  const renderResultsView = () => {
    const percentageScore = examResults
      ? (examResults.correctAnswers / examResults.totalMCQ) * 100
      : 0;
    let iconSource;
    if (percentageScore <= 20)
      iconSource = require("@/assets/tired-man-sleeping-on-floor.png");
    else if (percentageScore <= 40)
      iconSource = require("@/assets/girl-taking-funny-photo.png");
    else if (percentageScore <= 60)
      iconSource = require("@/assets/happy-woman-makes-heart-shape-by-her-hand.png");
    else if (percentageScore <= 80)
      iconSource = require("@/assets/young-man-rejoicing-success.png");
    else iconSource = require("@/assets/happy-woman-jumping-with-confetti.png");

    return (
      <>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Exam Results</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsSubject}>
            {examConfig.subject} {examConfig.examType} Exam
          </Text>

          {examResults && (
            <>
              <Text style={styles.scoreDisplay}>
                You scored {examResults.correctAnswers} out of{" "}
                {examResults.totalMCQ} MCQ questions
              </Text>
              <View style={styles.completionCard}>
                <View style={styles.completionIcon}>
                  <Image
                    source={iconSource}
                    style={styles.completionIconImage}
                  />
                </View>
                <Text style={styles.completionMessage}>
                  {percentageScore >= 50
                    ? "Well done! You have successfully completed your exam. You may now review your answers below."
                    : "Don't worry, you can always try again. Review your answers below to learn from your mistakes."}
                </Text>
                <TouchableOpacity
                  style={styles.viewResultButton}
                  onPress={() => setCurrentView("review")}
                >
                  <Text style={styles.viewResultButtonText}>View Result</Text>
                  <View style={styles.viewResultButtonIcon}>
                    <Ionicons name="arrow-forward" size={16} color="#0961F5" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </>
    );
  };

  const renderReviewView = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Review Answers</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reviewHeader}>
        <Text style={styles.reviewSubject}>
          {examConfig.examType} • {examConfig.year} • {examConfig.difficulty}
        </Text>
        <Text style={styles.reviewScore}>
          You scored{" "}
          <Text style={styles.scoreNumber}>
            {examResults?.correctAnswers || 0}
          </Text>{" "}
          out of{" "}
          <Text style={styles.totalNumber}>{examResults?.totalMCQ || 0}</Text>{" "}
          MCQ questions
        </Text>
      </View>

      <ScrollView
        style={styles.reviewContent}
        showsVerticalScrollIndicator={false}
      >
        {examConfig.questions.map(
          (question: IgcseWaecQuestion, questionIndex: number) => {
            const isTheory = question.questionType === "Theory";
            return (
              <View key={questionIndex} style={styles.reviewQuestionCard}>
                <View style={styles.reviewQuestionHeader}>
                  <Text style={styles.reviewQuestionNumber}>
                    Question {questionIndex + 1}/{examConfig.questions.length} •{" "}
                    {question.questionType}
                  </Text>
                </View>

                <Text style={styles.reviewQuestionText}>
                  {isTheory
                    ? question.questionText
                    : parseMCQQuestion(question.questionText).question}
                </Text>

                {isTheory ? (
                  <View style={styles.theoryReviewContainer}>
                    <Text style={styles.theoryAnswerLabel}>Your Answer:</Text>
                    {theoryAnswers[questionIndex] ? (
                      <Image
                        source={{ uri: theoryAnswers[questionIndex] }}
                        style={styles.reviewAnswerImage}
                      />
                    ) : (
                      <Text style={styles.noAnswerText}>
                        No answer provided
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.reviewOptionsContainer}>
                    {parseMCQQuestion(question.questionText).options.map(
                      (option, optionIndex) => {
                        const isUserAnswer =
                          mcqAnswers[questionIndex] === option.letter;
                        const isCorrectAnswer = option.isCorrect;

                        let optionStyle = styles.reviewOptionItem;
                        let indicatorStyle = styles.reviewOptionIndicator;
                        let letterStyle = styles.reviewOptionLetter;

                        if (isCorrectAnswer) {
                          optionStyle = [
                            styles.reviewOptionItem,
                            styles.reviewOptionCorrect,
                          ];
                          indicatorStyle = [
                            styles.reviewOptionIndicator,
                            styles.reviewOptionIndicatorCorrect,
                          ];
                          letterStyle = [
                            styles.reviewOptionLetter,
                            styles.reviewOptionLetterCorrect,
                          ];
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          optionStyle = [
                            styles.reviewOptionItem,
                            styles.reviewOptionIncorrect,
                          ];
                          indicatorStyle = [
                            styles.reviewOptionIndicator,
                            styles.reviewOptionIndicatorIncorrect,
                          ];
                          letterStyle = [
                            styles.reviewOptionLetter,
                            styles.reviewOptionLetterIncorrect,
                          ];
                        }

                        return (
                          <View key={optionIndex} style={optionStyle}>
                            <View style={indicatorStyle}>
                              <Text style={letterStyle}>{option.letter}</Text>
                              {isCorrectAnswer && (
                                <View style={styles.checkMarkContainer}>
                                  <Ionicons
                                    name="checkmark"
                                    size={12}
                                    color="#FFFFFF"
                                  />
                                </View>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <View style={styles.crossMarkContainer}>
                                  <Ionicons
                                    name="close"
                                    size={12}
                                    color="#FFFFFF"
                                  />
                                </View>
                              )}
                            </View>
                            <Text style={styles.reviewOptionText}>
                              {option.text}
                            </Text>
                          </View>
                        );
                      },
                    )}
                  </View>
                )}

                {isTheory && theoryAnswers[questionIndex] && (
                  <TouchableOpacity
                    style={styles.reviewSeeExplanationButton}
                    onPress={() => evaluateTheoryAnswer(questionIndex)}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#4A90E2" />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="file-document-edit"
                          size={16}
                          color="#4A90E2"
                        />
                        <Text style={styles.reviewSeeExplanationText}>
                          Evaluate Answer
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {!isTheory && (
                  <TouchableOpacity
                    style={styles.seeSolutionButton}
                    onPress={() => getQuestionSolution(question.questionText)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#4A90E2" />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="lightbulb-outline"
                          size={16}
                          color="#4A90E2"
                        />
                        <Text style={styles.seeSolutionText}>See Solution</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          },
        )}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {currentView === "exam" && renderExamView()}
        {currentView === "results" && renderResultsView()}
        {currentView === "review" && renderReviewView()}

        <Modal visible={showSubmitConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>
                Are you sure you want to submit?
              </Text>
              <Text style={styles.confirmMessage}>
                Once you click "Submit" you can't edit your answers again.
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={styles.goBackButton}
                  onPress={() => setShowSubmitConfirm(false)}
                >
                  <Text style={styles.goBackButtonText}>Go back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmSubmitButton}
                  onPress={handleSubmitExam}
                >
                  <Text style={styles.confirmSubmitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showSolution}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={24}
                  color="#4A90E2"
                />
                <Text style={styles.modalTitle}>
                  {examConfig.questions[currentQuestionIndex]?.questionType ===
                  "Theory"
                    ? "Evaluation"
                    : "Solution"}
                </Text>
              </View>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={async () => {
                    if (!solution) return;
                    setAudioLoading(true);
                    try {
                      await playAudioExplanation(solution);
                    } finally {
                      setAudioLoading(false);
                    }
                  }}
                  disabled={audioLoading}
                >
                  {audioLoading ? (
                    <ActivityIndicator size={18} color="#4A90E2" />
                  ) : (
                    <Ionicons name="volume-high" size={22} color="#4A90E2" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={async () => {
                    if (sound) {
                      await sound.stopAsync();
                      await sound.unloadAsync();
                      setSound(null);
                      setIsPlaying(false);
                    }
                    setShowSolution(false);
                  }}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {solution ? (
                <RenderHTML
                  contentWidth={windowWidth - 40}
                  source={{ html: solution }}
                  baseStyle={styles.solutionText}
                />
              ) : (
                <Text style={styles.solutionText}>No solution available.</Text>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Complete Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#5580D4" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  exitButton: {
    flexDirection: "row",
    backgroundColor: "#0961F5",
    alignItems: "center",
    padding: 10,
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  exitButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  content: { flex: 1, paddingHorizontal: 20 },
  examHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  examHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  examInfo: { flex: 1 },
  examSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  examDetails: { fontSize: 12, color: "#666666", marginBottom: 2 },
  questionNumber: { fontSize: 12, color: "#666666" },
  examHeaderRight: { flexDirection: "row", alignItems: "center" },
  timerBadge: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  clockContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  timerBadgeText: { fontSize: 16, fontWeight: "600", color: "#856404" },
  submitButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 30,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  examContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  questionCard: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionContainer: { marginBottom: 24 },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    lineHeight: 22,
    marginBottom: 20,
  },
  optionsContainer: { marginBottom: 20 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  optionItemSelected: { backgroundColor: "#EBF4FF", borderColor: "#4A90E2" },
  optionItemCorrect: { backgroundColor: "#D4F7DC", borderColor: "#10B981" },
  optionItemIncorrect: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  optionIndicatorSelected: {
    borderColor: "#4A90E2",
    backgroundColor: "#4A90E2",
  },
  optionIndicatorCorrect: {
    borderColor: "#10B981",
    backgroundColor: "#10B981",
  },
  optionIndicatorIncorrect: {
    borderColor: "#EF4444",
    backgroundColor: "#EF4444",
  },
  optionLetter: { fontSize: 12, fontWeight: "600", color: "#666666" },
  optionLetterSelected: { color: "#FFFFFF" },
  optionText: { fontSize: 15, color: "#333333", flex: 1, lineHeight: 22 },
  checkMarkContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  crossMarkContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  theoryContainer: { marginBottom: 20 },
  diagramImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "contain",
  },
  theoryAnswerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 12,
  },
  uploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A90E2",
    marginTop: 8,
  },
  imagePreviewContainer: { position: "relative", marginBottom: 16 },
  answerImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "contain",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    padding: 4,
  },
  evaluateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  evaluateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  seeSolutionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  seeSolutionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A90E2",
    marginLeft: 6,
  },
  questionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  gridItem: {
    width: (width - 60) / 10,
    height: (width - 60) / 10,
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#5580D4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  gridItemAnswered: { backgroundColor: "#4A90E2" },
  gridItemCurrent: {
    backgroundColor: "#fff",
    borderColor: "#FECB51",
    borderWidth: 1,
  },
  gridItemCorrect: { backgroundColor: "#10B981" },
  gridItemIncorrect: { backgroundColor: "#EF4444" },
  gridItemTheory: { borderColor: "#FF6B35" },
  gridItemText: { fontSize: 12, fontWeight: "600", color: "#666666" },
  gridItemTextActive: { color: "#000" },
  theoryIndicator: {
    fontSize: 8,
    color: "#FF6B35",
    position: "absolute",
    top: 2,
    right: 2,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 4,
  },
  backButton: {
    backgroundColor: "#fff",
    borderColor: "#4A90E2",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 4,
  },
  nextButton: { backgroundColor: "#4A90E2" },
  navButtonDisabled: { backgroundColor: "#E0E0E0" },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  backButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  resultsSubject: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  scoreDisplay: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  completionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completionIcon: { marginBottom: 16 },
  completionIconImage: { width: 100, height: 100, resizeMode: "contain" },
  completionMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  viewResultButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewResultButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  viewResultButtonIcon: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  reviewSubject: { fontSize: 14, color: "#666666", marginBottom: 4 },
  reviewScore: { fontSize: 16, color: "#666666" },
  scoreNumber: { color: "#10B981", fontWeight: "600" },
  totalNumber: { color: "#4A90E2", fontWeight: "600" },
  reviewContent: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  reviewQuestionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewQuestionHeader: { marginBottom: 12 },
  reviewQuestionNumber: { fontSize: 12, color: "#666666", fontWeight: "500" },
  reviewQuestionText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: "500",
  },
  reviewOptionsContainer: { marginBottom: 16 },
  reviewOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  reviewOptionCorrect: { backgroundColor: "#D4F7DC", borderColor: "#10B981" },
  reviewOptionIncorrect: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  reviewOptionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  reviewOptionIndicatorCorrect: { backgroundColor: "#10B981" },
  reviewOptionIndicatorIncorrect: { backgroundColor: "#EF4444" },
  reviewOptionLetter: { fontSize: 12, fontWeight: "600", color: "#666666" },
  reviewOptionLetterCorrect: { color: "#FFFFFF" },
  reviewOptionLetterIncorrect: { color: "#FFFFFF" },
  reviewOptionText: { fontSize: 14, color: "#000000", flex: 1 },
  theoryReviewContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reviewAnswerImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "contain",
  },
  noAnswerText: { fontSize: 14, color: "#666666", fontStyle: "italic" },
  reviewSeeExplanationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CBE3FF",
    borderRadius: 30,
    width: 200,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  reviewSeeExplanationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  confirmModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmActions: { flexDirection: "row", width: "100%" },
  goBackButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },
  goBackButtonText: { color: "#666666", fontSize: 14, fontWeight: "600" },
  confirmSubmitButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitleContainer: { flexDirection: "row", alignItems: "center" },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },
  modalHeaderActions: { flexDirection: "row", alignItems: "center" },
  audioButton: { padding: 8, marginRight: 8 },
  closeModalButton: { padding: 8 },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  solutionText: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    backgroundColor: "#e6ffe6",
    padding: 10,
    borderRadius: 8,
  },
});

export default IgcseWaecExamSessionScreen;
