import { useAuthStore } from '@/store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

const dashboardCards = [
  {
    key: 'study',
    title: 'Study Now',
    iconType: 'study',
    color: '#FF6B6B',
    onPress: (navigation: any) => router.push('/subjects-list'),
  },
  {
    key: 'test',
    title: 'Take a test',
    iconType: 'test',
    color: '#4ECDC4',
    onPress: (navigation: any) => router.push('/examwise'),
  },
  {
    key: 'class',
    title: 'Join a Class',
    iconType: 'class',
    color: '#45B7D1',
    onPress: (navigation: any) => router.push('/join-class'),
  },
  {
    key: 'metrics',
    title: 'Performance Metrics',
    iconType: 'metrics',
    color: '#96CEB4',
    onPress: (navigation: any) => router.push('/performance'),
  },
];

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [streakDays] = useState(320);
  const { user } = useAuthStore();
  const [bestStreak] = useState(320);
  const streakPercentage = 75;

  // Circular progress component for streak
  const CircularProgress = ({ percentage, size, strokeWidth, text, subtext }: {
    percentage: number;
    size: number;
    strokeWidth: number;
    text: string;
    subtext?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <View style={{ width: size, height: size, alignItems: 'center' as const, justifyContent: 'center' as const }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            <Circle
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke="#E8E8E8"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke="#4A90E2"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.circularTextContainer}>
          <Text style={styles.circularProgressText}>{text}</Text>
          {subtext && <Text style={styles.circularProgressSubtext}>{subtext}</Text>}
        </View>
      </View>
    );
  };

  const IllustrationIcon = ({ type, color }: { type: string; color: string }) => {
    const iconStyle = {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: color,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
    };

    switch (type) {
      case 'study':
        return (
          <View style={iconStyle}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color="white" />
          </View>
        );
      case 'test':
        return (
          <View style={iconStyle}>
            <MaterialCommunityIcons name="file-document-edit" size={28} color="white" />
          </View>
        );
      case 'metrics':
        return (
          <View style={iconStyle}>
            <MaterialCommunityIcons name="chart-line" size={28} color="white" />
          </View>
        );
      case 'class':
        return (
          <View style={iconStyle}>
            <MaterialCommunityIcons name="account-group" size={28} color="white" />
          </View>
        );
      default:
        return <View style={iconStyle} />;
    }
  };

  const learningProgress = [
    { subject: 'Biology', progress: 40, color: '#4A90E2' },
    { subject: 'Chemistry', progress: 75, color: '#7ED321' },
    { subject: 'Physics', progress: 60, color: '#F5A623' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerGreeting}>Hi, {user?.full_name?.split(' ')[0] || 'Student'}!</Text>
              <Text style={styles.headerSubtitle}>What's catching your interest today?</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>Best</Text>
              <Text style={styles.streakNumber}>{bestStreak}</Text>
              <Text style={styles.streakLabel}>Keep it going!</Text>
            </View>
          </View>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          {dashboardCards.map(card => (
            <TouchableOpacity
              key={card.key}
              style={styles.dashboardItem}
              onPress={() => card.onPress(navigation)}
              activeOpacity={0.8}
            >
              <IllustrationIcon type={card.iconType} color={card.color} />
              <Text style={styles.itemTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Learning Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          {learningProgress.map((item, index) => (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressInfo}>
                <View style={[styles.progressDot, { backgroundColor: item.color }]} />
                <Text style={styles.progressSubject}>{item.subject}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${item.progress}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>{item.progress}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Navigation Placeholder */}
        <View style={styles.bottomNavPlaceholder} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="grid" size={24} color="#4A90E2" />
          <Text style={[styles.navText, styles.activeNavText]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/subjects-list')}>
          <Ionicons name="book" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Study</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/join-class')}>
          <Ionicons name="people" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Join Class</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="settings" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerCard: {
    backgroundColor: '#4A90E2',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  streakText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dashboardItem: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressSubject: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    width: 35,
  },
  circularTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  circularProgressSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bottomNavPlaceholder: {
    height: 80,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Active state styling
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeNavText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default HomeScreen;