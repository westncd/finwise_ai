import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { Transaction } from '../types';

interface ForecastViewProps {
  transactions: Transaction[];
}

interface ForecastItem {
  category: string;
  predicted_amount: number;
  based_on_months: number;
}

interface RiskItem {
  type: string;
  level: string;
  message: string;
  details: any;
}

const ForecastView: React.FC<ForecastViewProps> = ({ transactions }) => {
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastRes, riskRes] = await Promise.all([
        fetch('http://localhost:5000/api/forecast'),
        fetch('http://localhost:5000/api/risk-assessment')
      ]);

      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setForecast(data.forecast || []);
      }

      if (riskRes.ok) {
        const data = await riskRes.json();
        setRisks(data.risks || []);
      }

    } catch (e) {
      console.error(e);
      setError("Không thể kết nối tới Flask Engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Run once on mount

  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 min-h-[600px]">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <TrendingUp className="text-indigo-600" /> Dự báo & Rủi ro
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Flask Engine • Moving Average • Rule-based
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-3 bg-white text-indigo-600 rounded-xl hover:shadow-lg transition-all border border-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Forecast Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <Zap size={120} className="text-indigo-600" />
          </div>

          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" /> Dự báo chi tiêu tháng tới
          </h3>

          <div className="h-[300px] w-full">
            {forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="category" type="category" width={100} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: any) => [`${value.toLocaleString()} ₫`, 'Dự báo']}
                  />
                  <Bar dataKey="predicted_amount" radius={[0, 10, 10, 0]} barSize={20}>
                    {forecast.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">
                {loading ? 'Đang tính toán...' : 'Chưa có dữ liệu dự báo'}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Risk Cards */}
        <div className="space-y-6">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" /> Phân tích Rủi ro
          </h3>

          {risks.length === 0 && !loading && (
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">An toàn tài chính</h4>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">Không phát hiện rủi ro quá hạn mức hay hóa đơn tồn đọng.</p>
              </div>
            </div>
          )}

          {risks.map((risk, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${risk.level === 'CRITICAL' ? 'bg-rose-50 border-rose-100' :
                risk.level === 'HIGH' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'
              }`}>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${risk.level === 'CRITICAL' ? 'bg-rose-200 text-rose-700' :
                    risk.level === 'HIGH' ? 'bg-orange-200 text-orange-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                  {risk.level}
                </span>
              </div>
              <p className={`text-xs font-bold relative z-10 ${risk.level === 'CRITICAL' ? 'text-rose-800' :
                  risk.level === 'HIGH' ? 'text-orange-800' : 'text-slate-700'
                }`}>
                {risk.message}
              </p>

              {/* Background Icon */}
              <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                <AlertTriangle size={80} className={
                  risk.level === 'CRITICAL' ? 'text-rose-600' :
                    risk.level === 'HIGH' ? 'text-orange-600' : 'text-slate-600'
                } />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForecastView;
