"use client"

import { useAuthStore } from "@/store/authStore"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Image } from "expo-image"
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native"
import Svg, { Circle, G } from "react-native-svg"
import { ImageBackground } from "react-native"
import { useUIStore } from "@/store/uiStore"

const { width } = Dimensions.get("window")

const icons: Record<string, any> = {
  "study.png": require("../../assets/study.png"),
  "test.png": require("../../assets/test.png"),
  "join.png": require("../../assets/join.png"),
  "metrics.png": require("../../assets/metrics.png"),
}

const dashboardCards = [
  { key: "study", title: "Study Now", iconType: "study.png", color: "#FFA726", onPress: () => router.push("/subjects-list") },
  { key: "test", title: "Mock Exam", iconType: "test.png", color: "#42A5F5", onPress: () => router.push("/examwise") },
  { key: "class", title: "Join a Class", iconType: "join.png", color: "#26C6DA", onPress: () => router.push("/join-class") },
  { key: "metrics", title: "Performance Metrics", iconType: "metrics.png", color: "#66BB6A", onPress: () => router.push("/performance") },
]

export default function HomeScreen() {
  const [streakDays] = useState(320)
  const { user } = useAuthStore()
   const { isHeaderVisible, isBottomNavVisible, setHeaderVisible, setBottomNavVisible } = useUIStore();

   useEffect(() => {
   !isHeaderVisible &&   setHeaderVisible(true);
    
    !isBottomNavVisible &&  setBottomNavVisible(true);
      
    }, []);

  const IllustrationIcon = ({ type }: { type: string }) => (
    <Image source={icons[type]} style={{ width: 56, height: 56 }} />
  )

  const learningProgress = [
    { subject: "Biology", progress: 40, icon: "dna", color: "#4A90E2" },
    { subject: "Chemistry", progress: 75, icon: "flask-outline", color: "#8BC34A" },
    { subject: "Physics", progress: 60, icon: "atom-variant", color: "#FF9800" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Card */}
        <ImageBackground source={require("../../assets/hero.png")} style={styles.welcomeCard} resizeMode="cover">
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeGreeting}>Hi, {user?.full_name?.split(" ")[0] || "Donatusii"}!</Text>
              <Text style={styles.welcomeMessage}>What's catching your</Text>
              <Text style={styles.welcomeMessage}>
                <Text style={styles.interestText}>interest</Text> today?
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <View style={styles.fireIcon}>
                <Image source={require("../../assets/Fire.gif")} style={{ width: 30, height: 30 }} />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakLabel}>Best:  <Text style={styles.streakNumber}>320</Text></Text>
                <Text style={styles.streakSubtext}>Keep it going!</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          {dashboardCards.map((card) => (
            <TouchableOpacity key={card.key} style={styles.dashboardItem} onPress={card.onPress} activeOpacity={0.8}>
              <View style={[styles.iconContainer]}>
                <IllustrationIcon type={card.iconType} />
              </View>
              <Text style={styles.itemTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Learning Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          {learningProgress.map((item, index) => (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressInfo}>
                <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
                <Text style={styles.progressSubject}>{item.subject}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBar, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.progressPercentage}>{item.progress}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA" 
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
  welcomeCard: { 
    marginHorizontal: 20, 
    paddingHorizontal: 14,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderRadius: 18,   // keep it rounded, 20 looks better than 100 here
    overflow: "hidden", // 🔑 ensures ImageBackground respects radius
  },
  welcomeContent: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start" 
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#FFFFFF", 
    marginBottom: 8 
  },
  welcomeMessage: { 
    fontSize: 16, 
    color: "#FFFFFF",
    lineHeight: 22,
  },
  interestText: {
    color: "#FFD700",
    fontWeight: "600",
  },
  streakContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
  },
  fireIcon: {
    marginBottom: 4,
  },
  fireEmoji: {
    fontSize: 24,
  },
  streakInfo: {
    alignItems: "center",
  },
  streakLabel: { 
    fontSize: 12, 
    color: "#000",
    opacity: 0.8,
  },
  streakNumber: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#000" 
  },
  streakSubtext: { 
    fontSize: 10, 
    color: "#000",
    opacity: 0.8,
  },
  dashboardGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: "space-between",
  },
  dashboardItem: { 
    width: (width - 56) / 2, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#2C3E50", 
    textAlign: "center",
    lineHeight: 18,
  },
  progressSection: { 
    backgroundColor: "transparent", 
    marginHorizontal: 20, 
    borderRadius: 16, 
    padding: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#2C3E50", 
    marginBottom: 20 
  },
  progressItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 16,
    paddingVertical: 4,
  },
  progressInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    width: 100 
  },
  progressSubject: { 
    fontSize: 14, 
    color: "#64748B", 
    fontWeight: "500", 
    marginLeft: 8 
  },
  progressBarContainer: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    marginLeft: 16 
  },
  progressBarBg: { 
    flex: 1, 
    height: 6, 
    backgroundColor: "#E2E8F0", 
    borderRadius: 3, 
    marginRight: 12 
  },
  progressBar: { 
    height: "100%", 
    borderRadius: 3 
  },
  progressPercentage: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#2C3E50", 
    width: 35,
    textAlign: 'right',
  },
  bottomSpacing: { 
    height: 20 
  },
})