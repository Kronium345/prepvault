import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, View, Text, Animated, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

interface AgentProps {
  userName?: string;
  userId?: string;
  type?: string;
}

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };

        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log('Error', error);

    // vapi.on('call-start', onCallStart);
    // vapi.on('call-end', onCallEnd);
    // vapi.on('message', onMessage);
    // vapi.on('speech-start', onSpeechStart);
    // vapi.on('speech-end', onSpeechEnd);
    // vapi.on('error', onError);

    // return () => {
    //   vapi.off('call-start', onCallStart);
    //   vapi.off('call-end', onCallEnd);
    //   vapi.off('message', onMessage);
    //   vapi.off('speech-start', onSpeechStart);
    //   vapi.off('speech-end', onSpeechEnd);
    //   vapi.off('error', onError);
    // }
  }, []);

  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);


  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) router.push('/home');
  }, [messages, callStatus, type, userId]);

  // const messages = [
  //   'What is your name?',
  //   'My name is John Doe. Nice to meet you.',
  // ];

  const lastMessage = messages[messages.length - 1];
  const [callId, setCallId] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    }

    return () => pulseAnim.setValue(1);
  }, [isSpeaking]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => fadeAnim.setValue(0);
  }, [lastMessage]);

  const handleCallButton = async () => {
    if (
      callStatus === CallStatus.INACTIVE ||
      callStatus === CallStatus.FINISHED
    ) {
      setCallStatus(CallStatus.CONNECTING);
      try {
        const response = await fetch(
          'https://prepvault-1rdj.onrender.com/vapi/start-call',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              assistant_id: process.env.EXPO_PUBLIC_VAPI_ASSISTANT_ID,
              type,
              user_name: userName,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setCallStatus(CallStatus.ACTIVE);
          setCallId(data.call?.id);
        } else {
          console.error('Call failed:', data.message);
          setCallStatus(CallStatus.FINISHED);
        }
      } catch (error) {
        console.error('Error starting call:', error);
        setCallStatus(CallStatus.FINISHED);
      }
    }
  };

  const handleEndCall = async () => {
    setCallStatus(CallStatus.FINISHED);

    try {
      const response = await fetch(
        'https://prepvault-1rdj.onrender.com/vapi/end',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            call_id: callId, // 👈 replace this with the actual call ID from your backend if you’re storing it
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        console.warn('Call did not end properly:', data.message);
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

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
                source={require('../public/ai-avatar.png')}
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
            source={require('../public/user-avatar.png')}
            style={tw`w-16 h-16 rounded-full`}
            resizeMode="cover"
          />
          <Text style={tw`text-white text-lg mt-4`}>{userName}</Text>
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
            style={tw`bg-[#6366f1] py-3 px-6 rounded-lg`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>
              {isCallInactiveOrFinished
                ? 'Call'
                : '. . .'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEndCall}
            style={tw`bg-red-500 py-3 px-6 rounded-lg`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>End</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Agent;
