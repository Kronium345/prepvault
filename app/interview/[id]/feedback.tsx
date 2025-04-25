import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import tw from 'twrnc';

interface CategoryScore {
    name: string;
    score: number;
    comment: string;
}

interface FeedbackData {
    totalScore: number;
    categoryScores: CategoryScore[];
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
}

interface Feedback extends FeedbackData {
    // Add any additional properties specific to the Feedback interface
}

const FeedbackPage = () => {
    const { id } = useLocalSearchParams();
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await fetch(`https://prepvault-1rdj.onrender.com/feedback/${id}`);
                const data = await response.json();
                if (data.success) {
                    setFeedback(data.feedback);
                } else {
                    console.error('Failed to fetch feedback:', data.message);
                }
            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFeedback();
        }
    }, [id]);

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-black`}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={tw`text-white mt-4`}>Loading Feedback...</Text>
            </View>
        );
    }

    if (!feedback) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-black`}>
                <Text style={tw`text-red-500`}>Failed to load feedback.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={tw`flex-1 bg-black p-4`}>
            <Text style={tw`text-white text-2xl font-bold mb-4`}>Interview Feedback</Text>

            <Text style={tw`text-white mb-2`}>Total Score: {feedback.totalScore}</Text>

            <Text style={tw`text-white font-bold mb-2`}>Category Scores:</Text>
            {feedback.categoryScores.map((category, index) => (
                <View key={index} style={tw`mb-2`}>
                    <Text style={tw`text-white`}>{category.name}: {category.score}</Text>
                    <Text style={tw`text-gray-400`}>{category.comment}</Text>
                </View>
            ))}

            <Text style={tw`text-white font-bold mt-4 mb-2`}>Strengths:</Text>
            {feedback.strengths.map((strength, index) => (
                <Text key={index} style={tw`text-white`}>• {strength}</Text>
            ))}

            <Text style={tw`text-white font-bold mt-4 mb-2`}>Areas for Improvement:</Text>
            {feedback.areasForImprovement.map((area, index) => (
                <Text key={index} style={tw`text-white`}>• {area}</Text>
            ))}

            <Text style={tw`text-white font-bold mt-4 mb-2`}>Final Assessment:</Text>
            <Text style={tw`text-white`}>{feedback.finalAssessment}</Text>
        </ScrollView>
    );
};

export default FeedbackPage;
