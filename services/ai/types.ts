export interface AIResponse {
    text: string;
    source: 'online' | 'offline';
    model: string;
}

export interface IAIProvider {
    chat(message: string, context?: string): Promise<AIResponse>;
    isAvailable(): Promise<boolean>;
}
