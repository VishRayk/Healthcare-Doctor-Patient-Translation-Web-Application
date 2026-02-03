import { useState, useEffect, useRef } from 'react';
import { Role, Message } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AudioPlayer } from './AudioPlayer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, Send, Loader2, StopCircle, Stethoscope, User } from 'lucide-react';

interface ChatInterfaceProps {
    role: Role;
    messages: Message[];
    onSendMessage: (text: string, audio?: string) => Promise<void>;
    targetLang: string;
}

export function ChatInterface({ role, messages, onSendMessage, targetLang }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { isRecording, startRecording, stopRecording } = useAudioRecorder();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setIsSending(true);
        await onSendMessage(input);
        setInput("");
        setIsSending(false);
    };

    const handleMicClick = async () => {
        if (isRecording) {
            const audioData = await stopRecording();
            if (audioData) {
                setIsSending(true);
                await onSendMessage("[Audio Message]", audioData);
                setIsSending(false);
            }
        } else {
            startRecording();
        }
    };

    const isDoctor = role === 'doctor';

    return (
        <Card className="flex flex-col h-[600px] border border-slate-200 shadow-md bg-white rounded-xl overflow-hidden">
            {/* High Contrast Header */}
            <div className={`p-4 flex items-center justify-between ${isDoctor ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        {isDoctor ? <Stethoscope className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{isDoctor ? 'Doctor' : 'Patient'}</h3>
                        <p className="text-xs opacity-90 font-medium">
                            {targetLang === 'es' ? 'Translating to Spanish' : 'Translating to English'}
                        </p>
                    </div>
                </div>
                {isRecording && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-xs font-mono">REC</span>
                    </div>
                )}
            </div>

            <CardContent className="flex-1 flex flex-col p-0 bg-slate-50 relative">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <p className="font-medium">No messages yet</p>
                        </div>
                    )}

                    {messages.map((m) => {
                        const isMe = m.role === role;
                        return (
                            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border
                            ${isMe
                                        ? (isDoctor ? 'bg-blue-100 border-blue-200 text-slate-800 rounded-tr-none' : 'bg-emerald-100 border-emerald-200 text-slate-800 rounded-tr-none')
                                        : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                                    }`}>

                                    {m.audioData && (
                                        <div className="mb-2">
                                            <AudioPlayer src={m.audioData} />
                                        </div>
                                    )}

                                    <p className="text-sm font-medium leading-relaxed">
                                        {isMe ? m.originalText : m.translatedText}
                                    </p>

                                    {!isMe && (
                                        <p className="mt-2 text-xs text-slate-500 border-t border-slate-200/50 pt-1 italic">
                                            "{m.originalText}"
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Simplified Input Area */}
                <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
                    <Button
                        onClick={handleMicClick}
                        className={`rounded-full w-10 h-10 p-0 flex-shrink-0 transition-colors ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                        variant="ghost"
                    >
                        {isRecording ? <StopCircle className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isRecording ? "Listening..." : (isDoctor ? "Type in English..." : "Escribe en Español...")}
                        onKeyDown={e => e.key === 'Enter' && !isSending && handleSend()}
                        disabled={isRecording || isSending}
                        className="flex-1 rounded-full border-slate-200 focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                    />

                    <Button
                        onClick={handleSend}
                        disabled={isSending || isRecording || !input.trim()}
                        size="icon"
                        className={`rounded-full w-10 h-10 ${isDoctor ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
