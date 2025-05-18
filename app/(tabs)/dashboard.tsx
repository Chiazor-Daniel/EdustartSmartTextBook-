import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const DashboardScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <Text style={styles.title}>Select an option to begin</Text>
        
        <ScrollView style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('Subjects')}
          >
            <View style={styles.iconContainer}>
              <Feather name="lightbulb" size={28} color="#fff" />
            </View>
            <Text style={styles.optionTitle}>Do a Quiz</Text>
            <Text style={styles.optionSubtitle}>Select a subject to begin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('AssessmentNotification')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' }]}>
              <Feather name="file-text" size={28} color="#fff" />
            </View>
            <Text style={styles.optionTitle}>Take an Exam</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionTitle}>Results</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressOuter}>
                <View style={styles.progressInner} />
              </View>
              <Text style={styles.progressText}>72%</Text>
            </View>
            <Text style={styles.viewAllText}>View all results</Text>
          </TouchableOpacity>
          
          <View style={styles.noticeBoard}>
            <Text style={styles.noticeBoardTitle}>Notice Board</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  progressOuter: {
    width: '80%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressInner: {
    width: '72%',
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  viewAllText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noticeBoard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  noticeBoardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
