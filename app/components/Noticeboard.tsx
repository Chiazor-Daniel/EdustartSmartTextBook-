import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Types for our data
interface AssignedTest {
  id: string;
  title: string;
  subject: string;
  count: number;
}

interface TestScore {
  id: string;
  title: string;
  subject: string;
  score: number;
}

interface NoticeBoardProps {
  assignedTests: AssignedTest[];
  recentScores: TestScore[];
  onViewMore?: () => void;
}

const NoticeBoard = ({ assignedTests, recentScores, onViewMore }: NoticeBoardProps) => {
  // Function to determine score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E'; // Green for high scores
    if (score >= 70) return '#F59E0B'; // Amber for medium scores
    if (score >= 60) return '#F97316'; // Orange for low-medium scores
    return '#EF4444'; // Red for low scores
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notice Board</Text>
      
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Test</Text>
        </View>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.titleColumn]}>Title</Text>
          <Text style={[styles.headerText, styles.subjectColumn]}>Subject</Text>
          <Text style={[styles.headerText, styles.countColumn]}>
            <Text style={styles.viewMoreText} onPress={onViewMore}>view more</Text>
          </Text>
        </View>
        
        <ScrollView style={styles.tableContent} nestedScrollEnabled>
          {assignedTests.map((test) => (
            <View key={test.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.titleColumn]} numberOfLines={1}>{test.title}</Text>
              <Text style={[styles.cellText, styles.subjectColumn]}>{test.subject}</Text>
              <Text style={[styles.cellText, styles.countColumn]}>{test.count}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent scores</Text>
        </View>
        
        <ScrollView style={styles.scoresContent} nestedScrollEnabled>
          {recentScores.map((score) => (
            <View key={score.id} style={styles.scoreRow}>
              <Text style={[styles.cellText, styles.titleColumn]} numberOfLines={1}>{score.title}</Text>
              <Text style={[styles.cellText, styles.subjectColumn]}>{score.subject}</Text>
              <Text 
                style={[
                  styles.scoreText, 
                  { color: getScoreColor(score.score) }
                ]}
              >
                {score.score}%
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
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
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  titleColumn: {
    flex: 2,
    paddingRight: 8,
  },
  subjectColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  countColumn: {
    width: 40,
    textAlign: 'center',
  },
  viewMoreText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tableContent: {
    maxHeight: 180,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cellText: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  scoresContent: {
    maxHeight: 180,
  },
  scoreRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  scoreText: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NoticeBoard;