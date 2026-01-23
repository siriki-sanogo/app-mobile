import NetInfo from '@react-native-community/netinfo';
import { OnlineProvider } from './OnlineProvider';
import { OfflineProvider } from './OfflineProvider';
import { IAIProvider, AIResponse } from './types';

export class AIOrchestrator {
    private onlineProvider: OnlineProvider;
    private offlineProvider: OfflineProvider;

    constructor() {
        this.onlineProvider = new OnlineProvider();
        this.offlineProvider = new OfflineProvider();
    }

    async getResponse(message: string, context?: string): Promise<AIResponse> {
        const netState = await NetInfo.fetch();
        const isConnected = netState.isConnected && netState.isInternetReachable !== false;

        console.log(`AIOrchestrator: Network Status: ${isConnected ? 'Online' : 'Offline'}`);

        if (isConnected) {
            try {
                // Try Online first
                return await this.onlineProvider.chat(message, context);
            } catch (error) {
                console.warn("Online provider failed, falling back to offline...", error);
                // Fallback to offline if server is down despite connection
                return await this.offlineProvider.chat(message, context);
            }
        } else {
            // Offline mode
            return await this.offlineProvider.chat(message, context);
        }
    }
}

export const aiService = new AIOrchestrator();
