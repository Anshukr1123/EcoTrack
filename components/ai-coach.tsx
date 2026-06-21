'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { ActivityType, ActivityLog, EMISSION_FACTORS, generateId } from '@/lib/ecotrack';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  activity?: {
    type: ActivityType;
    amount: number;
    logged?: boolean;
  };
};

/**
 * Props for the AiCoach component.
 */
interface AiCoachProps {
  /** Callback to log a newly parsed activity into the user's dashboard */
  onAddActivity: (activity: ActivityLog) => void;
}

/**
 * AiCoach provides an interactive AI chatbot experience using Gemini.
 * It suggests responses, answers sustainability questions, and extracts loggable activities.
 */
export default function AiCoach({ onAddActivity }: AiCoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your **EcoCoach**. You can type details about your day like *'I drove 15 km today'* or ask me questions about reducing your carbon footprint. I can help log your activities automatically!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText }),
      });

      const data = await res.json();
      if (data.text) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.text,
            activity: data.activity ? { ...data.activity, logged: false } : undefined,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: "Sorry, I couldn't process that right now. Could you try again?" },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogActivity = (index: number, activity: { type: ActivityType; amount: number }) => {
    const factorDetails = EMISSION_FACTORS[activity.type];
    if (!factorDetails) return;

    const co2 = activity.amount * factorDetails.factor;
    const pointsEarned =
      factorDetails.pointsMultiplier !== 0 ? Math.round(activity.amount * factorDetails.pointsMultiplier) : 0;

    const log: ActivityLog = {
      id: generateId(),
      type: activity.type,
      amount: activity.amount,
      co2,
      date: new Date().toISOString(),
      pointsEarned,
    };

    onAddActivity(log);

    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index && msg.activity
          ? {
              ...msg,
              activity: { ...msg.activity, logged: true },
            }
          : msg
      )
    );
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-120px)] border border-slate-800">
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center gap-3 shrink-0">
        <div className="bg-emerald-500 p-2 rounded-lg text-slate-900">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Sustainability Coach</h2>
          <p className="text-xs text-slate-400">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-slate-750 text-slate-350' : 'bg-emerald-500/20 text-emerald-450'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="flex flex-col max-w-[80%]">
              <div
                className={`p-3.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white rounded-tr-none'
                    : 'bg-slate-850 text-slate-200 rounded-tl-none leading-relaxed'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none prose-p:leading-snug prose-p:mt-0 prose-p:mb-2 last:prose-p:mb-0 prose-ul:my-1 prose-li:my-0.5">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>

              {/* Parsed Activity Card */}
              {msg.activity && (
                <div className="mt-2 bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl flex items-center justify-between text-xs gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-semibold tracking-wider uppercase text-[9px]">
                      Activity Detected
                    </span>
                    <span className="font-bold text-emerald-400 capitalize">
                      {EMISSION_FACTORS[msg.activity.type]?.label || msg.activity.type}:{' '}
                      {msg.activity.amount} {EMISSION_FACTORS[msg.activity.type]?.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => handleLogActivity(i, msg.activity!)}
                    disabled={msg.activity.logged}
                    aria-label={
                      msg.activity.logged
                        ? `Logged: ${EMISSION_FACTORS[msg.activity.type]?.label || msg.activity.type} ${msg.activity.amount} ${EMISSION_FACTORS[msg.activity.type]?.unit}`
                        : `Log detected activity: ${EMISSION_FACTORS[msg.activity.type]?.label || msg.activity.type} ${msg.activity.amount} ${EMISSION_FACTORS[msg.activity.type]?.unit}`
                    }
                    className={`px-3 py-2 rounded-lg font-bold tracking-tight transition-all shrink-0 ${
                      msg.activity.logged
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-102 active:scale-98 shadow-md shadow-emerald-950/20'
                    }`}
                  >
                    {msg.activity.logged ? 'Logged ✓' : 'Log Activity'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-850 text-slate-400 rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border-t border-slate-800 p-4 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or log ('I biked 10 km')..."
            aria-label="Ask your sustainability coach or describe an activity to log"
            className="w-full bg-slate-850 text-white placeholder-slate-500 border border-slate-700/80 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message to Eco Coach"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-slate-950 rounded-full hover:bg-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
