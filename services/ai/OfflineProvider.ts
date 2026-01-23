import { IAIProvider, AIResponse } from './types';

// Placeholder for Native Module imports (e.g., react-native-mlc-llm)
// import { MLCLLM } from 'react-native-mlc-llm'; 

export class OfflineProvider implements IAIProvider {
    private isModelLoaded: boolean = false;

    async isAvailable(): Promise<boolean> {
        // Check if model files are downloaded and visible
        return true;
    }

    async chat(message: string, context?: string): Promise<AIResponse> {
        console.log("OfflineProvider: Generating response locally...");

        // STUB: Here we would call the native module
        // const response = await MLCLLM.generate(message, context);

        // Simulating processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const stubResponse = "Ceci est une réponse générée en mode HORS LIGNE (Simulation). " +
            "Le modèle Phi-3 n'est pas encore intégré nativement, mais l'architecture est prête. " +
            `Contexte reçu: ${context ? "Oui" : "Non"}`;

        return {
            text: stubResponse,
            source: 'offline',
            model: 'phi-3-mini-stub'
        };
    }
}
