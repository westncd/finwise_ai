
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Save, CheckCircle2, ChevronRight, AlertTriangle, Lock, ShieldCheck, Database } from 'lucide-react';
import { Budget, Transaction } from '../types';
import { getBudgetSuggestions } from '../services/aiService';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, transactions }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionData, setSuggestionData] = useState<any>(null);
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>(budgets);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveBudgets(budgets);
  }, [budgets]);

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    try {
      const result = await getBudgetSuggestions(transactions);
      setSuggestionData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const applySuggestion = (category: string, limit: number) => {
    setActiveBudgets(prev => prev.map(b =>
      b.category === category ? { ...b, limit } : b
    ));
  };

  const saveToFlask = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Flask: Đã cập nhật giới hạn ngân sách mới vào MySQL!");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <Sparkles className="absolute -right-10 -top-10 w-60 h-60 text-blue-500/10 rotate-12 group-hover:scale-110 transition-transform" />
        <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20"><BrainCircuit size={28} /></div>
              Lập kế hoạch (Dify AI)
            </h2>
            <p className="mt-4 text-slate-400 font-medium leading-relaxed">
              Dify Agent phân tích dữ liệu từ Flask DB để đề xuất hạn mức. Hệ thống n8n sẽ giám sát và gửi cảnh báo tự động.
            </p>
          </div>
          <button
            onClick={handleAISuggest}
            disabled={isSuggesting}
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
          >
            {isSuggesting ? (
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : <Sparkles size={18} className="text-blue-600" />}
            {isSuggesting ? 'Dify đang phân tích...' : 'Bot đề xuất ngân sách'}
          </button>
        </div>

        {suggestionData && suggestionData.suggestions && (
          <div className="mt-10 p-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 animate-in fade-in zoom-in">
            <h4 className="font-black text-blue-400 text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Đề xuất từ Dify Orchestrator</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestionData.suggestions.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-black text-white">{s.category}: <span className="text-blue-400">{(s.suggestedLimit / 1000).toLocaleString()}K ₫</span></p>
                    <p className="text-[10px] text-slate-400 font-bold italic mt-1 leading-relaxed">"{s.reason}"</p>
                  </div>
                  <button onClick={() => applySuggestion(s.category, s.suggestedLimit)} className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-inner">
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeBudgets.map((b) => {
          const ratio = b.spent / b.limit;
          const isOver = ratio >= 1;
          const isWarning = ratio >= 0.8 && ratio < 1;

          return (
            <div key={b.category} className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-sm flex flex-col gap-6 group hover:shadow-xl transition-all ${isOver ? 'border-rose-500' : isWarning ? 'border-amber-400' : 'border-slate-100'
              }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{b.category}</h4>
                  {isOver && <span className="flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-600 text-[10px] font-black rounded-lg uppercase tracking-tighter"><Lock size={12} /> Đã khóa</span>}
                  {isWarning && <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-tighter"><AlertTriangle size={12} /> n8n Warning</span>}
                  {!isOver && !isWarning && <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-tighter"><ShieldCheck size={12} /> Safe</span>}
                </div>
                <button className="text-slate-300 hover:text-blue-600 transition-colors"><ChevronRight size={20} /></button>
              </div>

              <div className="flex items-end justify-between border-b border-slate-50 pb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Giới hạn (Flask)</p>
                  <p className="text-2xl font-black text-slate-900">{(b.limit / 1000).toLocaleString()}K <span className="text-xs text-slate-300">₫</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Thực chi</p>
                  <span className={`text-xl font-black ${isOver ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-800'}`}>
                    {(b.spent / 1000).toLocaleString('vi-VN')}K
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full shadow-lg ${isOver ? 'bg-rose-500 shadow-rose-500/20' :
                      isWarning ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'
                      }`}
                    style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                  />
                </div>
              </div>

              {isOver && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
                  <AlertTriangle size={16} /> n8n: Tự động khóa chi tiêu danh mục này!
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={saveToFlask} disabled={isSaving} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center gap-3 shadow-2xl shadow-blue-500/30 disabled:opacity-50">
          {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Database size={18} />}
          Lưu giới hạn vào MySQL
        </button>
      </div>
    </div>
  );
};

export default BudgetManager;
