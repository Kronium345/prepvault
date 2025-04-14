import { Platform } from 'react-native';
import type { EventEmitter } from 'events';

// Define a common interface that both implementations will share
export interface VapiInterface extends EventEmitter {
    start: (assistantId: string) => Promise<string>;
    stop: () => void;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
}

// Import the appropriate implementation based on platform
let vapi: VapiInterface;

if (Platform.OS === 'web') {
    // Use mock implementation for web
    vapi = require('./vapi.mock').default;
} else {
    // Use real implementation for native platforms
    vapi = require('./vapi.sdk').default;
}

export default vapi;