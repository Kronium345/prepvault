import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import InterviewCard from '../components/InterviewCard';
import { dummyInterviews } from '../constants';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* CTA Section */}
      <View style={styles.ctaCard}>
        <View style={styles.ctaTextContainer}>
          <Text style={styles.ctaTitle}>
            Get Interview-Ready with our AI-Powered Practice & Feedback
          </Text>
          <Text style={styles.ctaSubtitle}>
            Practice on real interview questions and get feedback on your
            performance!
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/interview')}
            style={styles.ctaButton}
            labelStyle={styles.ctaButtonText}
          >
            Start an Interview
          </Button>
        </View>

        <Image
          source={require('../assets/robot.png')}
          style={styles.robotImage}
          resizeMode="contain"
        />
      </View>

      {/* Why PrepVault Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why PrepVault?</Text>
        <Text style={styles.sectionDescription}>
          PrepVault is a platform for preparing for mock interviews. It uses AI
          to provide feedback on your performance and help you improve.
        </Text>
        <View style={styles.cardGrid}>
          {dummyInterviews.map((interview) => (
            <InterviewCard
              {...interview}
              interviewId={interview.id}
              key={interview.id}
            />
          ))}
        </View>
      </View>

      {/* Take an Interview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Take an Interview</Text>
        <View style={styles.cardGrid}>
          {dummyInterviews.map((interview) => (
            <InterviewCard
              {...interview}
              interviewId={interview.id}
              key={interview.id}
            />
          ))}
        </View>
      </View>

      {/* Bottom Navigation Button */}
      <Button
        mode="contained"
        onPress={() => router.push('/interview/interview')}
        style={styles.bottomButton}
        labelStyle={styles.bottomButtonText}
      >
        Go to Interview
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: '#0b0b0f',
  },
  ctaCard: {
    backgroundColor: '#1e1e25',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  ctaTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#c084fc',
    borderRadius: 10,
    paddingVertical: 6,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  robotImage: {
    width: 120,
    height: 120,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  cardGrid: {
    gap: 16,
  },
  bottomButton: {
    backgroundColor: '#c084fc',
    borderRadius: 10,
    marginTop: 24,
    paddingVertical: 8,
  },
  bottomButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
