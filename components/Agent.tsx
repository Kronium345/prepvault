import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, View, Text, Animated, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

interface AgentProps {
  userName?: string;
  userId?: string;
  type?: string;
  role?: string;
  level?: string;
  techstack?: string;
}

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

// Define the role type as a literal type
type MessageRole = 'user' | 'system' | 'assistant';

// Define the message interface
interface SavedMessage {
  role: MessageRole;
  content: string;
}

const Agent = ({ userName, userId, type = 'technical', role = 'Software Developer', level = 'Mid', techstack = 'React, TypeScript, Node.js' }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle speaking animation
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    if (isSpeaking) {
      Animated.loop(pulse).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => pulseAnim.setValue(1);
  }, [isSpeaking]);

  // Handle message fade animation
  useEffect(() => {
    if (messages.length > 0) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [messages]);

  // Keep screen awake during active call
  useEffect(() => {
    if (callStatus === CallStatus.ACTIVE) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }

    return () => {
      deactivateKeepAwake();
    };
  }, [callStatus]);

  // Navigate away when call is finished
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      router.push('/home');
    }
  }, [callStatus, router]);

  // Add a message to the messages array
  const addMessage = (role: MessageRole, content: string) => {
    const newMessage: SavedMessage = { role, content };
    setMessages(prev => [...prev, newMessage]);
  };

  // Fetch interview questions using fetch instead of axios
  const fetchInterviewQuestions = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('https://prepvault-1rdj.onrender.com/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          role,
          level,
          techstack,
          amount: 5, // Number of questions
          userid: userId || 'anonymous',
        }),
      });

      // ✅ Check if the response is OK first
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.questions && Array.isArray(data.questions)) {
        // ✅ Correct real questions
        setInterviewQuestions(data.questions);
        setCallStatus(CallStatus.ACTIVE);
      } else {
        // ❌ If something is wrong, fallback to static questions
        console.warn('Server response invalid, using fallback questions.');

        const fallbackQuestions = [
          "Tell me about your experience with React and TypeScript.",
          "How do you approach debugging complex issues?",
          "Describe a challenging project you worked on recently.",
          "How do you stay updated with the latest technologies?",
          "Do you have any questions for me about the role?"
        ];

        setInterviewQuestions(fallbackQuestions);
        setCallStatus(CallStatus.ACTIVE);
      }
    } catch (error) {
      console.error('❌ Error fetching interview questions:', error);
      Alert.alert(
        'Error',
        'Failed to generate interview questions. Please try again.',
        [{ text: 'OK', onPress: () => setCallStatus(CallStatus.INACTIVE) }]
      );
    } finally {
      setIsLoading(false);
    }
  };


  // Start the interview
  const handleCallButton = async () => {
    if (callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED) {
      setCallStatus(CallStatus.CONNECTING);

      try {
        // Request audio recording permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.error('Audio recording permissions not granted');
          setCallStatus(CallStatus.INACTIVE);
          Alert.alert('Permission Required', 'Microphone permission is needed for the interview.');
          return;
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        addMessage('assistant', `Hello ${userName || 'there'}! I'll be your AI interviewer today for this ${role} position. Let's get started with some questions.`);


        // Fetch interview questions
        await fetchInterviewQuestions();
      } catch (error) {
        console.error('Error starting call:', error);
        setCallStatus(CallStatus.INACTIVE);
        Alert.alert('Error', 'Failed to start the interview. Please try again.');
      }
    }
  };

  // Ask the next interview question
  const askNextQuestion = async () => {
    if (currentQuestionIndex < interviewQuestions.length) {
      const question = interviewQuestions[currentQuestionIndex];

      // Add question to messages
      addMessage('assistant', question);

      // Speak the question
      setIsSpeaking(true);
      await Speech.speak(question, {
        onDone: () => {
          setIsSpeaking(false);
          startListening();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          startListening();
        }
      });
    } else {
      // End of interview
      const finalMessage = "Thank you for completing the interview. Your responses have been recorded. We'll now return to the home screen.";
      addMessage('assistant', finalMessage);

      setIsSpeaking(true);
      await Speech.speak(finalMessage, {
        onDone: () => {
          setIsSpeaking(false);
          setTimeout(() => setCallStatus(CallStatus.FINISHED), 2000);
        }
      });
    }
  };

  // Start listening for user's answer
  const startListening = async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);

      // For demo purposes, automatically stop recording after 10 seconds
      setTimeout(() => stopListening(), 10000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      // Move to next question if recording fails
      addMessage('user', "Sorry, I couldn't record my answer. Let's move to the next question.");
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => askNextQuestion(), 1500);
    }
  };

  // Stop listening and process the user's answer
  // Stop listening and process the user's answer
  const stopListening = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); // This would normally be used to send the audio to STT
      setRecording(null);

      // 🔵 Simulate a transcript (replace with real STT later if you want)
      const transcript = "This is a placeholder response.";

      // Add user's response to messages
      addMessage('user', transcript);

      // ✅ Analyze the user's answer using Gemini
      const feedbackResponse = await fetch('https://prepvault-1rdj.onrender.com/gemini/analyze-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: interviewQuestions[currentQuestionIndex],
          answer: transcript,
        }),
      });

      const feedbackData = await feedbackResponse.json();
      if (feedbackData.success) {
        // Add Gemini feedback as a new assistant message
        addMessage('assistant', feedbackData.feedback);
      } else {
        console.warn('Failed to get feedback:', feedbackData.error);
      }

      // Move to next question after a short delay
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => askNextQuestion(), 3000); // Slight delay to let user read feedback
    } catch (error) {
      console.error('Failed to stop recording:', error);
      addMessage('user', "Sorry, I couldn't process my answer. Let's move to the next question.");
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => askNextQuestion(), 1500);
    }
  };


  // End the interview
  const handleEndCall = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }

    Speech.stop();
    setCallStatus(CallStatus.FINISHED);
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  useEffect(() => {
    if (interviewQuestions.length > 0 && callStatus === CallStatus.ACTIVE) {
      askNextQuestion();
    }
  }, [interviewQuestions, callStatus]);

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-black`}>
        <Text style={tw`text-white text-xl font-semibold`}>Preparing Interview...</Text>
      </View>
    );
  }



  return (
    <View style={tw`flex-1 bg-black p-4`}>
      {/* Header */}
      <Text style={tw`text-white text-2xl font-semibold mb-6`}>
        Interview Generation
      </Text>

      {/* Cards Container */}
      <View style={tw`flex-row justify-between gap-4 mb-6`}>
        {/* AI Interviewer Card */}
        <View style={tw`flex-1 bg-[#1e1b4b] rounded-xl p-6 items-center`}>
          <View style={tw`flex items-center justify-center`}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Image
                source={require('../assets/ai-avatar.png')}
                style={tw`w-16 h-16`}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
          <Text style={tw`text-white text-lg mt-4`}>AI Interviewer</Text>
        </View>

        {/* User Card */}
        <View style={tw`flex-1 bg-[#1e293b] rounded-xl p-6 items-center`}>
          <Image
            source={require('../assets/user-avatar.png')}
            style={tw`w-16 h-16 rounded-full`}
            resizeMode="cover"
          />
          <Text style={tw`text-white text-lg mt-4`}>{userName || 'User'}</Text>
        </View>
      </View>

      {/* Transcript Section with Animation */}
      {messages.length > 0 && (
        <View style={tw`border border-gray-700 rounded-xl mb-6`}>
          <View style={tw`bg-[#1e1b4b]/40 p-4 rounded-xl`}>
            <Animated.Text
              style={[tw`text-white text-base`, { opacity: fadeAnim }]}
              key={latestMessage}
            >
              {latestMessage}
            </Animated.Text>
          </View>
        </View>
      )}

      {/* Call Controls */}
      <View style={tw`w-full flex items-center`}>
        {callStatus !== CallStatus.ACTIVE ? (
          <TouchableOpacity
            onPress={handleCallButton}
            disabled={isLoading}
            style={tw`${isLoading ? 'bg-gray-600' : 'bg-[#6366f1]'} py-3 px-6 rounded-lg`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>
              {isCallInactiveOrFinished
                ? 'Start Interview'
                : isLoading
                  ? 'Preparing...'
                  : 'Connecting...'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEndCall}
            style={tw`bg-red-500 py-3 px-6 rounded-lg`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>End Interview</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Agent;
