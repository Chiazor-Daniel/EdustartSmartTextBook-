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
  View
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

const dashboardCards = [
  {
    key: 'study',
    title: 'STUDY',
    iconType: 'study',
    onPress: (navigation: any) => router.push('/subjects-list'),
  },
  {
    key: 'test',
    title: 'TAKE A TEST',
    iconType: 'test',
    onPress: (navigation: any) => router.push('/assessment-notification'),
  },
  {
    key: 'metrics',
    title: 'PERFORMANCE\nMETRICS',
    iconType: 'metrics',
    onPress: (navigation: any) => router.push('/performance'),
  },
  {
    key: 'class',
    title: 'JOIN A CLASS',
    iconType: 'class',
    onPress: (navigation: any) => router.push('/join-class'),
  },
];

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [streakDays] = useState(234);
  const { user } = useAuthStore();
  const [bestStreak] = useState(320);
  const streakPercentage = 75; // Based on the visual in the image

  // Circular progress component for streak
  const CircularProgress = ({ percentage, size, strokeWidth, text, subtext, goal }: {
    percentage: number;
    size: number;
    strokeWidth: number;
    text: string;
    subtext?: string;
    goal?: string;
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
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke="#60A5FA"
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

  // Placeholder component for detailed illustrations
  const IllustrationIcon = ({ type }: { type: string }) => {
    const iconStyle = {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    };

    switch (type) {
      case 'study':
        return (
          <View style={styles.iconStyle}>
            <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#60A5FA" />
            <View style={styles.iconOverlay}>
              <Ionicons name="library" size={16} color="white" />
            </View>
          </View>
        );
      case 'test':
        return (
          <View style={styles.iconStyle}>
            <MaterialCommunityIcons name="file-document-edit" size={32} color="#60A5FA" />
            <View style={styles.iconOverlay}>
              <Ionicons name="checkmark-circle" size={16} color="white" />
            </View>
          </View>
        );
      case 'metrics':
        return (
          <View style={styles.iconStyle}>
            <MaterialCommunityIcons name="chart-line" size={32} color="#60A5FA" />
            <View style={styles.iconOverlay}>
              <MaterialCommunityIcons name="chart-bar" size={16} color="white" />
            </View>
          </View>
        );
      case 'class':
        return (
          <View style={styles.iconStyle}>
            <MaterialCommunityIcons name="account-group" size={32} color="#60A5FA" />
            <View style={styles.iconOverlay}>
              <Ionicons name="videocam" size={16} color="white" />
            </View>
          </View>
        );
      default:
        return <View style={styles.iconStyle} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Welcome Banner */}
      <ImageBackground
        source={require('../../assets/welcomebg.jpg')}
        style={styles.welcomeBanner}
        imageStyle={{ borderRadius: 12 }}
      >
        <Text style={styles.welcomeText}>Welcome, {user?.full_name}!</Text>
      </ImageBackground>

      {/* Dashboard Grid */}
      <View style={styles.dashboardGrid}>
        {dashboardCards.map(card => (
          <TouchableOpacity
            key={card.key}
            style={styles.dashboardItem}
            onPress={() => card.onPress(navigation)}
            activeOpacity={0.8}
          >
            <IllustrationIcon type={card.iconType} />
            <Text style={styles.itemTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Text style={styles.streakTitle}>Streak</Text>
        
        <View style={styles.streakContent}>
          <CircularProgress 
            percentage={streakPercentage} 
            size={120} 
            strokeWidth={8} 
            text={streakDays.toString()} 
            subtext="days"
          />
        </View>
        
        <Text style={styles.bestStreak}>Best {bestStreak}</Text>
        <Text style={styles.streakMessage}>Keep it going 💪</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Dark blue background
    paddingHorizontal: 20,
  },
  welcomeBanner: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  welcomeBannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  dashboardItem: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 60, // Circular items
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    borderRadius: 8,
    padding: 2,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 4,
  },
  streakSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  streakContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  circularTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  circularProgressSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  bestStreak: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  streakMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  iconStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default HomeScreen;