import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ExamWiseScreen = () => {
  // State management
  const [availableSubjects, setAvailableSubjects] = useState(['Physics', 'Chemistry', 'Biology', 'Mathematics']);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedExam, setGeneratedExam] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [examYear, setExamYear] = useState('2025');
  const [difficulty, setDifficulty] = useState('Medium');
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('subjects');
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const BASE_URL = 'https://class-fi.vercel.app';
  const difficultyOptions = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchSubjects();
  }, []);

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
      // Keep default subjects if API fails
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (subject) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/subjects/${subject}`);
      if (response.ok) {
        const analysis = await response.json();
        setAnalysisResult(analysis);
        setActiveTab('analysis');
      } else {
        // Mock data for demo
        setAnalysisResult({
          frequentTopics: ['Mechanics', 'Thermodynamics', 'Optics'],
          questionPatterns: ['Multiple Choice', 'Numerical Problems', 'Theory Questions'],
          difficultyDistribution: { easy: 30, medium: 50, hard: 20 }
        });
        setActiveTab('analysis');
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      Alert.alert('Error', 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateExam = async () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
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
            question: "What is the speed of light in vacuum?",
            options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
            correctAnswer: "3 × 10⁸ m/s"
          },
          {
            question: "Which law describes the relationship between force and acceleration?",
            options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
            correctAnswer: "Newton's Second Law"
          }
        ]);
      }
      
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setActiveTab('exam');
    } catch (error) {
      console.error('Failed to generate exam:', error);
      Alert.alert('Error', 'Failed to generate exam');
    } finally {
      setLoading(false);
    }
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
        setSolution(`The correct answer is "${question.correctAnswer}". This is a fundamental concept in physics that requires understanding of basic principles.`);
      }
      setShowSolution(true);
    } catch (error) {
      console.error('Failed to get solution:', error);
      setSolution(`The correct answer is "${question.correctAnswer}". This is a fundamental concept in physics that requires understanding of basic principles.`);
      setShowSolution(true);
    } finally {
      setLoading(false);
    }
  };

  const getAudio = async (text) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explanation: text }),
      });
      Alert.alert('🎵 Audio Ready', 'Audio explanation generated successfully!');
    } catch (error) {
      console.error('Failed to generate audio:', error);
      Alert.alert('Error', 'Failed to generate audio');
    } finally {
      setLoading(false);
    }
  };

  const selectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setShowDifficultyDropdown(false);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'Physics': return 'atom';
      case 'Chemistry': return 'flask';
      case 'Biology': return 'leaf';
      case 'Mathematics': return 'calculator';
      default: return 'book';
    }
  };

  const renderSubjectsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
      }
    >
      <Text style={styles.pageTitle}>📚 Choose Your Subject</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      ) : (
        <View style={styles.subjectsGrid}>
          {availableSubjects.map((subject, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subjectCard,
                selectedSubject === subject && styles.selectedSubjectCard,
              ]}
              onPress={() => setSelectedSubject(subject)}
              activeOpacity={0.7}
            >
              <View style={styles.subjectIcon}>
                <Ionicons name={getSubjectIcon(subject)} size={32} color="#2196F3" />
              </View>
              <Text style={styles.subjectTitle}>{subject}</Text>
              <TouchableOpacity
                style={styles.analysisButton}
                onPress={() => fetchAnalysis(subject)}
              >
                <MaterialCommunityIcons name="chart-line" size={16} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderAnalysisTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.pageTitle}>📊 Subject Analysis</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Analyzing data...</Text>
        </View>
      ) : analysisResult ? (
        <View>
          {/* Frequent Topics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Frequent Topics</Text>
            <View style={styles.topicsContainer}>
              {analysisResult.frequentTopics?.map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Question Patterns */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Question Patterns</Text>
            {analysisResult.questionPatterns?.map((pattern, index) => (
              <View key={index} style={styles.patternItem}>
                <View style={styles.bullet} />
                <Text style={styles.patternText}>{pattern}</Text>
              </View>
            ))}
          </View>

          {/* Difficulty Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Difficulty Distribution</Text>
            {['easy', 'medium', 'hard'].map((level, index) => {
              const percentage = analysisResult.difficultyDistribution?.[level] || 0;
              return (
                <View key={index} style={styles.difficultyRow}>
                  <Text style={styles.difficultyLabel}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBar,
                        { 
                          width: `${percentage}%`,
                          backgroundColor: getDifficultyColor(level.charAt(0).toUpperCase() + level.slice(1))
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.percentage}>{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="chart-line" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Analysis Available</Text>
          <Text style={styles.emptyText}>Select a subject to view detailed analysis</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderExamTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.pageTitle}>🎯 Mock Exam</Text>
      
      {/* Exam Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exam Settings</Text>
        
        <View style={styles.configRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📅 Year</Text>
            <TextInput
              style={styles.input}
              value={examYear}
              onChangeText={setExamYear}
              keyboardType="numeric"
              placeholder="2025"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>⚡ Difficulty</Text>
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: getDifficultyColor(difficulty) }]}
              onPress={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
            >
              <Text style={[styles.dropdownText, { color: getDifficultyColor(difficulty) }]}>
                {difficulty}
              </Text>
              <Ionicons 
                name={showDifficultyDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {showDifficultyDropdown && (
              <View style={styles.dropdownList}>
                {difficultyOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownOption,
                      option === difficulty && styles.selectedOption,
                    ]}
                    onPress={() => selectDifficulty(option)}
                  >
                    <Text style={[styles.optionText, { color: getDifficultyColor(option) }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.generateButton} onPress={generateExam}>
          <MaterialCommunityIcons name="rocket-launch" size={20} color="white" />
          <Text style={styles.buttonText}>Generate Exam</Text>
        </TouchableOpacity>
      </View>

      {/* Questions Display */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Generating questions...</Text>
        </View>
      ) : generatedExam.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.questionCounter}>
            Question {currentQuestionIndex + 1} of {generatedExam.length}
          </Text>
          
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {generatedExam[currentQuestionIndex]?.question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {generatedExam[currentQuestionIndex]?.options?.map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOptionButton,
                  ]}
                  onPress={() => setSelectedAnswer(index)}
                >
                  <View style={[
                    styles.optionCircle,
                    selectedAnswer === index && styles.selectedCircle,
                  ]}>
                    <Text style={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.solutionButton}
                onPress={() => getSolution(generatedExam[currentQuestionIndex])}
              >
                <MaterialCommunityIcons name="lightbulb" size={20} color="white" />
                <Text style={styles.buttonText}>Show Solution</Text>
              </TouchableOpacity>
              
              <View style={styles.navButtons}>
                <TouchableOpacity
                  style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
                  onPress={() => {
                    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                    setSelectedAnswer(null);
                  }}
                  disabled={currentQuestionIndex === 0}
                >
                  <Ionicons name="chevron-back" size={16} color="white" />
                  <Text style={styles.navText}>Previous</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.navButton, currentQuestionIndex === generatedExam.length - 1 && styles.disabledButton]}
                  onPress={() => {
                    setCurrentQuestionIndex(Math.min(generatedExam.length - 1, currentQuestionIndex + 1));
                    setSelectedAnswer(null);
                  }}
                  disabled={currentQuestionIndex === generatedExam.length - 1}
                >
                  <Text style={styles.navText}>Next</Text>
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="file-document-edit" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Ready to Start?</Text>
          <Text style={styles.emptyText}>Configure your exam settings and generate questions</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeContainer}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="" /> */}
      
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'subjects', icon: 'library', label: 'Subjects' },
        //   { key: 'analysis', icon: 'analytics', label: 'Analysis' },
          { key: 'exam', icon: 'document-text', label: 'Exam' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.key ? '#2196F3' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'subjects' && renderSubjectsTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'exam' && renderExamTab()}

      {/* Solution Modal */}
      <Modal
        visible={showSolution}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <MaterialCommunityIcons name="lightbulb" size={24} color="#2196F3" />
              <Text style={styles.modalTitle}>Solution</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSolution(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.solutionText}>{solution}</Text>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => getAudio(solution)}
            >
              <MaterialCommunityIcons name="volume-high" size={20} color="white" />
              <Text style={styles.buttonText}>Generate Audio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#2C3E50',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedSubjectCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  analysisButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  topicText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    marginRight: 12,
  },
  patternText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 60,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  configRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionCounter: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedOptionButton: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCircle: {
    backgroundColor: '#2196F3',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  actionButtons: {
    gap: 12,
  },
  solutionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  solutionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  modalActions: {
    padding: 16,
  },
  audioButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default ExamWiseScreen;