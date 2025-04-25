import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { getRandomInterviewCover } from '../lib/utils';
import DisplayTechIcons from './DisplayTechIcons';
// Updating svg imports
import CalendarIcon from '../assets/calendar.svg';
import StarIcon from '../assets/star.svg';
console.log('CalendarIcon Type:', typeof CalendarIcon); // should be 'function'
console.log('CalendarIcon:', CalendarIcon); // should not be {}
import { SvgUri } from 'react-native-svg';

// import TestIcon from '../assets/test.svg';
console.log('Interview Cover URL:', getRandomInterviewCover());





interface InterviewCardProps {
  id: string;
  userId: string;
  role: string;
  type: string;
  techstack: string[];
  level: string;
  questions: string[];
  finalized: boolean;
  createdAt: string | Date;
}

interface Feedback {
  createdAt?: string | Date;
  totalScore?: number;
  finalAssessment?: string;
}

const InterviewCard = ({
  id,
  userId,
  role,
  type,
  techstack,
  level,
  questions,
  finalized,
  createdAt,
}: InterviewCardProps) => {
  const router = useRouter();
  const feedback: Feedback | null = null as Feedback | null;


  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  const formattedDate = dayjs(feedback?.createdAt || createdAt).format(
    'DD MMM YYYY'
  );

  const handlePress = () => {
    const route = feedback
      ? `/interview/${id}/feedback`
      : `/interview/${id}/details`;
    router.push(route);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.badgeText}>{normalizedType}</Text>
        </View>
        <Image
          source={{ uri: getRandomInterviewCover() }}
          style={styles.avatar}
        />
        <Text style={styles.roleText}>{role} Interview</Text>


        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarIcon width={22} height={22} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <StarIcon width={22} height={22} />
            <Text style={styles.metaText}>
              {feedback?.totalScore ?? '---'}/100
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          {feedback?.finalAssessment || 'Interview has not been taken yet.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <DisplayTechIcons techStack={techstack} />
        <TouchableOpacity onPress={handlePress}>
          <Button mode="contained" style={styles.button}>
            {feedback ? 'View Feedback' : 'Take Interview'}
          </Button>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 360,
    minHeight: 300,
    borderRadius: 12,
    backgroundColor: '#18181b',
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 8,
    resizeMode: 'cover',
  },
  roleText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textTransform: 'capitalize',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  metaText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export default InterviewCard;
