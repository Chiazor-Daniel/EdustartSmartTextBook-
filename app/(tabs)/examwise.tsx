import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ExamWiseScreen() {
  const [audioLoading, setAudioLoading] = useState(false);
  const audioSoundRef = React.useRef<Audio.Sound | null>(null);

  const playAudioExplanation = async (explanationText: string) => {
    try {
      const response = await fetch('https://class-fi.vercel.app/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explanation: explanationText }),
      });

      const audioData = await response.json();

      if (audioData.audioDataUri) {
        console.log('Loading sound...');
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioData.audioDataUri }
        );
        audioSoundRef.current = sound;

        console.log('Playing sound...');
        await sound.playAsync();
      } else {
        console.error('API did not return audio data.');
        alert('Audio unavailable.');
      }
    } catch (error) {
      console.error('Failed to generate or play audio:', error);
      alert('Failed to generate or play audio.');
    }
  }

  // State management
  const [availableSubjects, setAvailableSubjects] = useState(['Physics', 'Chemistry', 'Biology', 'Mathematics']);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [examTypes] = useState(['JAMB', 'WAEC', 'NECO', 'POST-UTME']);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedExam, setGeneratedExam] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [examYear, setExamYear] = useState('2025');
  const [difficulty, setDifficulty] = useState('Medium');
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showExamTypeDropdown, setShowExamTypeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examResults, setExamResults] = useState(null);

  const BASE_URL = 'https://class-fi.vercel.app';
  const difficultyOptions = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0) {
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
    } else if (timeRemaining === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  };

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

  const generateExam = async () => {
    if (!selectedSubject || !selectedExamType) {
      Alert.alert('Error', 'Please select both subject and exam type');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          examType: selectedExamType,
          year: parseInt(examYear),
          difficulty: difficulty,
        }),
      });
      
      if (response.ok) {
        const examData = await response.json();
        setGeneratedExam(examData.questions || []);
      } else {
        // Mock exam data for demo
        setGeneratedExam([
          {
            question: "Which structure is NOT found in animal cells?",
            options: ["Cell wall", "Cell membrane", "Cytoplasm", "Nucleus"],
            correctAnswer: "Cell wall"
          },
          {
            question: "Organisms that can interbreed and produce fertile offspring belong to the same:",
            options: ["Genus", "Family", "Species", "Class"],
            correctAnswer: "Species"
          },
          {
            question: "Which plant tissue transports water from the roots to the leaves?",
            options: ["Phloem", "Xylem", "Cambium", "Epidermis"],
            correctAnswer: "Xylem"
          }
        ]);
      }
      
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setSelectedAnswer(null);
      setActiveTab('timer');
      setExamStarted(true);
      setTimeRemaining(1200); // Reset timer to 20 minutes
    } catch (error) {
      console.error('Failed to generate exam:', error);
      Alert.alert('Error', 'Failed to generate exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const navigateToQuestion = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
    setSelectedAnswer(userAnswers[questionIndex] || null);
  };

  const handleSubmitExam = () => {
    setTimerActive(false);
    setExamCompleted(true);
    
    // Calculate results
    let correctAnswers = 0;
    generatedExam.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer !== undefined && question.options[userAnswer] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / generatedExam.length) * 100);
    setExamResults({
      score,
      correctAnswers,
      totalQuestions: generatedExam.length,
      timeUsed: 1200 - timeRemaining
    });
    
    setActiveTab('results');
    setShowSubmitConfirm(false);
  };

  const getSolution = async (question) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/solve-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
        }),
      });
      
      if (response.ok) {
        const solutionData = await response.json();
        setSolution(solutionData.explanation);
      } else {
        setSolution(`The correct answer is "${question.correctAnswer}". This is a fundamental concept that requires understanding of basic principles.`);
      }
      setShowSolution(true);
    } catch (error) {
      console.error('Failed to get solution:', error);
      setSolution(`The correct answer is "${question.correctAnswer}". This is a fundamental concept that requires understanding of basic principles.`);
      setShowSolution(true);
    } finally {
      setLoading(false);
    }
  };

  const resetExam = () => {
    setActiveTab('setup');
    setExamStarted(false);
    setExamCompleted(false);
    setGeneratedExam([]);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTimerActive(false);
    setTimeRemaining(1200);
    setExamResults(null);
  };

  const getAnswerStatus = (questionIndex) => {
    if (userAnswers[questionIndex] !== undefined) {
      if (examCompleted) {
        const isCorrect = generatedExam[questionIndex].options[userAnswers[questionIndex]] === generatedExam[questionIndex].correctAnswer;
        return isCorrect ? 'correct' : 'incorrect';
      }
      return 'answered';
    }
    return 'unanswered';
  };

  const renderSetupTab = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Take an Exam</Text>
        </View>
        
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Ready to <Text style={styles.testText}>test</Text> your knowledge?</Text>
          <Text style={styles.welcomeSubtitle}>Fill the form below to generate questions.</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="clipboard-list" size={20} color="#4A90E2" />
            <Text style={styles.cardTitle}>Generate Mock Exam</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Exam Type *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowExamTypeDropdown(!showExamTypeDropdown)}
            >
              <Text style={[styles.selectText, !selectedExamType && styles.placeholderText]}>
                {selectedExamType || 'Select exam type (e.g jamb, waec etc)'}
              </Text>
              <Ionicons 
                name={showExamTypeDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {showExamTypeDropdown && (
              <View style={styles.dropdown}>
                {examTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedExamType(type);
                      setShowExamTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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
            <TextInput
              style={styles.textInput}
              value={examYear}
              onChangeText={setExamYear}
              keyboardType="numeric"
              placeholder="Select the year"
              placeholderTextColor="#999"
            />
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
            onPress={generateExam}
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
  );

  const renderTimerTab = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Set Timer</Text>
        </View>
      </View>

      <View style={styles.timerContent}>
        <View style={styles.timerSection}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
          
          <Text style={styles.subjectTitle}>{selectedSubject}</Text>
          <Text style={styles.examTypeTitle}>{selectedExamType} Exam</Text>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Before You Begin</Text>
          <Text style={styles.instructionsText}>
            {`- Make sure you have a stable internet connection.\n- Understand that questions before selecting an answer.\n- Check through your answers before time runs out.\n- Click the "submit" to submit exam once you are done.\n- It will auto submit if the time runs out.`}
          </Text>
          <Text style={styles.readyTitle}>Ready to Begin?</Text>
          <Text style={styles.readySubtitle}>Click the button to begin. Good luck!</Text>
        </View>

        <TouchableOpacity 
          style={styles.beginButton}
          onPress={() => {
            setActiveTab('exam');
            setTimerActive(true);
          }}
        >
          <Text style={styles.beginButtonText}>Begin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExamTab = () => (
    <View style={styles.container}>
      <View style={styles.examHeader}>
        <View style={styles.examHeaderContent}>
          <View style={styles.examInfo}>
            <Text style={styles.examSubject}>{selectedSubject}</Text>
            <Text style={styles.examDetails}>{selectedExamType} • {examYear} Exam</Text>
            <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}/{generatedExam.length}</Text>
          </View>
          <View style={styles.examHeaderRight}>
            <View style={styles.timerBadge}>
              <Text style={styles.timerBadgeText}>{formatTime(timeRemaining)}</Text>
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

      <ScrollView style={styles.examContent} showsVerticalScrollIndicator={false}>
        {generatedExam.length > 0 && (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {generatedExam[currentQuestionIndex]?.question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {generatedExam[currentQuestionIndex]?.options?.map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.optionItem,
                    selectedAnswer === index && styles.optionItemSelected,
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                >
                  <View style={[
                    styles.optionIndicator,
                    selectedAnswer === index && styles.optionIndicatorSelected,
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      selectedAnswer === index && styles.optionLetterSelected,
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.seeExplanationButton}
              onPress={() => getSolution(generatedExam[currentQuestionIndex])}
            >
              <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#4A90E2" />
              <Text style={styles.seeExplanationText}>See Explanation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Question Grid Navigator */}
        <View style={styles.questionGrid}>
          {generatedExam.map((_, index) => {
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
            style={[styles.navButton, styles.backButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={() => {
              if (currentQuestionIndex > 0) {
                navigateToQuestion(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons name="chevron-back" size={16} color="white" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, currentQuestionIndex === generatedExam.length - 1 && styles.navButtonDisabled]}
            onPress={() => {
              if (currentQuestionIndex < generatedExam.length - 1) {
                navigateToQuestion(currentQuestionIndex + 1);
              }
            }}
            disabled={currentQuestionIndex === generatedExam.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderResultsTab = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Exam Results</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsSubject}>{selectedSubject} • {selectedExamType} Exam</Text>
        
        {examResults && (
          <>
            <Text style={styles.scoreDisplay}>
              You scored {examResults.correctAnswers} out of {examResults.totalQuestions}
            </Text>
            
            <View style={styles.completionCard}>
              <View style={styles.completionIcon}>
                <MaterialCommunityIcons name="trophy" size={60} color="#FFD700" />
              </View>
              <Text style={styles.completionTitle}>Exam Completed</Text>
              <Text style={styles.completionMessage}>
                Well done! You have successfully completed your exam. You may now review your answers below.
              </Text>
              <TouchableOpacity 
                style={styles.viewResultButton}
                onPress={() => setActiveTab('review')}
              >
                <Text style={styles.viewResultButtonText}>View Result</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
        
        <TouchableOpacity style={styles.retakeExamButton} onPress={resetExam}>
          <Text style={styles.retakeExamButtonText}>Take Another Exam</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderReviewTab = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Exam Results</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="moon-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="person-circle-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reviewHeader}>
        <Text style={styles.reviewSubject}>{selectedExamType} • {examYear} • Expert</Text>
        <Text style={styles.reviewScore}>
          You scored <Text style={styles.scoreNumber}>{examResults?.correctAnswers || 0}</Text> out of <Text style={styles.totalNumber}>{examResults?.totalQuestions || 0}</Text>
        </Text>
      </View>

      <ScrollView style={styles.reviewContent} showsVerticalScrollIndicator={false}>
        {generatedExam.map((question, questionIndex) => {
          const userAnswerIndex = userAnswers[questionIndex];
          const correctAnswerIndex = question.options.findIndex(option => option === question.correctAnswer);
          const isCorrect = userAnswerIndex === correctAnswerIndex;

          return (
            <View key={questionIndex} style={styles.reviewQuestionCard}>
              <View style={styles.reviewQuestionHeader}>
                <Text style={styles.reviewQuestionNumber}>Question {questionIndex + 1}/40</Text>
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
              >
                <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#4A90E2" />
                <Text style={styles.reviewSeeExplanationText}>See Explanation</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Conditional rendering based on state */}
      {!examStarted && renderSetupTab()}
      {examStarted && !examCompleted && activeTab === 'timer' && renderTimerTab()}
      {examStarted && !examCompleted && activeTab === 'exam' && renderExamTab()}
      {examCompleted && activeTab === 'results' && renderResultsTab()}
      {examCompleted && activeTab === 'review' && renderReviewTab()}

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
                  if (audioSoundRef.current) {
                    try {
                      await audioSoundRef.current.stopAsync();
                      await audioSoundRef.current.unloadAsync();
                    } catch {}
                    audioSoundRef.current = null;
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    color: '#000000',
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
    paddingVertical: 24,
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    borderRadius: 8,
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
  // Timer Screen Styles
  timerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFB800',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  examTypeTitle: {
    fontSize: 14,
    color: '#666666',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  readySubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  beginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  beginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Exam Screen Styles
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
  timerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    width: (width - 80) / 10,
    height: (width - 80) / 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridItemAnswered: {
    backgroundColor: '#4A90E2',
  },
  gridItemCurrent: {
    backgroundColor: '#FFB800',
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
    color: '#FFFFFF',
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
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  backButton: {
    backgroundColor: '#6C757D',
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
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewResultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reviewSeeExplanationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
    marginLeft: 6,
  },
});