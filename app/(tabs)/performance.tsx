// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Dimensions,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
// import { LineChart } from 'react-native-chart-kit';
// import FloatingAI from '../components/FloatingAI';
// import Svg, { Circle, Path, G } from 'react-native-svg';

// const { width } = Dimensions.get('window');

// // Sample data for the performance metrics
// const subjectData = [
//   {
//     id: '1',
//     subject: 'Biology',
//     score: 74,
//     progress: 70,
//     icon: 'file-document-outline',
//     color: '#8B5CF6',
//   },
//   {
//     id: '2',
//     subject: 'Chemistry',
//     score: 65,
//     progress: 70,
//     icon: 'flask',
//     color: '#F59E0B',
//   },
//   {
//     id: '3',
//     subject: 'Physics',
//     score: 70,
//     progress: 70,
//     icon: 'lightbulb-outline',
//     color: '#EF4444',
//   },
//   {
//     id: '4',
//     subject: 'Mathematics',
//     score: 80,
//     progress: 75,
//     icon: 'calculator-variant',
//     color: '#10B981',
//   },
// ];

// const recentScores = [
//   { id: '1', title: 'Introduction to organic chemistry', subject: 'Chemistry', score: 64 },
//   { id: '2', title: 'Newton\'s law of motion', subject: 'Physics', score: 75 },
//   { id: '3', title: 'Classification of living organisms', subject: 'Biology', score: 72 },
//   { id: '4', title: 'Newton\'s law of motion', subject: 'Physics', score: 36 },
//   { id: '5', title: 'Circle geometry', subject: 'Mathematics', score: 80 },
// ];

// const topRankers = [
//   { 
//     id: '1', 
//     name: 'Donatus Tosin', 
//     rank: 1, 
//     score: 98, 
//     country: 'Nigeria',
//     flag: '🇳🇬',
//     avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '2', 
//     name: 'Grace Tunde', 
//     rank: 2, 
//     score: 93, 
//     country: 'Nigeria',
//     flag: '🇳🇬',
//     avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '3', 
//     name: 'James Tunde', 
//     rank: 3, 
//     score: 91, 
//     country: 'Nigeria',
//     flag: '🇳🇬',
//     avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '4', 
//     name: 'Deepesh Saraf', 
//     rank: 4, 
//     score: 89, 
//     country: 'India',
//     flag: '🇮🇳',
//     avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '5', 
//     name: 'Temitope Hayfar', 
//     rank: 5, 
//     score: 87, 
//     country: 'Nigeria',
//     flag: '🇳🇬',
//     avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '6', 
//     name: 'Alexander Kramer', 
//     rank: 6, 
//     score: 86, 
//     country: 'Germany',
//     flag: '🇩🇪',
//     avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '7', 
//     name: 'Easton Barnes', 
//     rank: 7, 
//     score: 85, 
//     country: 'United States',
//     flag: '🇺🇸',
//     avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '8', 
//     name: 'Abdul Salami', 
//     rank: 8, 
//     score: 83, 
//     country: 'Nigeria',
//     flag: '🇳🇬',
//     avatar: 'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=100'
//   },
//   { 
//     id: '9', 
//     name: 'YOU', 
//     rank: 9, 
//     score: 82, 
//     country: 'Nigeria',
//     flag: '🇳🇬',
//     avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
//     isUser: true
//   },
// ];

// // Chart data for the assessment scores
// const chartData = {
//   labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
//   datasets: [
//     {
//       data: [40, 25, 50, 65, 85],
//       color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
//       strokeWidth: 2
//     }
//   ],
// };

// const PerformanceMetricsScreen = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedWeek, setSelectedWeek] = useState('Week 5');
//   const [timeFrame, setTimeFrame] = useState('Monthly');

//   // Circular progress component for streak and CGPA
//   const CircularProgress = ({ percentage, size, strokeWidth, text, subtext, goal }) => {
//     const radius = (size - strokeWidth) / 2;
//     const circumference = radius * 2 * Math.PI;
//     const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
//     return (
//       <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
//         <Svg width={size} height={size}>
//           <G rotation="-90" origin={`${size/2}, ${size/2}`}>
//             <Circle
//               cx={size/2}
//               cy={size/2}
//               r={radius}
//               stroke="#E6E6FA"
//               strokeWidth={strokeWidth}
//               fill="transparent"
//             />
//             <Circle
//               cx={size/2}
//               cy={size/2}
//               r={radius}
//               stroke="#4169E1"
//               strokeWidth={strokeWidth}
//               fill="transparent"
//               strokeDasharray={circumference}
//               strokeDashoffset={strokeDashoffset}
//               strokeLinecap="round"
//             />
//           </G>
//         </Svg>
//         <View style={styles.circularTextContainer}>
//           <Text style={styles.circularProgressText}>{text}</Text>
//           {subtext && <Text style={styles.circularProgressSubtext}>{subtext}</Text>}
//           {goal && <Text style={styles.circularProgressGoal}>Goal: {goal}</Text>}
//         </View>
//       </View>
//     );
//   };

//   // Progress bar component for subject progress
//   const ProgressBar = ({ progress, color }) => {
//     return (
//       <View style={styles.progressBarContainer}>
//         <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
//       </View>
//     );
//   };

//   // Render subject card
//   const renderSubjectCard = (item) => (
//     <View key={item.id} style={styles.subjectCard}>
//       <View style={styles.subjectHeader}>
//         <View style={[styles.subjectIconContainer, { backgroundColor: item.color }]}>
//           <MaterialCommunityIcons name={item.icon} size={24} color="white" />
//         </View>
//         <View style={styles.subjectInfo}>
//           <Text style={styles.subjectTitle}>{item.subject}</Text>
//           <Text style={styles.subjectSubtitle}>Course notes</Text>
//         </View>
//         <Text style={styles.subjectScore}>{item.score}%</Text>
//       </View>
//       <View style={styles.progressSection}>
//         <Text style={styles.progressLabel}>Progress</Text>
//         <View style={styles.progressBarRow}>
//           <ProgressBar progress={item.progress} color={item.color} />
//           <Text style={styles.progressPercentage}>{item.progress}%</Text>
//         </View>
//       </View>
//     </View>
//   );

//   // Render top 3 rankers podium
//   const renderTopThreePodium = () => {
//     const top3 = topRankers.slice(0, 3);
    
//     return (
//       <View style={styles.podiumContainer}>
//         <Text style={styles.podiumTitle}>Top Rankers</Text>
//         <View style={styles.podium}>
//           {/* Second Place */}
//           <View style={styles.podiumColumn}>
//             <Image source={{ uri: top3[1].avatar }} style={styles.podiumAvatar} />
//             <View style={styles.podiumNameBadge}>
//               <Text style={styles.podiumName} numberOfLines={1}>{top3[1].name}</Text>
//               <Text style={styles.podiumScore}>{top3[1].score} points</Text>
//             </View>
//             <View style={[styles.podiumPosition, styles.secondPlace]}>
//               <Text style={styles.podiumPositionText}>2</Text>
//             </View>
//           </View>
          
//           {/* First Place */}
//           <View style={[styles.podiumColumn, styles.firstPlaceColumn]}>
//             <Image source={{ uri: top3[0].avatar }} style={[styles.podiumAvatar, styles.firstPlaceAvatar]} />
//             <FontAwesome5 name="crown" size={24} color="#FFD700" style={styles.crownIcon} />
//             <View style={styles.podiumNameBadge}>
//               <Text style={styles.podiumName} numberOfLines={1}>{top3[0].name}</Text>
//               <Text style={styles.podiumScore}>{top3[0].score} points</Text>
//             </View>
//             <View style={[styles.podiumPosition, styles.firstPlace]}>
//               <Text style={styles.podiumPositionText}>1</Text>
//             </View>
//           </View>
          
//           {/* Third Place */}
//           <View style={styles.podiumColumn}>
//             <Image source={{ uri: top3[2].avatar }} style={styles.podiumAvatar} />
//             <View style={styles.podiumNameBadge}>
//               <Text style={styles.podiumName} numberOfLines={1}>{top3[2].name}</Text>
//               <Text style={styles.podiumScore}>{top3[2].score} points</Text>
//             </View>
//             <View style={[styles.podiumPosition, styles.thirdPlace]}>
//               <Text style={styles.podiumPositionText}>3</Text>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // Render rankers table (positions 4 and below)
//   const renderRankersTable = () => {
//     const otherRankers = topRankers.slice(3);
    
//     return (
//       <View style={styles.rankersTableContainer}>
//         <View style={styles.tableHeader}>
//           <Text style={[styles.tableHeaderText, styles.rankColumn]}>Rank</Text>
//           <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
//           <Text style={[styles.tableHeaderText, styles.countryColumn]}>Country</Text>
//         </View>
        
//         {otherRankers.map((ranker) => (
//           <View 
//             key={ranker.id} 
//             style={[
//               styles.tableRow,
//               ranker.isUser && styles.userTableRow
//             ]}
//           >
//             <Text style={[styles.tableCell, styles.rankColumn, ranker.isUser && styles.userTableCell]}>
//               {ranker.rank}
//             </Text>
//             <View style={[styles.nameCell, styles.nameColumn]}>
//               <Image source={{ uri: ranker.avatar }} style={styles.tableAvatar} />
//               <Text style={[styles.nameText, ranker.isUser && styles.userTableCell]}>
//                 {ranker.name}
//               </Text>
//             </View>
//             <View style={[styles.countryCell, styles.countryColumn]}>
//               <Text style={styles.flagText}>{ranker.flag}</Text>
//               <Text style={[styles.countryText, ranker.isUser && styles.userTableCell]}>
//                 {ranker.country}
//               </Text>
//             </View>
//           </View>
//         ))}
//       </View>
//     );
//   };

//   // Render recent scores table
//   const renderRecentScores = () => {
//     return (
//       <View style={styles.recentScoresContainer}>
//         <Text style={styles.recentScoresTitle}>Recent scores</Text>
        
//         {recentScores.map((score) => (
//           <View key={score.id} style={styles.scoreRow}>
//             <View style={styles.scoreInfo}>
//               <Text style={styles.scoreTitle} numberOfLines={1}>{score.title}</Text>
//               <Text style={styles.scoreSubject}>{score.subject}</Text>
//             </View>
//             <View style={[
//               styles.scoreValueContainer, 
//               { 
//                 backgroundColor: getScoreColor(score.score, 0.2),
//                 borderColor: getScoreColor(score.score, 1)
//               }
//             ]}>
//               <Text style={[styles.scoreValue, { color: getScoreColor(score.score, 1) }]}>
//                 {score.score}%
//               </Text>
//             </View>
//           </View>
//         ))}
//       </View>
//     );
//   };

//   // Helper function to get color based on score
//   const getScoreColor = (score, opacity = 1) => {
//     if (score >= 80) return `rgba(34, 197, 94, ${opacity})`; // Green
//     if (score >= 70) return `rgba(245, 158, 11, ${opacity})`; // Amber
//     if (score >= 60) return `rgba(249, 115, 22, ${opacity})`; // Orange
//     return `rgba(239, 68, 68, ${opacity})`; // Red
//   };

//   // Render week selector tabs
//   const renderWeekSelector = () => {
//     const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    
//     return (
//       <View style={styles.weekSelectorContainer}>
//         {weeks.map((week) => (
//           <TouchableOpacity
//             key={week}
//             style={[
//               styles.weekTab,
//               selectedWeek === week && styles.activeWeekTab
//             ]}
//             onPress={() => setSelectedWeek(week)}
//           >
//             <Text style={[
//               styles.weekTabText,
//               selectedWeek === week && styles.activeWeekTabText
//             ]}>
//               {week}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Performance Metrics</Text>
//       </View>
      
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Subject Progress Section */}
//         <View style={styles.section}>
//           {subjectData.map(renderSubjectCard)}
//           <TouchableOpacity style={styles.viewAllButton}>
//             <Text style={styles.viewAllText}>View all</Text>
//           </TouchableOpacity>
//         </View>
        
//         {/* Streak Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Streak</Text>
//           <View style={styles.streakContent}>
//             <CircularProgress 
//               percentage={78} 
//               size={120} 
//               strokeWidth={12} 
//               text="234" 
//               subtext="days"
//               goal="300"
//             />
//             <View style={styles.streakInfo}>
//               <Text style={styles.streakGoalText}>Keep it going 👍</Text>
//             </View>
//           </View>
//         </View>
        
//         {/* Assessment Score Chart */}
//         <View style={styles.card}>
//           <View style={styles.chartHeader}>
//             <Text style={styles.cardTitle}>Assessments Score Activities</Text>
//             <TouchableOpacity 
//               style={styles.timeFrameSelector}
//               onPress={() => setTimeFrame(timeFrame === 'Monthly' ? 'Weekly' : 'Monthly')}
//             >
//               <Text style={styles.timeFrameText}>{timeFrame}</Text>
//               <Ionicons name="chevron-down" size={16} color="#64748B" />
//             </TouchableOpacity>
//           </View>
          
//           <LineChart
//             data={chartData}
//             width={width - 40}
//             height={220}
//             chartConfig={{
//               backgroundColor: "#ffffff",
//               backgroundGradientFrom: "#ffffff",
//               backgroundGradientTo: "#ffffff",
//               decimalPlaces: 0,
//               color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
//               labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//               style: {
//                 borderRadius: 16
//               },
//               propsForDots: {
//                 r: "6",
//                 strokeWidth: "2",
//                 stroke: "#4169E1"
//               },
//               propsForBackgroundLines: {
//                 strokeDasharray: "",
//                 stroke: "#e3e3e3",
//               },
//               fillShadowGradient: 'rgba(65, 105, 225, 0.2)',
//               fillShadowGradientOpacity: 0.6,
//             }}
//             bezier
//             style={styles.chart}
//             withInnerLines={true}
//             withOuterLines={false}
//             withVerticalLines={false}
//             withHorizontalLines={true}
//             withVerticalLabels={true}
//             withHorizontalLabels={true}
//             fromZero={true}
//             yAxisSuffix="%"
//           />
//         </View>
        
//         {/* Week Selector */}
//         {renderWeekSelector()}
        
//         {/* CGPA Card */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total CGPA</Text>
//           <View style={styles.cgpaContent}>
//             <CircularProgress 
//               percentage={72} 
//               size={120} 
//               strokeWidth={12}  
//               text="72%" 
//             />
//             <TouchableOpacity style={styles.viewResultsButton}>
//               <Text style={styles.viewResultsText}>View results</Text>
//             </TouchableOpacity>
//           </View>
          
//           {renderRecentScores()}
//         </View>
        
//         {/* Top Rankers Section */}
//         <View style={styles.rankersCard}>
//           {renderTopThreePodium()}
//           {renderRankersTable()}
          
//           <TouchableOpacity style={styles.viewAllButton}>
//             <Text style={styles.viewAllText}>View all</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   scrollView: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E293B',
//     marginBottom: 16,
//   },
//   subjectCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   subjectHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   subjectIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   subjectInfo: {
//     flex: 1,
//   },
//   subjectTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E293B',
//   },
//   subjectSubtitle: {
//     fontSize: 12,
//     color: '#64748B',
//   },
//   subjectScore: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1E293B',
//   },
//   progressSection: {
//     marginTop: 4,
//   },
//   progressLabel: {
//     fontSize: 12,
//     color: '#64748B',
//     marginBottom: 4,
//   },
//   progressBarRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   progressBarContainer: {
//     flex: 1,
//     height: 8,
//     backgroundColor: '#E2E8F0',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   progressPercentage: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#64748B',
//     marginLeft: 8,
//     width: 30,
//     textAlign: 'right',
//   },
//   viewAllButton: {
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   viewAllText: {
//     fontSize: 14,
//     color: '#4169E1',
//     fontWeight: '500',
//   },
//   streakContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//   },
//   streakInfo: {
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   streakGoalText: {
//     fontSize: 14,
//     color: '#64748B',
//   },
//   circularTextContainer: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   circularProgressText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1E293B',
//   },
//   circularProgressSubtext: {
//     fontSize: 12,
//     color: '#64748B',
//   },
//   circularProgressGoal: {
//     fontSize: 10,
//     color: '#64748B',
//     marginTop: 4,
//   },
//   chartHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   timeFrameSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F1F5F9',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   timeFrameText: {
//     fontSize: 12,
//     color: '#64748B',
//     marginRight: 4,
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//   },
//   cgpaContent: {
//     alignItems: 'center',
//     paddingVertical: 16,
//   },
//   viewResultsButton: {
//     marginTop: 12,
//   },
//   viewResultsText: {
//     fontSize: 14,
//     color: '#4169E1',
//     fontWeight: '500',
//   },
//   recentScoresContainer: {
//     marginTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//     paddingTop: 16,
//   },
//   recentScoresTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E293B',
//     marginBottom: 12,
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   scoreInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   scoreTitle: {
//     fontSize: 14,
//     color: '#1E293B',
//     marginBottom: 2,
//   },
//   scoreSubject: {
//     fontSize: 12,
//     color: '#64748B',
//   },
//   scoreValueContainer: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 16,
//     borderWidth: 1,
//   },
//   scoreValue: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   rankersCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   podiumContainer: {
//     backgroundColor: '#1E3A8A',
//     margin: -16,
//     padding: 16,
//     paddingBottom: 80,
//     marginBottom: -40,
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//   },
//   podiumTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   podium: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//     paddingHorizontal: 10,
//   },
//   podiumColumn: {
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   firstPlaceColumn: {
//     marginTop: -20,
//   },
//   podiumAvatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     borderWidth: 2,
//     borderColor: 'white',
//   },
//   firstPlaceAvatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   crownIcon: {
//     position: 'absolute',
//     top: -15,
//     zIndex: 10,
//   },
//   podiumNameBadge: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginTop: 8,
//     marginBottom: 8,
//     alignItems: 'center',
//     maxWidth: 80,
//   },
//   podiumName: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   podiumScore: {
//     color: 'white',
//     fontSize: 10,
//     opacity: 0.8,
//   },
//   podiumPosition: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 4,
//   },
//   firstPlace: {
//     backgroundColor: '#FFD700',
//     width: 50,
//     height: 50,
//   },
//   secondPlace: {
//     backgroundColor: '#F4F4F5',
//   },
//   thirdPlace: {
//     backgroundColor: '#D97706',
//   },
//   podiumPositionText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1E293B',
//   },
//   rankersTableContainer: {
//     marginTop: 50,
//     paddingTop: 10,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8F0',
//   },
//   tableHeaderText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#64748B',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//     alignItems: 'center',
//   },
//   userTableRow: {
//     backgroundColor: '#F1F5F9',
//   },
//   tableCell: {
//     fontSize: 14,
//     color: '#1E293B',
//   },
//   userTableCell: {
//     fontWeight: '600',
//     color: '#4169E1',
//   },
//   rankColumn: {
//     width: 40,
//     textAlign: 'center',
//   },
//   nameColumn: {
//     flex: 1,
//   },
//   countryColumn: {
//     width: 80,
//     textAlign: 'right',
//   },
//   nameCell: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tableAvatar: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     marginRight: 8,
//   },
//   nameText: {
//     fontSize: 14,
//     color: '#1E293B',
//   },
//   countryCell: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
//   flagText: {
//     fontSize: 14,
//     marginRight: 4,
//   },
//   countryText: {
//     fontSize: 12,
//     color: '#64748B',
//   },
//   weekSelectorContainer: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   weekTab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   activeWeekTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#4169E1',
//   },
//   weekTabText: {
//     fontSize: 12,
//     color: '#64748B',
//   },
//   activeWeekTabText: {
//     color: '#4169E1',
//     fontWeight: '600',
//   },
// });

// export default PerformanceMetricsScreen;
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PerformanceMetricsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Metrics</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="chart-line" size={80} color="#4169E1" />
        </View>
        
        <Text style={styles.title}>Coming Soon</Text>
        
        <Text style={styles.description}>
          We're working on something amazing! Soon you'll be able to track your performance, view detailed analytics, and monitor your progress.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="chart-bar" size={24} color="#4169E1" />
            <Text style={styles.featureText}>Detailed Analytics</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="trophy" size={24} color="#4169E1" />
            <Text style={styles.featureText}>Performance Tracking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#4169E1" />
            <Text style={styles.featureText}>Progress Monitoring</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
});

export default PerformanceMetricsScreen;