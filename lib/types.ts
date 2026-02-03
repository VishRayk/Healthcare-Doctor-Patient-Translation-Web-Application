export type Role = 'doctor' | 'patient';

export interface Message {
    id: string;
    conversationId: string;
    role: Role;
    originalText: string;
    translatedText: string;
    originalLang: string;
    targetLang: string;
    audioData?: string; // Base64 string for audio persistence
    createdAt: number;
}

export interface Conversation {
    id: string;
    doctorName: string;
    patientName: string;
    lastMessage?: string;
    summary?: string;
    createdAt: number;
}
