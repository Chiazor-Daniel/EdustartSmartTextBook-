import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// Sample data for the performance metrics
const subjectData = [
  {
    id: '1',
    subject: 'Biology',
    score: 74,
    progress: 74,
    color: '#22C55E',
    icon: 'leaf',
  },
  {
    id: '2',
    subject: 'Chemistry',
    score: 65,
    progress: 70,
    color: '#3B82F6',
    icon: 'flask',
  },
  {
    id: '3',
    subject: 'Physics',
    score: 70,
    progress: 70,
    color: '#F59E0B',
    icon: 'atom',
  },
];

const PerformanceOverviewScreen = () => {
  // Progress bar component
  const ProgressBar = ({ progress, color }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Metrics</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overall Score Card */}
        <View style={styles.overallScoreCard}>
          <View style={styles.overallScoreHeader}>
            <Text style={styles.overallScoreTitle}>Overall Score</Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color="#EF4444" />
              <Text style={styles.streakText}>320</Text>
            </View>
          </View>
          
          <View style={styles.overallScoreContent}>
            <Text style={styles.overallScorePercentage}>72%</Text>
            
            <View style={styles.subjectScores}>
              {subjectData.map((subject) => (
                <View key={subject.id} style={styles.subjectScoreRow}>
                  <Text style={styles.subjectScoreName}>{subject.subject}</Text>
                  <Text style={styles.subjectScoreValue}>{subject.score}%</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.leaderboardButton}>
              <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
              <Ionicons name="chevron-forward" size={16} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Performance Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          {subjectData.map((subject) => (
            <View key={subject.id} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <View style={[styles.subjectIconContainer, { backgroundColor: subject.color }]}>
                  <MaterialCommunityIcons name={subject.icon} size={24} color="white" />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectTitle}>{subject.subject}</Text>
                </View>
                <Text style={styles.subjectScore}>{subject.score}%</Text>
              </View>
              <View style={styles.progressSection}>
                <ProgressBar progress={subject.progress} color={subject.color} />
                <Text style={styles.progressPercentage}>{subject.progress}%</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overallScoreCard: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallScoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },
  overallScoreContent: {
    alignItems: 'center',
  },
  overallScorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  subjectScores: {
    width: '100%',
    marginBottom: 20,
  },
  subjectScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subjectScoreName: {
    fontSize: 14,
    color: '#1E293B',
  },
  subjectScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  leaderboardButtonText: {
    fontSize: 14,
    color: '#1E293B',
    marginRight: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  subjectScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8,
    width: 30,
    textAlign: 'right',
  },
});

export default PerformanceOverviewScreen;