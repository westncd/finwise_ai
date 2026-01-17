
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Save, CheckCircle2, ChevronRight, AlertTriangle, Lock, ShieldCheck, Database } from 'lucide-react';
import { Budget, Transaction } from '../types';
import { getBudgetSuggestions } from '../services/aiService';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
}

import BudgetDetailModal from './BudgetDetailModal';

// ... (existing imports)

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, transactions }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionData, setSuggestionData] = useState<any>(null);
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>(budgets);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    setActiveBudgets(budgets);
  }, [budgets]);

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    try {
      // Calculate Income context for AI
      const calculatedIncome = transactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + (Number(t.amount) || 0);
        return acc;
      }, 0);
      const totalIncome = calculatedIncome > 0 ? calculatedIncome : 45200000;

      const result = await getBudgetSuggestions(transactions, totalIncome);
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  const handleSubmitNewBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetLimit) return;

    // Remove dots/commas to get raw number
    const limit = parseInt(newBudgetLimit.replace(/\./g, '').replace(/,/g, ''));
    if (isNaN(limit)) {
      alert("Hạn mức phải là số!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newBudgetCategory, limit })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Lỗi khi thêm ngân sách!");
      }
    } catch (e) {
      alert("Lỗi kết nối Server!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-right-4 duration-500 relative min-h-[600px]">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Database className="text-indigo-600" /> Quản lý Ngân sách
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kiểm soát chi tiêu Flask</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
          <Sparkles size={14} /> Thêm hạn mức mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        {activeBudgets.map((b) => {
          const ratio = b.spent / b.limit;
          const isOver = ratio >= 1;
          const isWarning = ratio >= 0.8 && ratio < 1;

          return (
            <div
              key={b.category}
              onClick={() => setSelectedBudget(b)}
              className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-sm flex flex-col gap-6 group hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer ${isOver ? 'border-rose-500' : isWarning ? 'border-amber-400' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{b.category}</h4>
                  {isOver && <span className="flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-600 text-[10px] font-black rounded-lg uppercase tracking-tighter"><Lock size={12} /> Đã khóa</span>}
                  {isWarning && <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-tighter"><AlertTriangle size={12} /> n8n Warning</span>}
                  {!isOver && !isWarning && <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-tighter"><ShieldCheck size={12} /> Safe</span>}
                </div>
                <div className="text-slate-300 group-hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-full group-hover:bg-blue-50">
                  <ChevronRight size={20} />
                </div>
              </div>

              <div className="flex items-end justify-between border-b border-slate-50 pb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Giới hạn (Flask)</p>
                  <p className="text-2xl font-black text-slate-900">{b.limit.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} <span className="text-xs text-slate-300">₫</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Thực chi</p>
                  <span className={`text-xl font-black ${isOver ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-800'}`}>
                    {b.spent.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫
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

      {/* Floating AI Button */}
      <button
        onClick={handleAISuggest}
        disabled={isSuggesting}
        className="fixed bottom-10 right-10 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40 group"
      >
        {isSuggesting ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <BrainCircuit size={28} className="group-hover:text-blue-400 transition-colors" />
        )}
        <div className="absolute right-full mr-4 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Bot đề xuất ngân sách
        </div>
      </button>

      {/* AI Suggestion Overlay Results if needed - simplified for modal or toast, but let's keep simple alert for now or small overlay */}
      {suggestionData && (
        <div className="fixed bottom-28 right-10 w-80 bg-slate-900 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 z-30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-blue-400 text-xs uppercase tracking-widest">Đề xuất từ Dify</h4>
            <button onClick={() => setSuggestionData(null)}><div className="text-slate-500 hover:text-white"><CheckCircle2 size={16} /></div></button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
            {suggestionData.suggestions.map((s: any, idx: number) => (
              <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold text-white">{s.category}</p>
                  <span className="text-blue-300 text-xs font-black">{(s.suggestedLimit / 1000).toLocaleString()}K</span>
                </div>
                <p className="text-[10px] text-slate-400 italic mb-2 leading-tight">{s.reason}</p>
                <button onClick={() => applySuggestion(s.category, s.suggestedLimit)} className="w-full py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1">
                  <CheckCircle2 size={10} /> Áp dụng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Database size={24} className="text-indigo-600" /> Thêm Ngân sách Mới
            </h3>
            <form onSubmit={handleSubmitNewBudget} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Tên danh mục</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ví dụ: Du lịch, Mua sắm..."
                  value={newBudgetCategory}
                  onChange={e => setNewBudgetCategory(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Hạn mức giới hạn</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ví dụ: 5.000.000"
                  value={newBudgetLimit}
                  onChange={e => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    if (rawValue) {
                      const formatted = parseInt(rawValue).toLocaleString('vi-VN');
                      setNewBudgetLimit(formatted);
                    } else {
                      setNewBudgetLimit('');
                    }
                  }}
                  required
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  Lưu Ngân sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BudgetDetailModal
        budget={selectedBudget}
        transactions={transactions}
        onClose={() => setSelectedBudget(null)}
        onUpdateSuccess={() => {
          // Trigger a reload? Or just close for now. ideally refresh data from parent.
          // For now, close and maybe clear selected.
          setSelectedBudget(null);
          window.location.reload(); // Simple refresh to show new limit
        }}
      />
    </div>
  );
};

export default BudgetManager;
