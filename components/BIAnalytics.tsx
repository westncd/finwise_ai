import React, { useState } from 'react';
import {
  BarChart3, ExternalLink, ShieldCheck,
  Layers, Filter, Maximize2, RefreshCw, Cpu, Globe
} from 'lucide-react';

interface BIAnalyticsProps {
  type: 'metabase';
}

const BIAnalytics: React.FC<BIAnalyticsProps> = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [isFullView, setIsFullView] = useState(false);

  // Link mặc định
  const activeUrl = "http://localhost:3001/public/dashboard/622f0785-8c37-4bea-bc66-218e8b21fa6d";

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      {/* Top Info Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500 text-white shadow-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">
              Metabase Analytics
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                <ShieldCheck size={10} /> SQL Connection: Secure
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase italic">• MySQL (XAMPP) Instance</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => window.open(activeUrl, '_blank')}
            className="hidden md:flex items-center gap-2 px-4 py-3 text-indigo-500 hover:bg-indigo-50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all mr-2"
          >
            <ExternalLink size={14} /> Open
          </button>

          <button onClick={handleRefresh} className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>

          <button
            onClick={() => setIsFullView(!isFullView)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md ${isFullView
              ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            {isFullView ? <Maximize2 size={16} className="rotate-180" /> : <Maximize2 size={16} />}
            {isFullView ? 'Minimize' : 'Full View'}
          </button>
        </div>
      </div>

      {/* BI Embed Container */}
      <div
        className={`bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${isFullView
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]'
          : 'relative h-[700px]'
          }`}
      >
        {isFullView && (
          <button
            onClick={() => setIsFullView(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/90 backdrop-blur text-slate-900 rounded-full shadow-lg hover:bg-slate-100"
          >
            <Maximize2 size={20} className="rotate-180" />
          </button>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Connecting to Metabase Engine...</p>
          </div>
        )}

        <div className="w-full h-full flex flex-col">
          <iframe
            src={activeUrl}
            className="w-full flex-1 border-0"
            title="BI Analytics Dashboard"
            allowTransparency
          />
        </div>
      </div>

    </div>
  );
};

export default BIAnalytics;
