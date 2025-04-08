import Vapi from '@vapi-ai/react-native';
import { Platform } from 'react-native';

const vapiPrototype = Vapi.prototype as any;

// --- Correct patch ---
if (Platform.OS === 'android') {
    try {
        if (!vapiPrototype.nativeUtils || typeof vapiPrototype.nativeUtils !== 'function') {
            console.log('Patching Vapi.prototype: replacing missing nativeUtils function');

            vapiPrototype.nativeUtils = () => ({
                setKeepDeviceAwake: () => {
                    console.log('Dummy setKeepDeviceAwake called (patched nativeUtils)');
                },
            });
        }
    } catch (err) {
        console.warn('Could not safely patch Vapi.prototype.nativeUtils():', err);
    }
}
// --- Correct patch ends ---

const vapi = new Vapi(process.env.EXPO_PUBLIC_VAPI_API_KEY!);

export default vapi;
