import { EventEmitter } from 'events';
import { VapiInterface } from './vapi';

// Mock implementation of Vapi SDK
class VapiMock extends EventEmitter implements VapiInterface {
    private isCallActive = false;
    private isSpeaking = false;
    private mockConversation = [
        { role: 'assistant', content: "Hello! I'm your AI interviewer today. Could you introduce yourself?" },
        { role: 'user', content: "Hi, I'm a software developer with 5 years of experience." },
        { role: 'assistant', content: "Great to meet you! Can you tell me about your experience with React Native?" },
        { role: 'user', content: "I've been working with React Native for about 3 years now, building cross-platform mobile applications." },
        { role: 'assistant', content: "That's impressive! What's the most challenging project you've worked on?" },
        { role: 'user', content: "I built a real-time collaboration tool that synchronized data across multiple devices." },
        { role: 'assistant', content: "Interesting! How did you handle state management in that project?" },
    ];

    private messageIndex = 0;
    private messageTimer: NodeJS.Timeout | null = null;

    constructor(apiKey: string) {
        super();
        console.log('VapiMock initialized with API key:', apiKey);
    }

    async start(assistantId: string): Promise<string> {
        console.log('Starting mock call with assistant ID:', assistantId);
        this.isCallActive = true;

        // Simulate call start after a short delay
        setTimeout(() => {
            this.emit('call-start');
            this.simulateConversation();
        }, 1000);

        return 'mock-call-id-123456';
    }

    stop(): void {
        console.log('Stopping mock call');
        this.isCallActive = false;
        if (this.messageTimer) {
            clearTimeout(this.messageTimer);
            this.messageTimer = null;
        }
        this.emit('call-end');
    }

    private simulateConversation() {
        if (!this.isCallActive) return;

        const nextMessage = this.mockConversation[this.messageIndex % this.mockConversation.length];

        if (nextMessage.role === 'assistant') {
            // Simulate assistant speaking
            this.emit('speech-start');
            this.isSpeaking = true;

            // Send transcript message
            this.emit('message', {
                type: 'transcript',
                role: 'assistant',
                transcriptType: 'final',
                transcript: nextMessage.content
            });

            // End speech after a delay proportional to message length
            const speakingTime = Math.min(1000 + nextMessage.content.length * 50, 5000);
            setTimeout(() => {
                this.isSpeaking = false;
                this.emit('speech-end');

                // Schedule next message after a pause
                this.messageTimer = setTimeout(() => {
                    this.messageIndex++;
                    this.simulateConversation();
                }, 2000);
            }, speakingTime);
        } else {
            // Simulate user speaking
            setTimeout(() => {
                this.emit('message', {
                    type: 'transcript',
                    role: 'user',
                    transcriptType: 'final',
                    transcript: nextMessage.content
                });

                // Schedule next message
                this.messageTimer = setTimeout(() => {
                    this.messageIndex++;
                    this.simulateConversation();
                }, 1500);
            }, 1000);
        }
    }

    // Mock event handlers (these are already implemented by extending EventEmitter)
    on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    off(event: string, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }
}

// Create and export a singleton instance
const vapi: VapiInterface = new VapiMock(process.env.EXPO_PUBLIC_VAPI_API_KEY || 'mock-api-key');

export default vapi;
