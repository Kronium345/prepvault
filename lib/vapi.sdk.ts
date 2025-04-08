// vapi.sdk.ts
import Vapi from '@vapi-ai/react-native';
import { Platform } from 'react-native';

const vapi = new Vapi(process.env.EXPO_PUBLIC_VAPI_API_KEY!);

// --- Patch starts here ---
if (Platform.OS === 'android') {
    try {
        const anyVapi = vapi as any; // <--- add this
        if (anyVapi.nativeUtils?.setKeepDeviceAwake) {
            anyVapi.nativeUtils.setKeepDeviceAwake = () => {
                console.log('Prevented crash: disabled setKeepDeviceAwake on Android');
            };
        }
    } catch (err) {
        console.warn('Could not patch Vapi setKeepDeviceAwake:', err);
    }
}
// --- Patch ends here ---

export default vapi;
