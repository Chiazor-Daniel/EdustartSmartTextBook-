import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sample exam data
const examData = {
  topic: "Classification Of Living Organism",
  assignedBy: "Your teacher",
  questions: [
    {
      id: '1',
      text: 'Which of the following chambers of the heart receives oxygenated blood from the lungs?',
      image: 'https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=300',
      points: 20,
      options: [
        { id: 'A', text: 'Right atrium' },
        { id: 'B', text: 'Right ventricle' },
        { id: 'C', text: 'Left atrium', correct: true },
        { id: 'D', text: 'Left ventricle' },
      ],
    },
    {
      id: '2',
      text: 'Which of the following is NOT a characteristic of living organisms?',
      points: 20,
      options: [
        { id: 'A', text: 'Respiration' },
        { id: 'B', text: 'Growth' },
        { id: 'C', text: 'Crystallization', correct: true },
        { id: 'D', text: 'Reproduction' },
      ],
    },
    {
      id: '3',
      text: 'Which kingdom do bacteria belong to?',
      points: 20,
      options: [
        { id: 'A', text: 'Protista' },
        { id: 'B', text: 'Monera', correct: true },
        { id: 'C', text: 'Fungi' },
        { id: 'D', text: 'Plantae' },
      ],
    },
    {
      id: '4',
      text: 'Which of the following is a correct taxonomic hierarchy from largest to smallest?',
      points: 20,
      options: [
        { id: 'A', text: 'Kingdom → Phylum → Class → Order → Family → Genus → Species', correct: true },
        { id: 'B', text: 'Kingdom → Class → Phylum → Order → Family → Genus → Species' },
        { id: 'C', text: 'Phylum → Kingdom → Class → Order → Family → Genus → Species' },
        { id: 'D', text: 'Kingdom → Phylum → Order → Class → Family → Genus → Species' },
      ],
    },
    {
      id: '5',
      text: 'Which of the following is NOT a vertebrate?',
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=300',
      points: 20,
      options: [
        { id: 'A', text: 'Fish' },
        { id: 'B', text: 'Jellyfish', correct: true },
        { id: 'C', text: 'Bird' },
        { id: 'D', text: 'Reptile' },
      ],
    },
  ],
  instructions: [
    "Read each question carefully. Make sure you understand the question before selecting an answer.",
    "Use the navigation buttons. Use the \"Next\" and \"Previous\" buttons to move through the test.",
    "Do not refresh the page. Avoid refreshing the page, as this may cause you to lose your progress."
  ]
};

// Exam screen states
const EXAM_STATES = {
  NOTIFICATION: 'notification',
  INSTRUCTIONS: 'instructions',
  QUESTIONS: 'questions',
  RESULTS: 'results',
};

const ExamScreen = ({ navigation }: { navigation: any }) => {
  const [examState, setExamState] = useState(EXAM_STATES.NOTIFICATION);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const animateNextQuestion = (nextIndex: number) => {
    // Slide out current question
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      setCurrentQuestionIndex(nextIndex);
      slideAnim.setValue(width);
      
      // Slide in next question
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    });
  };
  
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      animateNextQuestion(currentQuestionIndex + 1);
    } else {
      // Show results or submit exam
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setExamState(EXAM_STATES.RESULTS);
      }, 1500);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      animateNextQuestion(currentQuestionIndex - 1);
    }
  };
  
  const calculateScore = () => {
    let score = 0;
    let totalPoints = 0;
    
    examData.questions.forEach(question => {
      totalPoints += question.points;
      const selectedOption = question.options.find(
        option => option.id === selectedAnswers[question.id]
      );
      
      if (selectedOption && selectedOption.correct) {
        score += question.points;
      }
    });
    
    return {
      score,
      totalPoints,
      percentage: Math.round((score / totalPoints) * 100),
    };
  };
  
  // Render notification screen
  const renderNotificationScreen = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <View style={styles.notificationContent}>
        <Text style={styles.topicTitle}>{examData.topic}</Text>
        <Text style={styles.notificationText}>New Assessment</Text>
        <Text style={styles.notificationSubtext}>
          {examData.assignedBy} has assigned a new assessment for you
        </Text>
        
        <TouchableOpacity 
          style={styles.blueButton}
          onPress={() => setExamState(EXAM_STATES.INSTRUCTIONS)}
        >
          <Text style={styles.buttonText}>Review Instructions</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  
  // Render instructions screen
  const renderInstructionsScreen = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <View style={styles.instructionsContent}>
        <Text style={styles.instructionsTitle}>{examData.topic}</Text>
        
        <Text style={styles.instructionsHeading}>Before You Begin</Text>
        
        {examData.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
        
        <View style={styles.readySection}>
          <Text style={styles.readyTitle}>Ready to Begin?</Text>
          <Text style={styles.readyText}>
            Click the "Start Test" button to begin. Good luck!
          </Text>
        </View>
      </View>
      
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.blueButton}
          onPress={() => setExamState(EXAM_STATES.QUESTIONS)}
        >
          <Text style={styles.buttonText}>Start Test</Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  
  // Animation for question transitions
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    // Reset animation when direction changes
    slideAnimation.setValue(direction === 'next' ? width : -width);
    
    // Animate to center
    Animated.spring(slideAnimation, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

 
  // Progress indicator
  const progressPercentage = ((currentQuestionIndex + 1) / examData.questions.length) * 100;

  // Render question screen
  const renderQuestionScreen = () => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    
    return (
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setExamState(EXAM_STATES.INSTRUCTIONS)}>
            <Ionicons name="chevron-back" size={20} color="#666" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Exam</Text>
          <View style={{ width: 50 }} />
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
        
        <View style={styles.cardsContainer}>
          <Animated.View
            style={[
              styles.cardAnimated,
              {
                transform: [{ translateX: slideAnimation }]
              }
            ]}
          >
            <View style={styles.card}>
              {currentQuestion.image && (
                <Image 
                  source={{ uri: currentQuestion.image }} 
                  style={styles.questionImage}
                  resizeMode="contain"
                />
              )}
              
              {currentQuestion.image && (
                <Text style={styles.imageCaption}>{examData.topic}</Text>
              )}
              
              <Text style={styles.questionText}>
                {currentQuestion.text}
              </Text>
              
              <View style={styles.answersContainer}>
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity 
                    key={option.id}
                    style={[
                      styles.answerButton,
                      selectedAnswers[currentQuestion.id] === option.id && styles.selectedAnswer
                    ]}
                    onPress={() => handleSelectAnswer(currentQuestion.id, option.id)}
                  >
                    <Text style={styles.answerText}>
                      {option.id}. {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <TouchableOpacity 
              style={[styles.previousButton, currentQuestionIndex === 0 && styles.disabledButton]} 
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={[styles.previousButtonText, currentQuestionIndex === 0 && styles.disabledText]}>Previous</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.pageIndicator}>
            {currentQuestionIndex + 1}/{examData.questions.length}
          </Text>
          
          <View style={styles.footerRight}>
            {currentQuestionIndex < examData.questions.length - 1 ? (
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNextQuestion}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitExam}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.progressIndicator}>
            {examData.questions.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  index === currentQuestionIndex ? styles.activeDot : null,
                  selectedAnswers[examData.questions[index].id] ? styles.answeredDot : null
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.blueButton}
            onPress={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            <Text style={styles.buttonText}>
              {currentQuestionIndex === examData.questions.length - 1 ? 'Submit' : 'Next'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render results screen
  const renderResultsScreen = () => {
    const { score, totalPoints, percentage } = calculateScore();
    
    return (
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.resultsContent}>
          <Text style={styles.topicTitle}>{examData.topic}</Text>
          
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
            </View>
            <Text style={styles.scoreText}>
              You scored {score} out of {totalPoints} points
            </Text>
          </View>
          
          <View style={styles.resultsSummary}>
            <Text style={styles.summaryTitle}>Question Summary</Text>
            
            {examData.questions.map((question, index) => {
              const selectedOption = question.options.find(
                option => option.id === selectedAnswers[question.id]
              );
              const correctOption = question.options.find(option => option.correct);
              const isCorrect = selectedOption && selectedOption.correct;
              
              return (
                <View key={question.id} style={styles.questionSummaryItem}>
                  <View style={styles.questionNumberContainer}>
                    <Text style={styles.questionNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.questionSummaryContent}>
                    <Text style={styles.questionSummaryText} numberOfLines={1}>
                      {question.text}
                    </Text>
                    <View style={styles.answerRow}>
                      <Text style={styles.yourAnswerLabel}>Your answer: </Text>
                      <Text style={[
                        styles.answerText,
                        isCorrect ? styles.correctAnswer : styles.wrongAnswer
                      ]}>
                        {selectedOption ? `${selectedOption.id}. ${selectedOption.text}` : 'Not answered'}
                      </Text>
                    </View>
                    {!isCorrect && (
                      <View style={styles.answerRow}>
                        <Text style={styles.correctAnswerLabel}>Correct answer: </Text>
                        <Text style={styles.correctAnswer}>
                          {correctOption ? `${correctOption.id}. ${correctOption.text}` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.resultIconContainer}>
                    {isCorrect ? (
                      <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                    ) : (
                      <MaterialIcons name="cancel" size={24} color="#EF4444" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          
          <TouchableOpacity 
            style={styles.blueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  // Render loading screen
  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIndicator}>
        <Text style={styles.loadingText}>Submitting your answers...</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {isSubmitting ? (
        renderLoadingScreen()
      ) : (
        <>
          {examState === EXAM_STATES.NOTIFICATION && renderNotificationScreen()}
          {examState === EXAM_STATES.INSTRUCTIONS && renderInstructionsScreen()}
          {examState === EXAM_STATES.QUESTIONS && renderQuestionScreen()}
          {examState === EXAM_STATES.RESULTS && renderResultsScreen()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  cardsContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cardAnimated: {
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageCaption: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 24,
  },
  answersContainer: {
    marginTop: 16,
  },
  answerButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedAnswer: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  answerText: {
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  footerLeft: {
    width: 100,
  },
  footerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  previousButton: {
    padding: 8,
  },
  previousButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  notificationContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 24,
    textAlign: 'center',
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  notificationSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  blueButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 4,
  },
  instructionsContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionsHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
    width: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  readySection: {
    marginTop: 24,
    alignItems: 'center',
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  readyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomButtonContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  questionContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 24,
  },
  questionHeader: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 12,
    width: 16,
  },
  optionText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  answeredDot: {
    backgroundColor: '#3B82F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  resultsContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreText: {
    fontSize: 16,
    color: '#1E293B',
  },
  resultsSummary: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  questionSummaryItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 16,
  },
  questionNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  questionSummaryContent: {
    flex: 1,
  },
  questionSummaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  yourAnswerLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  correctAnswerLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  answerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  correctAnswer: {
    color: '#22C55E',
  },
  wrongAnswer: {
    color: '#EF4444',
  },
  resultIconContainer: {
    marginLeft: 12,
    justifyContent: 'flex-start',
  },
});

export default ExamScreen;