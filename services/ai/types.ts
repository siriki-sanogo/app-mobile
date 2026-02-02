export interface AIResponse {
    text: string;
    source: 'online' | 'offline' | 'offline-llm' | 'offline-keywords' | 'offline-fallback' | 'offline-crisis';
    model: string;
    mood?: string;
    confidence?: number;
    actions?: { label: string; action: string; style?: 'primary' | 'secondary' }[];
}

export interface IAIProvider {
    chat(message: string, context?: string): Promise<AIResponse>;
    isAvailable(): Promise<boolean>;
}
