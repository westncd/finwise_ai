
import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Activity, Flame, RefreshCw, TrendingDown, Scissors, Zap
} from 'lucide-react';
import { Transaction, Budget } from '../types';
import { getFinancialAdvice } from '../services/aiService';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const totalBalance = 45200000;
  const expenses = transactions.reduce((acc, t) => {
    // Only count as expense if type is 'expense' or undefined (legacy default)
    if (t.type === 'income') return acc;
    return acc + (Number(t.amount) || 0);
  }, 0);

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'income') return acc;
    acc[t.category] = (acc[t.category] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {} as Record<string, number>);

  const topBurn = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const fetchAdvice = async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    try {
      const result = await getFinancialAdvice(transactions, budgets);
      setAdvice(result);
    } catch (e) {
      setAdvice("Lỗi kết nối Dify Agent. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [transactions]);

  const trendData = [
    { month: 'Th2', amount: 38000000 },
    { month: 'Th3', amount: 45000000 },
    { month: 'Th4', amount: 41000000 },
    { month: 'Th5', amount: 45200000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Số dư hiện tại (MySQL)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900">{(totalBalance / 1000000).toFixed(1)}M</p>
            <span className="text-[10px] font-bold text-slate-300 uppercase">VND</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Chi tiêu tháng (n8n Sync)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-rose-600">{(expenses / 1000000).toFixed(1)}M</p>
            <span className="text-[10px] font-bold text-slate-300 uppercase">VND</span>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
          <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest mb-2 relative z-10">AI Orchestrator</p>
          <p className="text-sm font-bold flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Dify Agent Ready
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-8 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Xu hướng tài sản (Metabase Feed)
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><Flame size={16} className="text-rose-500" /> Top 5 khoản đốt tiền (Superset BI)</span>
              <span className="text-[9px] font-black text-slate-300">Live from MySQL</span>
            </h3>
            <div className="space-y-4">
              {topBurn.map(([cat, amount], i) => (
                <div key={cat} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-black text-slate-700">{cat}</span>
                    <span className="text-xs font-bold text-slate-400">{amount.toLocaleString()} ₫</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-rose-500' : 'bg-indigo-500/60'}`}
                      style={{ width: `${(amount / topBurn[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="relative z-10">
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-6 flex items-center justify-between text-indigo-400">
                <span className="flex items-center gap-2"><TrendingDown size={14} /> Dify AI Advice</span>
                <button onClick={fetchAdvice} disabled={loading} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </h3>
              <div className="text-[13px] leading-relaxed font-medium text-slate-300 min-h-[180px] italic">
                {loading ? "Dify Agent đang quét MySQL..." : advice || "Thêm giao dịch để Dify phân tích."}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold shadow-lg"><Scissors size={18} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white tracking-tighter">Gợi ý tối ưu chi tiêu</p>
                  <p className="text-[9px] font-bold text-slate-500 italic">Dựa trên mô hình tiết kiệm Dify</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
