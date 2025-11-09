import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

type ExamTimerProps = {
  timeDisplay: string;
  subject: string;
  year: string | number;
  difficulty: string;
  onBegin: () => void;
  duration: number | 'No Timer';
  onDurationChange: (minutes: number | 'No Timer') => void;
};

const ExamTimerComponent = ({ 
  timeDisplay = "0:00", 
  subject, 
  year, 
  difficulty, 
  onBegin,
  duration,
  onDurationChange 
}: ExamTimerProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const durations = ['No Timer', 15, 30, 45, 60, 90, 120]; // Available durations in minutes

  const handleBegin = () => {
    if (onBegin) onBegin();
  };

  const formatDuration = (mins: number | 'No Timer') => {
    if (mins === 'No Timer') return 'No Timer';
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>Take an Exam</Text>
      
      {/* Set Timer Section */}
      <View style={styles.timerSelectionContainer}>
        <Text style={styles.sectionTitle}>Select Duration</Text>
        <View style={styles.durationGrid}>
          {durations.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.durationOption,
                duration === mins * 60 && styles.durationOptionSelected
              ]}
              onPress={() => onDurationChange(mins)}
            >
              <Text style={[
                styles.durationText,
                duration === mins * 60 && styles.durationTextSelected
              ]}>
                {formatDuration(mins)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Circular Timer */}
      {
        duration !== 'No Timer' && 
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
      }

      {/* Subject Info */}
      <Text style={styles.subjectText}>{subject}</Text>
      <Text style={styles.subjectDetails}>{year} . {difficulty}</Text>

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
    paddingHorizontal: 20,
  },
  timerSelectionContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  durationOption: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  durationOptionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  durationText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  timerSelectionContainer: {
    marginVertical: 16,
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
  },
  timerOption: {
    flex: 1,
    minWidth: '22%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
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