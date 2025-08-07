import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

type ExamTimerProps = {
  timeDisplay: string;
  subject: string;
  examType: string;
  year: string | number;
  difficulty: string;
  onBegin: () => void;
};

const ExamTimerComponent = ({ timeDisplay = "0:00", subject, examType, year, difficulty, onBegin }: ExamTimerProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBegin = () => {
    if (onBegin) onBegin();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>Take an Exam</Text>
      
      {/* Set Timer Section */}
      
      

      {/* Circular Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.circularTimer}>
          <Svg width={200} height={200} style={styles.svg}>
            {/* Background circle (light blue) */}
            <Circle
              cx={100}
              cy={100}
              r={85}
              stroke="#E3F2FD"
              strokeWidth={12}
              fill="none"
            />
            {/* Progress circle (orange) */}
            <Circle
              cx={100}
              cy={100}
              r={85}
              stroke="#FFA726"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={0}
              transform="rotate(-90 100 100)"
            />
          </Svg>
          <View style={styles.timeTextContainer}>
            <Text style={styles.timeText}>{timeDisplay}</Text>
          </View>
        </View>
      </View>

      {/* Subject Info */}
      <Text style={styles.subjectText}>{subject}</Text>
      <Text style={styles.subjectDetails}>{examType} . {year} . {difficulty}</Text>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Before You Begin</Text>
        
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1.</Text>
          <Text style={styles.instructionText}>
            Read each question carefully. Take your time to understand the question before selecting an answer.
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2.</Text>
          <Text style={styles.instructionText}>
            Use the navigation buttons. Use the "Next" and "Previous" buttons to move through the test.
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3.</Text>
          <Text style={styles.instructionText}>
            Do not refresh the page. Avoid refreshing the page, as this may cause you to lose your progress.
          </Text>
        </View>
      </View>

      {/* Ready to Begin */}
      <View style={styles.readyContainer}>
        <Text style={styles.readyTitle}>Ready to Begin?</Text>
        <Text style={styles.readySubtext}>Click the button to begin. Good luck!</Text>
      </View>

      {/* Begin Button */}
      <TouchableOpacity style={styles.beginButton} onPress={handleBegin}>
        <Text style={styles.beginButtonText}>Begin</Text>
        <Text style={styles.beginButtonArrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 16,
    color: '#5C6BC0',
    fontWeight: '500',
    marginBottom: 40,
  },
  setTimerText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFA726',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 40,
    alignSelf: 'center',
    minWidth: 120,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#333333',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  circularTimer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  timeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333333',
  },
  subjectText: {
    fontSize: 24,
    color: '#5C6BC0',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subjectDetails: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 8,
  },
  instructionNumber: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginRight: 8,
    marginTop: 1,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    flex: 1,
  },
  readyContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  readySubtext: {
    fontSize: 14,
    color: '#666666',
  },
  beginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  beginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  beginButtonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default ExamTimerComponent;