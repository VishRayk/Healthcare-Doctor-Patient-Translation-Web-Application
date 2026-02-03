"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { StorageService } from "@/lib/storage";
import { ChatInterface } from "@/components/ChatInterface";
import { Conversation, Message, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Search, Sparkles, Activity, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Home() {
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [summary, setSummary] = useState("");
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    // Load initial data
    useEffect(() => {
        const loaded = StorageService.getConversations();
        setConversations(loaded);
        if (loaded.length > 0) {
            loadConversation(loaded[0]);
        } else {
            createNewConversation();
        }
    }, []);

    const loadConversation = (conv: Conversation) => {
        setActiveConversation(conv);
        const msgs = StorageService.getMessages(conv.id);
        setMessages(msgs);
        setSummary(conv.summary || "");
    };

    const createNewConversation = () => {
        const newConv = StorageService.createConversation();
        setConversations(prev => [newConv, ...prev]);
        loadConversation(newConv);
    };

    const handleSendMessage = async (text: string, role: Role, audioData?: string) => {
        if (!activeConversation) return;

        const targetLang = role === 'doctor' ? 'es' : 'en';
        const sourceLang = role === 'doctor' ? 'en' : 'es';

        let translatedText = "Applying medical translation...";

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang })
            });
            const data = await res.json();
            if (data.translatedText) {
                translatedText = data.translatedText;
            } else if (data.error) {
                translatedText = `Error: ${data.error}`;
            }
        } catch (e) {
            console.error("Translation failed", e);
            translatedText = "Connection Error";
        }

        const newMessage: Omit<Message, 'id' | 'conversationId' | 'createdAt'> = {
            role,
            originalText: text,
            translatedText,
            originalLang: sourceLang,
            targetLang,
            audioData
        };

        const savedMsg = StorageService.addMessage(activeConversation.id, newMessage);
        setMessages(prev => [...prev, savedMsg]);
        setConversations(StorageService.getConversations());
    };

    const generateSummary = async () => {
        if (!activeConversation) return;
        setIsGeneratingSummary(true);

        const conversationText = messages.map(m => `${m.role}: ${m.originalText}`).join('\n');

        try {
            const res = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: conversationText })
            });
            const data = await res.json();
            if (data.summary) {
                setSummary(data.summary);
                StorageService.updateConversationSummary(activeConversation.id, data.summary);
                setConversations(StorageService.getConversations());
            }
        } catch (e) {
            console.error("Summary failed", e);
            alert("Failed to generate summary");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.id.includes(searchQuery) ||
        (c.summary && c.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <main className="min-h-screen flex flex-col md:flex-row bg-slate-50">

            {/* Simple Sidebar */}
            <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-[300px] md:h-screen z-10">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="font-bold text-xl text-slate-800">MediTrans</h1>
                        </div>
                        <Button variant="outline" size="icon" onClick={createNewConversation} className="rounded-full h-8 w-8">
                            <PlusCircle className="h-5 w-5 text-blue-600" />
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search history..."
                            className="pl-9 bg-slate-50 border-slate-200 rounded-lg h-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredConversations.map(c => (
                        <div
                            key={c.id}
                            onClick={() => loadConversation(c)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border
                        ${activeConversation?.id === c.id
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold text-xs uppercase tracking-wide ${activeConversation?.id === c.id ? 'text-blue-700' : 'text-slate-500'}`}>
                                    Visit {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-sm truncate font-medium ${activeConversation?.id === c.id ? 'text-slate-800' : 'text-slate-600'}`}>
                                {c.summary || c.lastMessage || "New consultation"}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 text-xs text-center text-slate-400">
                    v1.0.0 • Secure Local Storage
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Simple Header */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Translation Session
                    </h2>
                    <div className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500 font-medium">
                        Gemini 1.5 Flash
                    </div>
                </header>

                {/* Split Screen Chat */}
                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto bg-slate-50/50">
                    {activeConversation ? (
                        <>
                            <div className="h-full flex flex-col">
                                {/* Doctor Column Header */}
                                <div className="mb-2 flex items-center justify-between px-1">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">👨‍⚕️ Doctor</h3>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200">Input: English</span>
                                </div>
                                <ChatInterface
                                    role="doctor"
                                    targetLang="es"
                                    messages={messages}
                                    onSendMessage={(text, audio) => handleSendMessage(text, 'doctor', audio)}
                                />
                            </div>
                            <div className="h-full flex flex-col">
                                {/* Patient Column Header */}
                                <div className="mb-2 flex items-center justify-between px-1">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">👤 Patient</h3>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">Input: Spanish</span>
                                </div>
                                <ChatInterface
                                    role="patient"
                                    targetLang="en"
                                    messages={messages}
                                    onSendMessage={(text, audio) => handleSendMessage(text, 'patient', audio)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2 flex flex-col items-center justify-center text-slate-300 space-y-4">
                            <Activity className="h-16 w-16 opacity-20" />
                            <p className="text-xl font-medium text-slate-400">Select a patient to begin</p>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                {activeConversation && (
                    <div className="bg-white border-t border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Medical Summary
                            </h2>
                            <Button
                                size="sm"
                                onClick={generateSummary}
                                disabled={isGeneratingSummary || messages.length === 0}
                                className="bg-slate-800 hover:bg-slate-700 text-white"
                            >
                                {isGeneratingSummary ? (
                                    <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Generating...</span>
                                ) : "Generate Summary"}
                            </Button>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 min-h-[80px]">
                            {summary ? (
                                <div className="prose prose-sm max-w-none text-slate-700">
                                    <pre className="whitespace-pre-wrap font-sans text-sm">
                                        {summary}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">
                                    Conversational analysis will appear here...
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
