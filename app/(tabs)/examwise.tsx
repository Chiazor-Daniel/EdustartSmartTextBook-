import { useUIStore } from '@/store/uiStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
import ExamTimerComponent from '../components/timer';
import IgcseWaecExamSessionScreen from '../components/igcseWaec';
// JAMB Question Interface (existing)
interface JambQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// IGCSE/WAEC Question Interface (new)
interface IgcseWaecQuestion {
  questionType: 'MCQ' | 'Theory';
  questionText: string;
  diagramUrl: string | null;
  options?: string[]; // For MCQ questions
  correctAnswer?: string; // For MCQ questions
}

const { width } = Dimensions.get('window');

// Screen 1: Exam Form/Setup Screen
const ExamFormScreen = ({ onBeginExam }) => {
  const [availableSubjects, setAvailableSubjects] = useState(['Physics', 'Chemistry', 'Biology', 'Mathematics']);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState<'JAMB' | 'IGCSE' | 'WAEC'>('JAMB');
  const [examYear, setExamYear] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timerDuration, setTimerDuration] = useState<number | 'No Timer'>(30);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showExamTypeDropdown, setShowExamTypeDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => ((currentYear - 5) + i).toString());
  const [loading, setLoading] = useState(false);

  const BASE_URL = 'https://class-fi.vercel.app';
  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const examTypeOptions = ['JAMB', 'IGCSE', 'WAEC'];
  const timerOptions = ['No Timer', 20, 30, 45, 60];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/subjects`);
      if (response.ok) {
        const subjects = await response.json();
        setAvailableSubjects(subjects);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBeginExam = async () => {
    if (!selectedSubject || !examYear || !difficulty || !examType) {
      Alert.alert('Error', 'Exam type, subject, year, and difficulty are required');
      return;
    }

    setLoading(true);
    try {
      let examQuestions = [];

      if (examType === 'JAMB') {
        // Use existing JAMB API (keep the original BASE_URL)
        const response = await fetch(`${BASE_URL}/api/generate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            subject: selectedSubject,
            year: parseInt(examYear),
            difficulty: difficulty
          }),
        });

        if (response.ok) {
          const examData = await response.json();
          examQuestions = examData.questions || [];
        } else {
          // Mock JAMB data
          examQuestions = [
            {
              question: "Which structure is NOT found in animal cells?",
              options: ["Cell wall", "Cell membrane", "Cytoplasm", "Nucleus"],
              correctAnswer: "Cell wall"
            },
            {
              question: "Organisms that can interbreed and produce fertile offspring belong to the same:",
              options: ["Genus", "Family", "Species", "Class"],
              correctAnswer: "Species"
            }
          ];
        }
      } else {
        // Use IGCSE/WAEC API with localhost:9000
        const IGCSE_BASE_URL = 'https://igcse-wine.vercel.app';

        // Fetch MCQ questions
        const mcqResponse = await fetch(
          `${IGCSE_BASE_URL}/api/questions/mcq?examBoard=${examType}&subject=${selectedSubject}&targetYear=${parseInt(examYear)}`
        );

        // Fetch Theory questions
        const theoryResponse = await fetch(
          `${IGCSE_BASE_URL}/api/questions/theory?examBoard=${examType}&subject=${selectedSubject}&targetYear=${parseInt(examYear)}`
        );

        let mcqQuestions = [];
        let theoryQuestions = [];

        if (mcqResponse.ok) {
          const mcqData = await mcqResponse.json();
          mcqQuestions = mcqData.questions || [];
        } else {
          // Mock MCQ data
          mcqQuestions = [
            {
              questionType: "MCQ",
              questionText: "Which structure is NOT found in animal cells?\nA) Cell wall\nB) Cell membrane\nC) *Cytoplasm\nD) Nucleus",
              diagramUrl: null
            },
            {
              questionType: "MCQ",
              questionText: "Which plant tissue transports water from the roots to the leaves?\nA) Phloem\nB) *Xylem\nC) Cambium\nD) Epidermis",
              diagramUrl: null
            }
          ];
        }

        if (theoryResponse.ok) {
          const theoryData = await theoryResponse.json();
          theoryQuestions = theoryData.questions || [];
        } else {
          // Mock Theory data
          theoryQuestions = [
            {
              questionType: "Theory",
              questionText: "Explain the process of photosynthesis in plants. Include the reactants, products, and the role of chlorophyll.",
              diagramUrl: null
            }
          ];
        }

        // Combine MCQ and Theory questions
        examQuestions = [...mcqQuestions, ...theoryQuestions];
      }

      const examConfig = {
        examType: examType,
        subject: selectedSubject,
        year: examYear,
        difficulty: difficulty,
        timerDuration: timerDuration === 'No Timer' ? 0 : timerDuration * 60,
        questions: examQuestions
      };

      onBeginExam(examConfig);
    } catch (error) {
      console.error('Failed to generate exam:', error);
      Alert.alert('Error', 'Failed to generate exam');
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (minutes) => {
    if (minutes === 'No Timer') return 'No Timer';
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Take an Exam</Text>
            </View>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Ready to <Text style={styles.testText}>test</Text> your knowledge?</Text>
            <Text style={styles.welcomeTitle}>Fill the form below to generate questions.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clipboard-list" size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Generate Mock Exam</Text>
            </View>

            {/* Exam Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exam Type *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowExamTypeDropdown(!showExamTypeDropdown)}
              >
                <Text style={[styles.selectText, !examType && styles.placeholderText]}>
                  {examType || 'Select exam type'}
                </Text>
                <Ionicons
                  name={showExamTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showExamTypeDropdown && (
                <View style={styles.dropdown}>
                  {examTypeOptions.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setExamType(type as 'JAMB' | 'IGCSE' | 'WAEC');
                        setShowExamTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Subject Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                <Text style={[styles.selectText, !selectedSubject && styles.placeholderText]}>
                  {selectedSubject || 'Select your subject'}
                </Text>
                <Ionicons
                  name={showSubjectDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showSubjectDropdown && (
                <View style={styles.dropdown}>
                  {availableSubjects.map((subject, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSubject(subject);
                        setShowSubjectDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{subject}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Year *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowYearDropdown(!showYearDropdown)}
              >
                <Text style={[styles.selectText, !examYear && styles.placeholderText]}>
                  {examYear || 'Select target year'}
                </Text>
                <Ionicons
                  name={showYearDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showYearDropdown && (
                <View style={styles.dropdown}>
                  {[2025, 2026].map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setExamYear(year.toString());
                        setShowYearDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
              >
                <Text style={[styles.selectText, !difficulty && styles.placeholderText]}>
                  {difficulty || 'Select difficulty level'}
                </Text>
                <Ionicons
                  name={showDifficultyDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showDifficultyDropdown && (
                <View style={styles.dropdown}>
                  {difficultyOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setDifficulty(option);
                        setShowDifficultyDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleBeginExam}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.generateButtonText}>Generate Questions</Text>
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Screen 2: Exam Session Screen
const JambExamSessionScreen = ({ examConfig, onRetakeExam }: any) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(examConfig.timerDuration);
  const [timerActive, setTimerActive] = useState(true);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResults, setExamResults] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentView, setCurrentView] = useState('exam'); // 'exam', 'results', 'review'

  const BASE_URL = 'https://class-fi.vercel.app';
  const { setHeaderVisible, setBottomNavVisible } = useUIStore();

   useEffect(() => {
      // Hide navigation when entering this screen
      setHeaderVisible(false);
      setBottomNavVisible(false);

      return () => {
        // Restore navigation when leaving this screen
        setHeaderVisible(true);
        setBottomNavVisible(true);
      };
    }, []);
  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0 && !examCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setTimerActive(false);
            handleSubmitExam();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, examCompleted]);

  // Set selected answer when navigating questions
  useEffect(() => {
    setSelectedAnswer(userAnswers[currentQuestionIndex] || null);
  }, [currentQuestionIndex, userAnswers]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    // Always set the selected answer
    setSelectedAnswer(answerIndex);
    // Update the user answers state
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const navigateToQuestion = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const handleSubmitExam = () => {
    setTimerActive(false);
    setExamCompleted(true);

    // Calculate results
    let correctAnswers = 0;
    examConfig.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer !== undefined && question.options[userAnswer] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / examConfig.questions.length) * 100);
    setExamResults({
      score,
      correctAnswers,
      totalQuestions: examConfig.questions.length,
      timeUsed: examConfig.timerDuration - timeRemaining
    });

    setCurrentView('results');
    setShowSubmitConfirm(false);
  };

  const getSolution = async (question: Question) => {
    setLoading(true);
    try {
      const requestPayload = {
        question: question.question,
        options: question.options,  // Already string[] from updated interface
        correctAnswer: question.correctAnswer
      };

      const response = await fetch(`${BASE_URL}/api/solve-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload),
      });

      if (response.ok) {
        const solutionData = await response.json();
        if (solutionData && solutionData.explanation) {
          setSolution(solutionData.explanation);
        } else {
          console.error('Invalid solution data:', solutionData);
          setSolution(`The correct answer is "${question.correctAnswer}". Unable to get detailed explanation.`);
        }
      } else {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        setSolution(`The correct answer is "${question.correctAnswer}". Server error: ${response.status}`);
      }
      setShowSolution(true);
    } catch (error) {
      console.error('Failed to get solution:', error);
      setSolution(`The correct answer is "${question.correctAnswer}". Network error occurred.`);
      setShowSolution(true);
    } finally {
      setLoading(false);
    }
  };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudioExplanation = async (explanationText: string) => {
    try {
      // If already playing, stop and unload previous sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }

      setAudioLoading(true);
      const response = await fetch(`${BASE_URL}/api/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ explanation: explanationText }),
      });

      const audioData = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      if (!audioData.audioDataUri) {
        throw new Error('No audio data received from server');
      }

      const newSound = new Audio.Sound();
      await newSound.loadAsync({ uri: audioData.audioDataUri });

      // Add status update listener
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
      console.error('Failed to generate or play audio:', error);
      Alert.alert('Error', 'Failed to generate or play audio explanation.');
    } finally {
      setAudioLoading(false);
    }
  };

  const getAnswerStatus = (questionIndex) => {
    if (userAnswers[questionIndex] !== undefined) {
      if (examCompleted) {
        const isCorrect = examConfig.questions[questionIndex].options[userAnswers[questionIndex]] === examConfig.questions[questionIndex].correctAnswer;
        return isCorrect ? 'correct' : 'incorrect';
      }
      return 'answered';
    }
    return 'unanswered';
  };

  const renderExamView = () => (
    <>
      <View style={styles.examHeader}>
        <View style={styles.examHeaderContent}>
          <View style={styles.examInfo}>
            <Text style={styles.examSubject}>{examConfig.subject}</Text>
            <Text style={styles.examDetails}>{examConfig.year} Exam</Text>
            <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}/{examConfig.questions.length}</Text>
          </View>
          <View style={styles.examHeaderRight}>
            <View style={styles.timerBadge}>
              <View style={styles.clockContainer}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#856404" />
                <Text style={styles.timerBadgeText}>{formatTime(timeRemaining)}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 0, paddingHorizontal: 0}}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setShowSubmitConfirm(true)}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.examContent} showsVerticalScrollIndicator={false}>
        {examConfig.questions.length > 0 && (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {examConfig.questions[currentQuestionIndex]?.question}
            </Text>

            <View style={styles.optionsContainer}>
              {examConfig.questions[currentQuestionIndex]?.options?.map((option, index) => {
                const isSelected = userAnswers[currentQuestionIndex] === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                  >
                    <View style={[
                      styles.optionIndicator,
                      isSelected && styles.optionIndicatorSelected,
                    ]}>
                      <Text style={[
                        styles.optionLetter,
                        isSelected && styles.optionLetterSelected,
                      ]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Show explanation button for all questions */}
            <TouchableOpacity
                style={styles.seeExplanationButton}
                onPress={() => getSolution(examConfig.questions[currentQuestionIndex])}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#4A90E2" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#4A90E2" />
                    <Text style={styles.seeExplanationText}>See Explanation</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Question Grid Navigator */}
        <View style={styles.questionGrid}>
          {examConfig.questions.map((_, index) => {
            const status = getAnswerStatus(index);
            const isAnswered = userAnswers[index] !== undefined;
            const isCurrent = currentQuestionIndex === index;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gridItem,
                  isAnswered && styles.gridItemAnswered,
                  isCurrent && styles.gridItemCurrent,
                  status === 'correct' && styles.gridItemCorrect,
                  status === 'incorrect' && styles.gridItemIncorrect,
                ]}
                onPress={() => navigateToQuestion(index)}
              >
                <Text style={[
                  styles.gridItemText,
                  (isAnswered || isCurrent) && styles.gridItemTextActive,
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.backButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={() => {
              if (currentQuestionIndex > 0) {
                navigateToQuestion(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons name="chevron-back" size={16} color="white" />
            <Text style={{color: '#000'}}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, currentQuestionIndex === examConfig.questions.length - 1 && styles.navButtonDisabled]}
            onPress={() => {
              if (currentQuestionIndex < examConfig.questions.length - 1) {
                navigateToQuestion(currentQuestionIndex + 1);
              }
            }}
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
    const percentageScore = (examResults?.correctAnswers / examResults?.totalQuestions) * 100;

    let iconSource;
    let iconName;

    if (percentageScore <= 20) {
      iconSource = require('@/assets/tired-man-sleeping-on-floor.png');
    } else if (percentageScore <= 40) {
      iconSource = require('@/assets/girl-taking-funny-photo.png');
    } else if (percentageScore <= 60) {
      iconSource = require('@/assets/happy-woman-makes-heart-shape-by-her-hand.png');
    } else if (percentageScore <= 80) {
      iconSource = require('@/assets/young-man-rejoicing-success.png');
    } else {
      iconSource = require('@/assets/happy-woman-jumping-with-confetti.png');
    }

    return (
      <>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Exam Results</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsSubject}>{examConfig.subject} Exam</Text>

          {examResults && (
            <>
              <Text style={styles.scoreDisplay}>
                You scored {examResults?.correctAnswers} out of {examResults?.totalQuestions}
              </Text>

              <View style={styles.completionCard}>
                <View style={styles.completionIcon}>
                  <Image source={iconSource} style={styles.completionIconImage} />
                </View>
                <Text style={styles.completionTitle}>{iconName}</Text>
                <Text style={styles.completionMessage}>
                  {percentageScore >= 50
                    ? 'Well done! You have successfully completed your exam. You may now review your answers below.'
                    : 'Don\'t worry, you can always try again. Review your answers below to learn from your mistakes.'
                  }
                </Text>
                <TouchableOpacity
                  style={styles.viewResultButton}
                  onPress={() => setCurrentView('review')}
                >
                  <Text style={styles.viewResultButtonText}>View Result</Text>
                  <View style={styles.viewResultButtonIcon}>
                    <Ionicons name="arrow-forward" size={16} color="#0961F5" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* <TouchableOpacity style={styles.retakeExamButton} onPress={onRetakeExam}>
            <Text style={styles.retakeExamButtonText}>Take Another Exam</Text>
          </TouchableOpacity> */}
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
          <TouchableOpacity style={{flexDirection: 'row', backgroundColor: '#0961F5', alignItems: 'center', padding: 10, borderRadius: 30, paddingHorizontal: 20}} onPress={() => router.push('/(tabs)/home')}>
            <Text style={{color: '#fff'}}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reviewHeader}>
        <Text style={styles.reviewSubject}>{examConfig.year} • {examConfig.difficulty}</Text>
        <Text style={styles.reviewScore}>
          You scored <Text style={styles.scoreNumber}>{examResults?.correctAnswers || 0}</Text> out of <Text style={styles.totalNumber}>{examResults?.totalQuestions || 0}</Text>
        </Text>
      </View>

      <ScrollView style={styles.reviewContent} showsVerticalScrollIndicator={false}>
        {examConfig.questions.map((question, questionIndex) => {
          const userAnswerIndex = userAnswers[questionIndex];
          const correctAnswerIndex = question.options.findIndex(option => option === question.correctAnswer);
          const isCorrect = userAnswerIndex === correctAnswerIndex;

          return (
            <View key={questionIndex} style={styles.reviewQuestionCard}>
              <View style={styles.reviewQuestionHeader}>
                <Text style={styles.reviewQuestionNumber}>Question {questionIndex + 1}/{examConfig.questions.length}</Text>
              </View>

              <Text style={styles.reviewQuestionText}>{question.question}</Text>

              <View style={styles.reviewOptionsContainer}>
                {question.options.map((option, optionIndex) => {
                  const isUserAnswer = userAnswerIndex === optionIndex;
                  const isCorrectAnswer = correctAnswerIndex === optionIndex;

                  let optionStyle = styles.reviewOptionItem;
                  let indicatorStyle = styles.reviewOptionIndicator;
                  let letterStyle = styles.reviewOptionLetter;

                  if (isCorrectAnswer) {
                    optionStyle = [styles.reviewOptionItem, styles.reviewOptionCorrect];
                    indicatorStyle = [styles.reviewOptionIndicator, styles.reviewOptionIndicatorCorrect];
                    letterStyle = [styles.reviewOptionLetter, styles.reviewOptionLetterCorrect];
                  } else if (isUserAnswer && !isCorrect) {
                    optionStyle = [styles.reviewOptionItem, styles.reviewOptionIncorrect];
                    indicatorStyle = [styles.reviewOptionIndicator, styles.reviewOptionIndicatorIncorrect];
                    letterStyle = [styles.reviewOptionLetter, styles.reviewOptionLetterIncorrect];
                  }

                  return (
                    <View key={optionIndex} style={optionStyle}>
                      <View style={indicatorStyle}>
                        <Text style={letterStyle}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Text>
                        {isCorrectAnswer && (
                          <View style={styles.checkMarkContainer}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </View>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <View style={styles.crossMarkContainer}>
                            <Ionicons name="close" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.reviewOptionText}>{option}</Text>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.reviewSeeExplanationButton}
                onPress={() => getSolution(question)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#4A90E2" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="star-shooting-outline" size={16} color="#4A90E2" />
                    <Text style={styles.reviewSeeExplanationText}>See Explanation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>
        {currentView === 'exam' && renderExamView()}
        {currentView === 'results' && renderResultsView()}
        {currentView === 'review' && renderReviewView()}

        {/* Submit Confirmation Modal */}
        <Modal visible={showSubmitConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Are you sure you want to submit?</Text>
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

        {/* Time's Up Modal */}
        <Modal visible={timeRemaining === 0 && !examCompleted} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.timeUpModal}>
              <Text style={styles.timeUpTitle}>Time's Up!!</Text>
              <Text style={styles.timeUpMessage}>
                Oops, you have run out of time and your progress has been submitted. Click the button below to view your result!
              </Text>
              <TouchableOpacity
                style={styles.viewResultButton}
                onPress={handleSubmitExam}
              >
                <Text style={styles.viewResultButtonText}>View Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Solution Modal */}
        <Modal visible={showSolution} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons name="lightbulb" size={24} color="#4A90E2" />
                <Text style={styles.modalTitle}>Solution</Text>
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

            <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={styles.solutionText}>{solution}</Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
// Main App Component
export default function ExamWiseScreen() {
  const [currentScreen, setCurrentScreen] = useState<'form' | 'timer' | 'session'>('form');
  const [examConfig, setExamConfig] = useState<any>(null);

  const handleFormBeginExam = (config: any) => {
    setExamConfig(config);
    setCurrentScreen('timer');
  };

  const handleTimerBegin = () => {
    setCurrentScreen('session');
  };

  const handleRetakeExam = () => {
    setExamConfig(null);
    setCurrentScreen('form');
  };

  // Render appropriate exam session screen based on exam type
  const renderExamSession = () => {
    if (examConfig.examType === 'JAMB') {
      return (
        <JambExamSessionScreen
          examConfig={examConfig}
          onRetakeExam={handleRetakeExam}
        />
      );
    } else {
      return (
        <IgcseWaecExamSessionScreen
          examConfig={examConfig}
          onRetakeExam={handleRetakeExam}
        />
      );
    }
  };

  return (
    <>
      {currentScreen === 'form' && (
        <ExamFormScreen onBeginExam={handleFormBeginExam} />
      )}
      {currentScreen === 'timer' && examConfig && (
        <ExamTimerComponent
          timeDisplay={formatTimerDisplay(examConfig.timerDuration)}
          subject={examConfig.subject}
          examType={examConfig.examType}
          year={examConfig.year}
          difficulty={examConfig.difficulty}
          onBegin={handleTimerBegin}
          duration={examConfig.timerDuration}
          onDurationChange={(minutes) => setExamConfig({
            ...examConfig,
            timerDuration: minutes * 60
          })}
        />
      )}
      {currentScreen === 'session' && examConfig && renderExamSession()}
    </>
  );
}

function formatTimerDisplay(seconds: number) {
  if (isNaN(seconds) || seconds === null) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5580D4',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 16,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 8,
  },
  testText: {
    color: '#4A90E2',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#5580D4',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  selectText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  placeholderText: {
    color: '#999999',
  },
  textInput: {
    backgroundColor: '#F5F7FA',

    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#000000',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000000',
  },
  generateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Exam Session Styles
  examHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  examHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  examInfo: {
    flex: 1,
  },
  examSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  examDetails: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  questionNumber: {
    fontSize: 12,
    color: '#666666',
  },
  examHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  timerSelectionContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 12,
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timerOptionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timerOptionText: {
    fontSize: 14,
    color: '#4A5568',
  },
  timerOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 30,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  examContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  optionItemSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#4A90E2',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndicatorSelected: {
    backgroundColor: '#4A90E2',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  optionLetterSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  seeExplanationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  seeExplanationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
    marginLeft: 6,
  },
  questionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  gridItem: {
    width: (width - 60) / 10,
    height: (width - 60) / 10,
    backgroundColor: '#D9D9D9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5580D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridItemAnswered: {
    backgroundColor: '#4A90E2',
  },
  gridItemCurrent: {
    backgroundColor: '#fff',
    borderColor: '#FECB51',
    borderWidth: 1,
  },
  gridItemCorrect: {
    backgroundColor: '#10B981',
  },
  gridItemIncorrect: {
    backgroundColor: '#EF4444',
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  gridItemTextActive: {
    color: '#000',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 4,
  },
  backButton: {
    backgroundColor: '#fff',
    color: '#000',
    borderColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 4,

    borderWidth: 1,
  },
  nextButton: {
    backgroundColor: '#4A90E2',
  },
  navButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  // Results Screen Styles
  resultsSubject: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  scoreDisplay: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completionIcon: {
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  completionMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  viewResultButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewResultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  viewResultButtonIcon: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeExamButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  retakeExamButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Review Screen Styles
  reviewHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewSubject: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  reviewScore: {
    fontSize: 16,
    color: '#666666',
  },
  scoreNumber: {
    color: '#10B981',
    fontWeight: '600',
  },
  totalNumber: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  reviewContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reviewQuestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewQuestionHeader: {
    marginBottom: 12,
  },
  reviewQuestionNumber: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  reviewQuestionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  reviewOptionsContainer: {
    marginBottom: 16,
  },
  reviewOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  reviewOptionCorrect: {
    backgroundColor: '#D4F7DC',
    borderColor: '#10B981',
  },
  reviewOptionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  reviewOptionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  reviewOptionIndicatorCorrect: {
    backgroundColor: '#10B981',
  },
  reviewOptionIndicatorIncorrect: {
    backgroundColor: '#EF4444',
  },
  reviewOptionLetter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  reviewOptionLetterCorrect: {
    color: '#FFFFFF',
  },
  reviewOptionLetterIncorrect: {
    color: '#FFFFFF',
  },
  reviewOptionText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  checkMarkContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossMarkContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewSeeExplanationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CBE3FF',
    borderRadius: 30,
    width: 200,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  reviewSeeExplanationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginLeft: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    width: '100%',
  },
  goBackButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  goBackButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmSubmitButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeUpModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  timeUpTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
  },
  timeUpMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioButton: {
    padding: 8,
    marginRight: 8,
  },
  closeModalButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  solutionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    backgroundColor: '#e6ffe6',  // Light green background
    padding: 10,
    borderRadius: 8,
  },
  theoryContainer: {
     marginBottom: 20,
   },
   diagramImage: {
     width: '100%',
     height: 200,
     borderRadius: 8,
     marginBottom: 16,
     resizeMode: 'contain'
   },
   theoryAnswerLabel: {
     fontSize: 14,
     fontWeight: '500',
     color: '#000000',
     marginBottom: 8,
   },
   theoryAnswerInput: {
     backgroundColor: '#F8F9FA',
     borderWidth: 1,
     borderColor: '#E0E0E0',
     borderRadius: 8,
     padding: 16,
     minHeight: 120,
     marginBottom: 16,
     textAlignVertical: 'top',
   },
   analyzeButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: '#10B981',
     borderRadius: 8,
     paddingVertical: 12,
     paddingHorizontal: 16,
   },
   analyzeButtonText: {
     fontSize: 14,
     fontWeight: '500',
     color: '#FFFFFF',
     marginLeft: 6,
   },
   theoryReviewContainer: {
     backgroundColor: '#F8F9FA',
     borderRadius: 8,
     padding: 16,
     marginBottom: 16,
   },
   theoryAnswerReview: {
     fontSize: 14,
     color: '#000000',
     lineHeight: 20,
   },
   gridItemTheory: {
     borderColor: '#FF6B35',
   },
   theoryIndicator: {
     fontSize: 8,
     color: '#FF6B35',
     position: 'absolute',
     top: 2,
     right: 2,
   },
   backButtonText: {
     color: '#000000',
     fontSize: 14,
     fontWeight: '600',
     marginLeft: 4,
   },
   exitButton: {
     flexDirection: 'row',
     backgroundColor: '#0961F5',
     alignItems: 'center',
     padding: 10,
     borderRadius: 30,
     paddingHorizontal: 20
   },
   exitButtonText: {
     color: '#fff',
     fontSize: 14,
     fontWeight: '600',
   },
});
