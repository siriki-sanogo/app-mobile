import axios from 'axios';
import { IAIProvider, AIResponse } from './types';
import { API_URL } from '../../constants/config';

export class OnlineProvider implements IAIProvider {
    async isAvailable(): Promise<boolean> {
        return true; // We rely on Orchestrator to check NetInfo
    }

    async chat(message: string, context?: string): Promise<AIResponse> {
        // Construct the prompt with context (RAG)
        const systemPrompt = context
            ? `Tu es un assistant bienveillant. Utilise ce contexte pour répondre: ${context}`
            : "Tu es un assistant bienveillant capable d'analyser l'humeur et de proposer du contenu positif.";

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];

        try {
            // Assuming user authentication token is handled via axios interceptors or similar global config
            // If not, we might need to pass headers. For now, basic implementation.
            const response = await axios.post(`${API_URL}/ai/chat`, {
                messages: messages,
                model: "llama3-8b-8192"
            });

            return {
                text: response.data.response,
                source: 'online',
                model: response.data.model_used
            };
        } catch (error) {
            console.error("OnlineProvider Error:", error);
            throw error;
        }
    }
}
