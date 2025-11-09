// SubjectsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, Router, useLocalSearchParams } from 'expo-router';
import { useGetSubjectsQuery } from '@/services/api';

export default function SubjectsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { data: subjectsData, isLoading, error, refetch } = useGetSubjectsQuery();
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Filter subjects based on search query
  const filteredSubjects = subjectsData?.results?.filter(subject => 
    subject.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const handleSubjectPress = (subject) => {
    // Pass the subject ID and slug to the topics screen
    router.push({
      pathname: `/(tabs)/subjects-list/${subject.slug}`,
      params: { subjectId: subject.id }
    });
  };

  // Get subject card color based on subject name
  const getSubjectColor = (title) => {
    const colors = {
      'Biology': '#A8E6CF',
      'Chemistry': '#AED6F1',
      'Physics': '#F9E79F',
      'Mathematics': '#F8BBD9',
      'English': '#D5A6BD',
      'History': '#FAD5A5',
    };
    return colors[title] || '#E8F4FD';
  };

  // Get subject icon based on subject name
  const getSubjectIcon = (title) => {
    const icons = {
      'Biology': '🧬',
      'Chemistry': '⚗️',
      'Physics': '⚛️',
      'Mathematics': '📊',
      'English': '📝',
      'History': '📜',
    };
    return icons[title] || '📚';
  };

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.subjectCard, { backgroundColor: getSubjectColor(item.title) }]}
      onPress={() => handleSubjectPress(item)}
    >
      <View style={styles.subjectContent}>
        <View style={styles.subjectIconContainer}>
          {item.image ? (
            item.title === 'Biology' ? (
              <Image source={require('@/assets/bio.png')} style={styles.subjectImage} resizeMode="contain" />
            ) 
            : item.title === 'Chemistry' ? (
              <Image source={require('@/assets/chem.png')} style={styles.subjectImage} resizeMode="contain" />
            )
            : item.title === 'Physics' ? (
              <Image source={require('@/assets/phy.png')} style={styles.subjectImage} resizeMode="contain" />
            )
            : (
              <Image source={{ uri: item.image }} style={styles.subjectImage} resizeMode="contain" />
            )
          ) : (
            <Text style={styles.subjectIcon}>{getSubjectIcon(item.title)}</Text>
          )}
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.title}</Text>
          {/* <Text style={styles.subjectTopics}>
            {item.lesson_count || '0'} lessons
          </Text> */}
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Feather name="chevron-right" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Title */}
        <Text style={styles.title}>Subjects</Text>
        
        {/* Motivational Header */}
        <View style={styles.motivationalHeader}>
          <Text style={styles.motivationalText}>
            What are you going to <Text style={styles.studyText}>study</Text>
          </Text>
          <Text style={styles.motivationalText}>today ?</Text>
          <View style={styles.colorBars}>
            <View style={[styles.colorBar, { backgroundColor: '#FFD700' }]} />
            <View style={[styles.colorBar, { backgroundColor: '#87CEEB' }]} />
            <View style={[styles.colorBar, { backgroundColor: '#FFB6C1' }]} />
            <View style={[styles.colorBar, { backgroundColor: '#98FB98' }]} />
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by topic"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B8AF7" />
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        )}
        
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load subjects</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && filteredSubjects.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="book" size={40} color="#64748B" />
            <Text style={styles.emptyText}>No subjects found</Text>
          </View>
        )}
        
        {/* Subjects List */}
        {!isLoading && !error && filteredSubjects.length > 0 && (
          <FlatList
            data={filteredSubjects}
            renderItem={renderSubjectItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#6B8AF7']}
                tintColor="#6B8AF7"
                progressBackgroundColor="rgba(255, 255, 255, 0.1)"
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: '#2C3E50',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  motivationalHeader: {
    marginBottom: 30,
  },
  motivationalText: {
    fontSize: 22,
    color: '#2C3E50',
    fontWeight: '600',
    lineHeight: 28,
  },
  studyText: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  colorBars: {
    flexDirection: 'row',
    marginTop: 12,
  },
  colorBar: {
    width: 30,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#2C3E50',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectIcon: {
    fontSize: 26,
  },
  subjectImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subjectTopics: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  arrowContainer: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
});