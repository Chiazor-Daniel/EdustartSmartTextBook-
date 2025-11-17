"use client";

import type { DiagnosticResults } from "@/services/api";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SuccessScreen({
  results,
  onContinue,
}: {
  results: DiagnosticResults;
  onContinue?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate celebration
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getRewardEmoji = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return "🥇";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      default:
        return "🎁";
    }
  };

  const getRewardColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return "#F59E0B";
      case "silver":
        return "#94A3B8";
      case "bronze":
        return "#CD7F32";
      default:
        return "#4B7FD1";
    }
  };

  const accuracyPercentage = Math.round(results.accuracy * 100);
  const rewardColor = getRewardColor(results.reward.tier);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.rewardCircle, { borderColor: rewardColor }]}>
            <Text style={styles.rewardEmoji}>
              {getRewardEmoji(results.reward.tier)}
            </Text>
          </View>
          <Text style={styles.title}>Congratulations! 🎉</Text>
          <Text style={styles.subtitle}>{results.reward.message}</Text>
        </Animated.View>

        {/* Overall Score */}
        <Animated.View
          style={[
            styles.scoreCard,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.scoreLabel}>Your Overall Score</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{accuracyPercentage}%</Text>
            </View>
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreText}>
                {results.total_correct} out of {results.total_questions} correct
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Subject Breakdown */}
        <Animated.View
          style={[
            styles.breakdownSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Subject Performance</Text>
          {Object.entries(results.subject_breakdown).map(
            ([subject, breakdown]) => {
              const subjectAccuracy = Math.round(breakdown.accuracy * 100);
              return (
                <View key={subject} style={styles.subjectCard}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectName}>{subject}</Text>
                    <Text style={styles.subjectScore}>
                      {subjectAccuracy}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${subjectAccuracy}%`,
                          backgroundColor:
                            subjectAccuracy >= 70
                              ? "#10B981"
                              : subjectAccuracy >= 50
                              ? "#F59E0B"
                              : "#EF4444",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.subjectStats}>
                    {breakdown.correct}/{breakdown.total_questions} questions
                    correct
                  </Text>
                  {breakdown.recommendation && (
                    <View style={styles.recommendationBox}>
                      <Text style={styles.recommendationLabel}>💡 Tip:</Text>
                      <Text style={styles.recommendationText}>
                        {breakdown.recommendation}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  rewardCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#4B7FD1",
  },
  scorePercentage: {
    fontSize: 36,
    fontWeight: "700",
    color: "#4B7FD1",
  },
  scoreDetails: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  breakdownSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  subjectScore: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B7FD1",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  subjectStats: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  recommendationBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  recommendationLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#4B7FD1",
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    shadowColor: "#4B7FD1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
