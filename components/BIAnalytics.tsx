
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

  // Giả định URL nhúng từ local/cloud services
  const embedUrls = {
    metabase: "http://localhost:3000/public/dashboard/your-uuid-here",
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
      <div className="relative bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden min-h-[700px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Connecting to {type === 'metabase' ? 'Metabase' : 'Superset'} Engine...</p>
          </div>
        )}
        
        {/* Placeholder UI - Trong thực tế sẽ dùng <iframe> */}
        <div className="w-full h-full flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
             <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm italic cursor-pointer"><Filter size={12} /> Time: Last 30 Days</div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-sm italic cursor-pointer"><Layers size={12} /> Group By: Category</div>
             </div>
             <div className="flex items-center gap-2 text-indigo-500 font-black text-[9px] uppercase tracking-widest">
                <ExternalLink size={12} /> Open in {type}
             </div>
          </div>
          
          <div className="flex-1 p-10 bg-slate-50 flex flex-col items-center justify-center text-center space-y-6">
            <div className={`p-10 rounded-[3rem] ${type === 'metabase' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'} animate-pulse`}>
               {type === 'metabase' ? <BarChart3 size={80} /> : <DatabaseZap size={80} />}
            </div>
            <div className="max-w-md">
              <h4 className="text-xl font-black text-slate-800 mb-2">Nhúng Dashboard BI Thực Tế</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                {type === 'metabase' 
                  ? "Metabase hiển thị các biểu đồ chi tiêu MoMo & Ngân hàng qua giao diện trực quan, không cần code SQL." 
                  : "Superset cung cấp khả năng phân tích nâng cao, Slice & Dice dữ liệu từ MySQL XAMPP với hiệu năng cao."}
              </p>
            </div>
            <div className="pt-6 grid grid-cols-2 gap-4 w-full max-w-sm">
               <div className="p-4 bg-white rounded-2xl border border-slate-200 text-left shadow-sm">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Engine Port</p>
                  <p className="text-xs font-bold text-slate-700">{type === 'metabase' ? '3000' : '8088'}</p>
               </div>
               <div className="p-4 bg-white rounded-2xl border border-slate-200 text-left shadow-sm">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Data Source</p>
                  <p className="text-xs font-bold text-slate-700 italic">MySQL_XAMPP</p>
               </div>
            </div>
          </div>
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
