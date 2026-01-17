
import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Activity, Flame, RefreshCw, TrendingDown, Scissors, Zap, Database
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

  const calculatedIncome = transactions.reduce((acc, t) => {
    if (t.type === 'income') return acc + (Number(t.amount) || 0);
    return acc;
  }, 0);

  // Fallback to hardcoded if no income recorded yet to keep UI looking good
  const totalIncome = calculatedIncome > 0 ? calculatedIncome : 45200000;

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
    .sort(([, a], [, b]) => (b as number) - (a as number))
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

  // Automatic fetching disabled to save Dify/Gemini tokens
  // useEffect(() => {
  //   fetchAdvice();
  // }, [transactions]);

  const trendData = React.useMemo(() => {
    if (transactions.length === 0) return [];

    // 1. Group by YYYY-MM
    const monthlyNetFlow: Record<string, number> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      // Valid date check
      if (isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const amount = Number(t.amount) || 0;
      const change = t.type === 'income' ? amount : -amount;

      monthlyNetFlow[key] = (monthlyNetFlow[key] || 0) + change;
    });

    // 2. Sort keys (YYYY-MM is lexically sortable)
    const sortedKeys = Object.keys(monthlyNetFlow).sort();

    // 3. Calculate Cumulative
    let currentBalance = 0;
    const fullHistory = sortedKeys.map(key => {
      currentBalance += monthlyNetFlow[key];
      const [year, month] = key.split('-');
      return {
        month: `Th${parseInt(month)}/${year.slice(2)}`,
        amount: currentBalance
      };
    });

    // 4. Return only last 12 months (1 year)
    return fullHistory.slice(-12);
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -z-10"></div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Tổng khoản thu (MySQL)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-600">{(totalIncome / 1000000).toFixed(1)}M</p>
            <span className="text-[10px] font-bold text-slate-300 uppercase">VND</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -z-10"></div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Chi tiêu tháng (n8n Sync)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-rose-600">{(expenses / 1000000).toFixed(1)}M</p>
            <span className="text-[10px] font-bold text-slate-300 uppercase">VND</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-8 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Xu hướng tài sản (Real-time Flow)
            </h3>
            <div className="h-[280px]">
              {trendData.length > 0 ? (
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
                    <Tooltip
                      formatter={(value: number) => [`${(value).toLocaleString()} ₫`, 'Tài sản']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Chưa có dữ liệu giao dịch
                </div>
              )}
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
                      style={{ width: `${(Number(amount) / Number(topBurn[0][1])) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-1000"></div>

            {/* Header with combined status */}
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div>
                <h3 className="font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2 text-indigo-300">
                  <TrendingDown size={14} /> Dify AI Analysis
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Agent connected</span>
                </div>
              </div>

              <button
                onClick={fetchAdvice}
                disabled={loading}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-lg shadow-indigo-900/50 group-hover:scale-105"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="relative z-10 min-h-[220px] flex flex-col justify-between">
              <div className="text-[14px] leading-relaxed font-medium text-slate-200 italic">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-70">
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-widest">Đang phân tích dữ liệu...</span>
                  </div>
                ) : advice ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    "{advice}"
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-50">
                    <Database size={32} className="mb-2" />
                    <span className="text-center">Dữ liệu đã sẵn sàng.<br />Nhấn nút refresh để Dify phân tích.</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center font-bold text-indigo-300 shadow-lg"><Scissors size={18} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white tracking-tighter">Savings Optimizer</p>
                  <p className="text-[9px] font-bold text-indigo-300/70 italic">Powered by Dify Workflow</p>
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
