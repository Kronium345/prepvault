// lib/audio-utils.ts
import { Audio } from 'expo-av';

export async function stopRecording(
  recording: Audio.Recording
): Promise<string | null> {
  try {
    await recording.stopAndUnloadAsync();
    return recording.getURI(); // You can upload this to your server
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
  }
}
