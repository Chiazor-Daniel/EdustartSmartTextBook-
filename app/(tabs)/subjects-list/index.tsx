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


  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.subjectCard, { borderLeftColor: item.color || '#6B8AF7', borderLeftWidth: 4 }]}
      onPress={() => handleSubjectPress(item)}
    >
      <View style={styles.subjectIconContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.subjectImage} resizeMode="contain" />
        ) : (
          <Text style={styles.subjectIcon}>📚</Text>
        )}
      </View>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{item.title}</Text>
        <Text style={styles.subjectTopics}>{item.content}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Feather name="chevron-right" size={24} color="#6B8AF7" />
      </View>
    </TouchableOpacity>
  );

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        {/* Title */}
        <Text style={styles.title}>Subjects</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject"
            placeholderTextColor="#64748B"
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
            <TouchableOpacity style={styles.retryButton}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
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
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subjectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(107, 138, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectIcon: {
    fontSize: 24,
  },
  subjectImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
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
    color: '#94A3B8',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  subjectTopics: {
    fontSize: 14,
    color: '#94A3B8',
  },
  arrowContainer: {
    padding: 4,
  },
});