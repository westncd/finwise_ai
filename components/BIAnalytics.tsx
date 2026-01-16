
import React, { useState } from 'react';
import {
  BarChart3, DatabaseZap, ExternalLink, ShieldCheck,
  Layers, Filter, Maximize2, RefreshCw, Cpu, Globe
} from 'lucide-react';

interface BIAnalyticsProps {
  type: 'metabase' | 'superset';
}

const BIAnalytics: React.FC<BIAnalyticsProps> = ({ type }) => {
  const [loading, setLoading] = useState(false);

  const [customUrl, setCustomUrl] = useState('');

  // Link mặc định hoặc link user nhập
  const activeUrl = customUrl || (type === 'metabase' ? "http://localhost:3001/public/dashboard/622f0785-8c37-4bea-bc66-218e8b21fa6d" : "http://localhost:8088/...");

  const embedUrls = {
    metabase: "http://localhost:3001/public/dashboard/622f0785-8c37-4bea-bc66-218e8b21fa6d",
    superset: "http://localhost:8088/superset/dashboard/your-id-here/?standalone=true"
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Info Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${type === 'metabase' ? 'bg-blue-500' : 'bg-indigo-600'} text-white shadow-lg`}>
            {type === 'metabase' ? <BarChart3 size={24} /> : <DatabaseZap size={24} />}
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">
              {type === 'metabase' ? 'Metabase Analytics' : 'Superset Enterprise BI'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                <ShieldCheck size={10} /> SQL Connection: Secure
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase italic">• MySQL (XAMPP) Instance</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleRefresh} className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
            <Maximize2 size={16} /> Full View
          </button>
        </div>
      </div>

      {/* BI Embed Container */}
      <div className="relative bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden h-[700px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Connecting to {type === 'metabase' ? 'Metabase' : 'Superset'} Engine...</p>
          </div>
        )}

        <div className="w-full h-full flex flex-col">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Dán Public Link của Metabase Dashboard hoặc Question vào đây..."
                className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-indigo-500 font-black text-[9px] uppercase tracking-widest cursor-pointer hover:text-indigo-700" onClick={() => window.open(activeUrl, '_blank')}>
              <ExternalLink size={12} /> Open in {type}
            </div>
          </div>

          <iframe
            src={activeUrl}
            className="w-full flex-1 border-0"
            title="BI Analytics Dashboard"
            allowTransparency
          />
        </div>
      </div>

      {/* Control Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Globe size={14} /> Global Filters</p>
            <h5 className="font-bold text-lg">Đồng bộ bộ lọc liên thông</h5>
            <p className="text-slate-500 text-xs mt-1 font-medium italic">Áp dụng filter từ App vào iframe Dashboard.</p>
          </div>
          <Cpu className="text-white/5 absolute -right-4 -bottom-4 w-32 h-32 group-hover:scale-110 transition-transform" />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Layers size={14} /> SQL Lab Access</p>
            <h5 className="font-bold text-lg text-slate-800">Truy vấn SQL Trực tiếp</h5>
            <p className="text-slate-400 text-xs mt-1 font-medium italic">Dành cho chuyên viên phân tích dữ liệu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIAnalytics;
