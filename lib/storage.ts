import { Conversation, Message } from './types';
import { v4 as uuidv4 } from 'uuid';

const CONVERSATIONS_KEY = 'healthcare_app_conversations';
const MESSAGES_KEY_PREFIX = 'healthcare_app_messages_';

export const StorageService = {
    getConversations: (): Conversation[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(CONVERSATIONS_KEY);
        return data ? JSON.parse(data) : [];
    },

    createConversation: (): Conversation => {
        const conversations = StorageService.getConversations();
        const newConv: Conversation = {
            id: uuidv4(),
            doctorName: 'Dr. Smith', // Placeholder
            patientName: 'Patient',   // Placeholder
            createdAt: Date.now(),
        };
        // Add to beginning
        conversations.unshift(newConv);
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        return newConv;
    },

    updateConversationSummary: (id: string, summary: string) => {
        const conversations = StorageService.getConversations();
        const index = conversations.findIndex(c => c.id === id);
        if (index !== -1) {
            conversations[index].summary = summary;
            localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        }
    },

    getMessages: (conversationId: string): Message[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(MESSAGES_KEY_PREFIX + conversationId);
        return data ? JSON.parse(data) : [];
    },

    addMessage: (conversationId: string, message: Omit<Message, 'id' | 'conversationId' | 'createdAt'>): Message => {
        const messages = StorageService.getMessages(conversationId);
        const newMessage: Message = {
            ...message,
            id: uuidv4(),
            conversationId,
            createdAt: Date.now(),
        };
        messages.push(newMessage);
        localStorage.setItem(MESSAGES_KEY_PREFIX + conversationId, JSON.stringify(messages));

        // Update last message in conversation list
        const conversations = StorageService.getConversations();
        const convIndex = conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
            conversations[convIndex].lastMessage = message.originalText;
            // Move to top
            const [updatedConv] = conversations.splice(convIndex, 1);
            conversations.unshift(updatedConv);
            localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        }

        return newMessage;
    }
};
