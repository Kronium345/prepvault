import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, View, Text, Animated, TouchableOpacity, Alert, Platform } from 'react-native';
import tw from 'twrnc';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as FileSystem from 'expo-file-system';



// Upload the recorded audio to backend to transcribe
const uploadRecording = async (uri: string | null) => {
  if (!uri) {
    console.error('No URI provided to upload.');
    return null;
  }

  // ✅ Validate file existence with expo-file-system
  const fileInfo = await FileSystem.getInfoAsync(uri);
  console.log('📁 File exists:', fileInfo.exists, 'URI:', uri);
  if (!fileInfo.exists) {
    console.error('❌ File does not exist at:', uri);
    return null;
  }

  // Fix for iOS file URIs
  const formattedUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

  const formData = new FormData();
  const fileObj = {
    uri: formattedUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  };

  formData.append('file', fileObj as any);

  console.log('📤 File object to upload:', fileObj);

  try {
    const response = await fetch('https://prepvault-1rdj.onrender.com/gemini/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('✅ Transcription result:', data);
    return data.transcript; // ✅ return the transcript
  } catch (error) {
    console.error('Failed to upload recording:', error);
    return null;
  }
};


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
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const startListeningWeb = async () => {
    console.log('🎧 startListeningWeb() triggered');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Web Blob recorded:', file);

      const response = await fetch('https://prepvault-1rdj.onrender.com/gemini/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('✅ Web Transcription result:', data);

      if (data.transcript && data.transcript.trim() !== '') {
        addMessage('user', data.transcript);

        const feedbackRes = await fetch('https://prepvault-1rdj.onrender.com/gemini/analyze-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: interviewQuestions[currentQuestionIndex],
            answer: data.transcript,
          }),
        });

        const feedbackData = await feedbackRes.json();
        if (feedbackData.success) {
          addMessage('assistant', feedbackData.feedback);
        }
      } else {
        console.warn('⚠️ Web Transcription was empty.');
        addMessage('user', 'Sorry, I couldn’t process my answer.');
      }

      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        askNextQuestion();
      }, 10000); // Wait 5 seconds before AI feedback
    };

    mediaRecorder.start();
    console.log('🎙️ Web Recording started...');

    setTimeout(() => {
      mediaRecorder.stop();
      console.log('🛑 Web Recording stopped.');
    }, 10000);
  };


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

  const handleStartAnswering = async () => {
    setIsWaitingForAnswer(false); // Hide the button once clicked
    if (Platform.OS === 'web') {
      await startListeningWeb(); // 👈 Web-specific recorder
    } else {
      await startListening();    // 👈 Native recorder (expo-av)
    }
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
          setIsWaitingForAnswer(true);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          setIsWaitingForAnswer(true);
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
  const safelyUnloadRecording = async () => {
    if (recording) {
      try {
        console.log('Unloading previous recording...');
        await recording.stopAndUnloadAsync();
      } catch (unloadError) {
        console.warn('Previous recording already stopped or failed to unload:', unloadError);
      } finally {
        setRecording(null);
      }
    }
  };

  const startListening = async () => {
    try {
      console.log('🎧 startListening() triggered');
      // 🛡️ FULLY unload first
      await safelyUnloadRecording();
      console.log('♻️ Previous recording safely unloaded');

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2,  // 2 = MPEG_4 in Expo AV
          audioEncoder: 3,  // 3 = AAC in Expo AV
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: 127, // 127 = HIGH
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          outputFormat: 2, // 2 = MPEG4AAC
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true,
      });


      await newRecording.startAsync();
      setRecording(newRecording);

      console.log('Started new recording ✅');
      console.log('📡 Awaiting user input for 10 seconds...');

      // Auto-stop after 10 seconds
      // Cancel any existing timeout first
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }

      // Set a new timeout
      recordingTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Clearing previous timeout');
        stopListening(newRecording);
      }, 15000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      addMessage('user', "Sorry, I couldn't record my answer. Let's move to the next question.");
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => askNextQuestion(), 1500);
    }
  };




  // Stop listening and process the user's answer
  const stopListening = async (localRecording?: Audio.Recording) => {
    if (recordingTimeoutRef.current) {
      console.log('🛑 Clearing recording timeout');
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    const activeRecording = localRecording || recording;
    if (!activeRecording) {
      console.warn('❌ No active recording to stop.');
      return;
    }

    try {
      const status = await activeRecording.getStatusAsync();
      console.log('📏 Recording duration (ms):', status.durationMillis);
      if (!status.isRecording && !status.isDoneRecording) {
        console.warn('⚠️ Recording already stopped/unloaded.');
        return;
      }

      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      console.log('📂 Recorded file URI:', uri);
      setRecording(null);

      if (!uri) {
        console.warn('⚠️ No URI returned from recording.');
        return;
      }

      setIsUploading(true);
      const transcript = await uploadRecording(uri);
      setIsUploading(false);

      if (transcript && transcript.trim() !== '') {
        console.log('📝 Non-empty transcript:', transcript);
        addMessage('user', transcript);

        const feedbackRes = await fetch('https://prepvault-1rdj.onrender.com/gemini/analyze-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: interviewQuestions[currentQuestionIndex],
            answer: transcript,
          }),
        });

        const feedbackData = await feedbackRes.json();
        if (feedbackData.success) {
          addMessage('assistant', feedbackData.feedback);
        }
      } else {
        console.warn('⚠️ Transcription was empty or silent.');
        addMessage('user', 'Sorry, I couldn’t process my answer.');
      }

      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        askNextQuestion();
      }, 10000); // Wait 5 seconds before AI feedback
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      addMessage('user', 'Something went wrong during recording.');
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeout(() => askNextQuestion(), 1500);
    }
  };





  // End the interview
  const handleEndCall = async () => {
    await safelyUnloadRecording();
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

      {recording && (
        <Text style={tw`text-yellow-400 text-center mt-2`}>
          🎙️ Recording... Speak now.
        </Text>
      )}


      {isWaitingForAnswer && (
        <TouchableOpacity
          onPress={handleStartAnswering}
          style={tw`bg-green-500 py-3 px-6 rounded-lg mt-4`}
        >
          <Text style={tw`text-white text-lg font-semibold`}>Start Answering</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Agent;
