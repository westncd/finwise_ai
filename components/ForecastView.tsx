
import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Sparkles, RefreshCw, AlertTriangle, Target } from 'lucide-react';
import { Transaction } from '../types';
import { forecastSpending } from '../services/aiService';

interface ForecastViewProps {
  transactions: Transaction[];
}

const ForecastView: React.FC<ForecastViewProps> = ({ transactions }) => {
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const result = await forecastSpending(transactions);
      if (result) {
        setForecastData(result.predictions);
        setAnalysis({
          balance: result.forecastBalance,
          risks: result.riskFactors,
          recommendations: result.recommendations
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) fetchForecast();
  }, [transactions]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" /> Dify AI Forecast (3 Tháng tới)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">Dựa trên dữ liệu Flask + n8n thực tế</p>
          </div>
          <button onClick={fetchForecast} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:text-indigo-600 transition-all border border-slate-100">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="projectedExpense" barSize={40} radius={[10, 10, 10, 10]} fill="#6366f1" fillOpacity={0.2} />
              <Line type="monotone" dataKey="projectedBalance" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-[10px] border-l-rose-500">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" /> Cảnh báo từ Dify
          </h4>
          <div className="space-y-3">
            {analysis?.risks?.map((risk: string, i: number) => (
              <div key={i} className="p-3 bg-rose-50 rounded-xl text-[11px] font-bold text-slate-700 border border-rose-100">{risk}</div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-[10px] border-l-emerald-500">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target size={16} className="text-emerald-500" /> Đề xuất tối ưu
          </h4>
          <div className="space-y-3">
            {analysis?.recommendations?.map((rec: string, i: number) => (
              <div key={i} className="p-3 bg-emerald-50 rounded-xl text-[11px] font-bold text-slate-700 border border-emerald-100">{rec}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastView;
