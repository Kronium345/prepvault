import Vapi from '@vapi-ai/react-native';
import { Platform } from 'react-native';

const vapi = new Vapi(process.env.EXPO_PUBLIC_VAPI_API_KEY!);

// --- Smarter Patch starts here ---
try {
    const anyVapi = vapi as any;

    if (
        Platform.OS === 'android' &&
        (!anyVapi.nativeUtils || typeof anyVapi.nativeUtils.setKeepDeviceAwake !== 'function')
    ) {
        console.log('Patching Vapi: disabling missing setKeepDeviceAwake for Android');
        anyVapi.nativeUtils = anyVapi.nativeUtils || {};
        anyVapi.nativeUtils.setKeepDeviceAwake = () => {
            console.log('Dummy setKeepDeviceAwake called');
        };
    }
} catch (err) {
    console.warn('Could not safely patch Vapi setKeepDeviceAwake:', err);
}
// --- Smarter Patch ends here ---

export default vapi;
