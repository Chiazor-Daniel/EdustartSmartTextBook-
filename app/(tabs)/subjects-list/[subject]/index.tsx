// TopicsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useGetTopicsQuery } from '@/services/api';



export default function TopicsScreen() {
  const { subject, subjectId } = useLocalSearchParams<{
    subject: string;
    subjectId: string;
  }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Use the subject ID passed from the subjects list screen
  const subjectIdNumber = parseInt(subjectId || '4', 10);
  
  const { data: topicsData, isLoading, error, refetch } = useGetTopicsQuery(subjectIdNumber);

  useEffect(() => {
    console.log(topicsData);
  }, [topicsData]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Filter topics based on search query
  const filteredTopics = topicsData?.results?.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleTopicPress = (topic) => {
    // Navigate to the topic content screen with subject and topic IDs
    router.push({
      pathname: `/(tabs)/subjects-list/${subject}/slug/${topic.slug}`,
      params: { 
        subjectId: subjectIdNumber,
        topicId: topic.id
      }
    });
  };

  const renderTopicItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.topicItem}>
      <View style={styles.topicNumberContainer}>
        <Text style={styles.topicNumber}>{(index + 1).toString().padStart(2, '0')}</Text>
      </View>
      <View style={styles.topicTitleContainer}>
        <Text style={styles.topicTitle}>{item.title}</Text>
      </View>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => handleTopicPress(item)}
      >
        <Feather name="play" size={16} color="white" style={styles.playIcon} />
        <Text style={styles.startButtonText}>Start Topic</Text>
      </TouchableOpacity>
      
      {item.active_classes && item.active_classes.length > 0 && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>LIVE</Text>
        </View>
      )}
    </View>
  );

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Title and Breadcrumbs */}
        <Text style={styles.title}>Subjects</Text>
        <View style={styles.breadcrumbs}>
          <Text  style={styles.breadcrumbText}>{subject}</Text>
          <Text style={styles.breadcrumbSeparator}> / </Text>
          <Text style={styles.breadcrumbCurrent}>Topic List</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by topic"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B8AF7" />
            <Text style={styles.loadingText}>Loading topics...</Text>
          </View>
        )}
        
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load topics</Text>
            <TouchableOpacity style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && filteredTopics.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="book" size={40} color="#64748B" />
            <Text style={styles.emptyText}>No topics found</Text>
          </View>
        )}
        
        {/* Topics List */}
        {!isLoading && !error && filteredTopics.length > 0 && (
          <FlatList
            data={filteredTopics}
            renderItem={renderTopicItem}
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
    marginBottom: 4,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 4,
  },
  breadcrumbCurrent: {
    fontSize: 16,
    color: '#94A3B8',
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
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  topicNumberContainer: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  topicTitleContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
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
    color: 'white',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B8AF7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  playIcon: {
    marginRight: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  newBadge: {
    position: 'absolute',
    bottom: -6,
    right: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});