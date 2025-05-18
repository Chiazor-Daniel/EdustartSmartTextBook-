import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types for our class data
interface OngoingClass {
  id: string;
  topic: string;
  subject: string;
  isActive: boolean;
  teacher: string;
}

const JoinClassScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  
  // Sample data for ongoing classes
  const ongoingClasses: OngoingClass[] = [
    { id: '1', topic: 'Excretory System and Metabolism', subject: 'Biology', isActive: true, teacher: 'Donatus Biehung' },
    { id: '2', topic: 'Equilibrium', subject: 'Physics', isActive: true, teacher: 'Sarah Johnson' },
    { id: '3', topic: 'Chemical bonding', subject: 'Chemistry', isActive: true, teacher: 'Michael Chen' },
    { id: '4', topic: 'Basic function of living organisms', subject: 'Biology', isActive: false, teacher: 'Emma Wilson' },
    { id: '5', topic: 'Basic function of living organisms', subject: 'Biology', isActive: false, teacher: 'James Taylor' },
    { id: '6', topic: 'Basic function of living organisms', subject: 'Biology', isActive: false, teacher: 'Olivia Brown' },
    { id: '7', topic: 'Basic function of living organisms', subject: 'Biology', isActive: false, teacher: 'Noah Martinez' },
    { id: '8', topic: 'Basic function of living organisms', subject: 'Biology', isActive: false, teacher: 'Sophia Garcia' },
    { id: '9', topic: 'Basic function of living organisms', subject: 'Biology', isActive: false, teacher: 'William Rodriguez' },
  ];

  const filteredClasses = searchQuery
    ? ongoingClasses.filter(item => 
        item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ongoingClasses;

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Additional search logic can be implemented here
  };

  const toggleExpandClass = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  const handleJoinClass = (classId: string) => {
    console.log('Joining class with ID:', classId);
    // Navigation or join class logic here
  };

  const renderClassItem = ({ item }: { item: OngoingClass }) => {
    const isExpanded = expandedClassId === item.id;
    
    return (
      <View>
        <View style={styles.classItem}>
          <View style={styles.topicContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: item.isActive ? '#22C55E' : '#A5B4FC' }
            ]} />
            <Text style={styles.topicText} numberOfLines={1}>{item.topic}</Text>
          </View>
          
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectText}>{item.subject}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.actionContainer}
            onPress={() => toggleExpandClass(item.id)}
          >
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#64748B" 
            />
          </TouchableOpacity>
        </View>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.teacherName}>{item.teacher}</Text>
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => handleJoinClass(item.id)}
            >
              <Text style={styles.joinButtonText}>Join Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join an Ongoing Class</Text>
        <Text style={styles.subtitle}>
          Click on any ongoing class to join or use the search bar to lookup ongoing classes
        </Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.classesContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.topicHeader]}>Ongoing Topic</Text>
            <Text style={[styles.headerText, styles.subjectHeader]}>Subjects</Text>
            <Text style={[styles.headerText, styles.actionHeader]}>Action</Text>
          </View>
          
          <FlatList
            data={filteredClasses}
            renderItem={renderClassItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.classesList}
          />
        </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: 'white',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#EAB308',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchButtonText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 14,
  },
  classesContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  topicHeader: {
    flex: 2,
  },
  subjectHeader: {
    flex: 1,
    textAlign: 'center',
  },
  actionHeader: {
    width: 60,
    textAlign: 'center',
  },
  classesList: {
    paddingBottom: 8,
  },
  classItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  topicContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  subjectContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    color: '#334155',
  },
  actionContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContent: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherName: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 18, // Align with topic text
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JoinClassScreen;