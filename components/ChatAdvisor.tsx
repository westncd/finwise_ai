
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquareQuote, Terminal } from 'lucide-react';
import { Transaction, Budget } from '../types';

interface ChatAdvisorProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const ChatAdvisor: React.FC<ChatAdvisorProps> = ({ transactions, budgets }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: "Chào bạn! Tôi là Dify Financial Advisor. Tôi đã kết nối với dữ liệu MySQL của bạn. Bạn cần tôi phân tích khoản chi nào hôm nay?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      // Import dynamically to avoid circular dependencies if any, or just use the imported function
      const { sendChatMessage } = await import('../services/aiService');

      const data = await sendChatMessage(currentInput, {
        transactions: transactions.slice(0, 50), // Increased context to 50 items
        budgets: budgets
      }, 'local-admin');

      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `❌ LỖI DIFY: ${err.message || "Không thể kết nối tới Dify Agent."}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden border-b-[8px] border-b-indigo-900">
      {/* Header */}
      <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MessageSquareQuote size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Dify AI Advisor</h3>
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              Orchestrator: Active • MySQL: Linked
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-slate-500 border border-white/5">
          Dify Workflow Engine
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-900 text-white'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`
                p-5 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm border
                ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}
              `}>
                {msg.content}
                {msg.role === 'ai' && (
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase italic">
                    <Terminal size={10} /> Powered by Dify • SQL Data Sync
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Hỏi Dify Advisor về tài chính của bạn..."
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all text-sm font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 transition-all shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAdvisor;
