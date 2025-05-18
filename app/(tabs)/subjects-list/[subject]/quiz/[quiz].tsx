import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const QuizScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [direction, setDirection] = useState('next'); // 'next' or 'previous'

  const questions = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/5428147/pexels-photo-5428147.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: 'Biology - Skeletal system',
      question: 'The primary organs involved in maintaining homeostasis include the:',
      options: [
        { label: 'A', text: 'Heart and Lungs' },
        { label: 'B', text: 'Kidneys and Liver' },
        { label: 'C', text: 'Brain and Pancreas' },
        { label: 'D', text: 'Skin and Muscles' },
      ],
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/5428147/pexels-photo-5428147.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: 'Chemistry - Periodic Table',
      question: 'Which element has the atomic number 7?',
      options: [
        { label: 'A', text: 'Oxygen' },
        { label: 'B', text: 'Nitrogen' },
        { label: 'C', text: 'Carbon' },
        { label: 'D', text: 'Hydrogen' },
      ],
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/5428147/pexels-photo-5428147.jpeg?auto=compress&cs=tinysrgb&w=600',
      caption: 'Physics - Mechanics',
      question: 'What is the SI unit of force?',
      options: [
        { label: 'A', text: 'Joule' },
        { label: 'B', text: 'Watt' },
        { label: 'C', text: 'Newton' },
        { label: 'D', text: 'Pascal' },
      ],
    },
  ];

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
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection('next');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection('previous');
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Progress indicator
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={()=>router.back()} >
            <Feather name="chevron-left" size={20} color={currentIndex === 0 ? "#ccc" : "#666"} />
            <Text style={[styles.backText, {color: currentIndex === 0 ? "#ccc" : "#666"}]}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Quick Test</Text>
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
              <Image 
                source={{ uri: questions[currentIndex].image }} 
                style={styles.questionImage}
                resizeMode="contain"
              />
              
              <Text style={styles.imageCaption}>{questions[currentIndex].caption}</Text>
              
              <Text style={styles.questionText}>
                {questions[currentIndex].question}
              </Text>
              
              <View style={styles.answersContainer}>
                {questions[currentIndex].options.map(option => (
                  <TouchableOpacity key={option.label} style={styles.answerButton}>
                    <Text style={styles.answerText}>{option.label}. {option.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <TouchableOpacity 
              style={[styles.previousButton, currentIndex === 0 && styles.disabledButton]} 
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Text style={[styles.previousButtonText, currentIndex === 0 && styles.disabledText]}>Previous</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.pageIndicator}>{currentIndex + 1}/{questions.length}</Text>
          
          <View style={styles.footerRight}>
            <TouchableOpacity 
              style={[styles.nextButton, currentIndex === questions.length - 1 && styles.disabledNextButton]} 
              onPress={handleNext}
              disabled={currentIndex === questions.length - 1}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="chevron-right" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
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
    position: 'relative',
    overflow: 'hidden',
  },
  cardAnimated: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: '100%',
  },
  questionImage: {
    width: '100%',
    height: 220,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  imageCaption: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
  },
  answersContainer: {
    marginTop: 8,
  },
  answerButton: {
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 12,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F1F5F9',
  },
  footerLeft: {},
  footerRight: {},
  previousButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  previousButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    marginRight: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledNextButton: {
    backgroundColor: '#94A3B8',
  },
  disabledText: {
    color: '#94A3B8',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#666',
  }
});

export default QuizScreen;