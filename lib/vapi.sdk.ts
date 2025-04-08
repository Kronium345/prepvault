// vapi.sdk.ts
import Vapi from '@vapi-ai/react-native';

const vapi = new Vapi(process.env.EXPO_PUBLIC_VAPI_API_KEY!);

export default vapi;
