// components/AudioRecorderButton.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { recordAudio } from '../lib/audio-utils/audio'; // adjust path if needed
import { stopRecording } from '../lib/audio-utils/audio-controller';
import tw from 'twrnc';

const AudioRecorderButton = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);

      if (recording) {
        // Stop recording
        const uri = await stopRecording(recording);
        setRecording(null);
        console.log('Recording saved at:', uri);
      } else {
        // Start recording
        const newRecording = await recordAudio();
        setRecording(newRecording);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Recording error:', err);
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`items-center mt-4`}>
      <TouchableOpacity
        style={tw`bg-purple-600 px-6 py-3 rounded-xl`}
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-white font-bold`}>
            {recording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AudioRecorderButton;
