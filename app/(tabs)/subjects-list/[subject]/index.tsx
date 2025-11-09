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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Use the subject ID passed from the subjects list screen
  const subjectIdNumber = parseInt(subjectId || '4', 10);
  
  const { data: topicsData, isLoading, error, refetch } = useGetTopicsQuery(subjectIdNumber);

  useEffect(() => {
    console.log(topicsData);
  }, [topicsData]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Filter topics based on search query
  const filteredTopics = topicsData?.results?.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate pagination
  const totalItems = filteredTopics.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = filteredTopics.slice(startIndex, endIndex);

  // Calculate actual item numbers for display (considering pagination)
  const getItemNumber = (index: number) => startIndex + index + 1;

  // Get topic card color based on index for variety
  const getTopicColor = (index: number) => {
    const colors = [
      '#A8E6CF', // Light green
      '#AED6F1', // Light blue
      '#F9E79F', // Light yellow
      '#F8BBD9', // Light pink
      '#D5A6BD', // Light purple
      '#FAD5A5', // Light orange
    ];
    return colors[index % colors.length];
  };

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageButton = (page: number, isActive: boolean = false) => (
    <TouchableOpacity
      key={page}
      style={[styles.pageButton, isActive && styles.activePageButton]}
      onPress={() => handlePageChange(page)}
    >
      <Text style={[styles.pageButtonText, isActive && styles.activePageButtonText]}>
        {page}
      </Text>
    </TouchableOpacity>
  );

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate which pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(renderPageButton(1));
      if (startPage > 2) {
        pages.push(
          <Text key="ellipsis1" style={styles.ellipsis}>...</Text>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPageButton(i, i === currentPage));
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="ellipsis2" style={styles.ellipsis}>...</Text>
        );
      }
      pages.push(renderPageButton(totalPages));
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Feather name="chevron-left" size={20} color={currentPage === 1 ? "#999" : "#6B8AF7"} />
          <Text style={[styles.navButtonText, currentPage === 1 && styles.disabledButtonText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pageNumbers}>
          {pages}
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.navButtonText, currentPage === totalPages && styles.disabledButtonText]}>
            Next
          </Text>
          <Feather name="chevron-right" size={20} color={currentPage === totalPages ? "#999" : "#6B8AF7"} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTopicItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity 
      style={[styles.topicCard, { backgroundColor: getTopicColor(getItemNumber(index) - 1) }]}
      onPress={() => handleTopicPress(item)}
    >
      <View style={styles.topicContent}>
        <View style={styles.topicNumberContainer}>
          <Text style={styles.topicNumber}>{getItemNumber(index).toString().padStart(2, '0')}</Text>
        </View>
        <View style={styles.topicInfo}>
          <Text style={styles.topicTitle}>{item.title}</Text>
          {/* Optional: Add topic description or metadata */}
        </View>
      </View>
      <View style={styles.topicActions}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => handleTopicPress(item)}
        >
          <Feather name="play" size={16} color="white" style={styles.playIcon} />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
      
      {item.active_classes && item.active_classes.length > 0 && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPaginationInfo = () => {
    if (totalItems === 0) return null;
    
    const start = startIndex + 1;
    const end = Math.min(endIndex, totalItems);
    
    return (
      <View style={styles.paginationInfo}>
        <Text style={styles.paginationInfoText}>
          Showing {start}-{end} of {totalItems} topics
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Title */}
        <Text style={styles.title}>Subjects</Text>
        
        {/* Breadcrumbs */}
        <View style={styles.breadcrumbs}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.breadcrumbText}>{subject}</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}> / </Text>
          <Text style={styles.breadcrumbCurrent}>Topic List</Text>
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
            <Text style={styles.loadingText}>Loading topics...</Text>
          </View>
        )}
        
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load topics</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
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
        
        {/* Topics List with Pagination */}
        {!isLoading && !error && filteredTopics.length > 0 && (
          <View style={styles.contentContainer}>
            {renderPaginationInfo()}
            
            <FlatList
              data={currentPageItems}
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
            
            {renderPaginationControls()}
          </View>
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
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#6B8AF7',
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 4,
  },
  breadcrumbCurrent: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  colorBars: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  colorBar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginRight: 4,
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
  paginationInfo: {
    marginBottom: 12,
    alignItems: 'center',
  },
  paginationInfoText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listContainer: {
    paddingBottom: 20,
  },
  topicCard: {
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
    position: 'relative',
  },
  topicContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicNumberContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  topicActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
  // Pagination Styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledButton: {
    backgroundColor: '#F1F5F9',
  },
  navButtonText: {
    color: '#6B8AF7',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  disabledButtonText: {
    color: '#999',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activePageButton: {
    backgroundColor: '#6B8AF7',
  },
  pageButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  activePageButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ellipsis: {
    color: '#64748B',
    fontSize: 16,
    marginHorizontal: 4,
  },
});