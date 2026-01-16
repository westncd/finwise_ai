
import React, { useState } from 'react';
import { 
  Mail, FileText, CheckCircle2, 
  RefreshCw, Zap, Database, ExternalLink,
  Workflow, Play, Beaker, PlusCircle, AlertCircle
} from 'lucide-react';

interface DataCenterProps {
  onInjectMockData?: (type: 'momo' | 'bank' | 'bill') => void;
}

const DataCenter: React.FC<DataCenterProps> = ({ onInjectMockData }) => {
  const [syncing, setSyncing] = useState<string | null>(null);

  const workflows = [
    {
      id: 'wf_gmail_momo',
      name: 'n8n: Gmail to MySQL',
      description: 'Tự động quét MoMo & ZaloPay từ hòm thư và đẩy về XAMPP MySQL.',
      status: 'Active',
      icon: Workflow,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      lastRun: '10 phút trước'
    },
    {
      id: 'wf_bank_sync',
      name: 'n8n: E-Statement',
      description: 'Xử lý sao kê ngân hàng định dạng .xlsx qua Flask Processor.',
      status: 'Standby',
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      lastRun: '1 ngày trước'
    }
  ];

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => setSyncing(null), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Hub */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
          <Workflow size={240} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400">Node: Local</div>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">MySQL: Active</div>
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter flex items-center gap-3 italic text-white">
            Automation Ecosystem
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed max-w-xl text-sm">
            Trung tâm điều phối n8n Workflow. Nếu bạn thiếu dữ liệu email thật, hãy sử dụng bộ công cụ **Simulator** bên dưới để tạo dữ liệu mẫu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mock Data Generator - CÂU TRẢ LỜI CHO VẤN ĐỀ THIẾU EMAIL */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm border-b-[6px] border-b-indigo-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Beaker size={18} className="text-indigo-600" /> Mock Data Generator (Testing Mode)
              </h3>
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg">DEVELOPER TOOL</span>
            </div>
            
            <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
              Bạn không có email thật? Hãy nhấn các nút dưới đây để giả lập n8n vừa nhận được 1 email tài chính và đẩy vào hệ thống.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => onInjectMockData?.('momo')}
                className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <PlusCircle size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Giả lập MoMo</span>
              </button>

              <button 
                onClick={() => onInjectMockData?.('bank')}
                className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <Database size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Giả lập VCB</span>
              </button>

              <button 
                onClick={() => onInjectMockData?.('bill')}
                className="flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <Mail size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Giả lập Hóa đơn</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">n8n Local Workflows</h3>
            {workflows.map((wf) => (
              <div key={wf.id} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${wf.bgColor} ${wf.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                      <wf.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight">{wf.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-sm">{wf.description}</p>
                      <div className="flex items-center gap-4 mt-2.5">
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase">
                          <CheckCircle2 size={10} /> {wf.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase italic">Lần cuối: {wf.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSync(wf.id)}
                    className={`p-3.5 rounded-xl border transition-all ${syncing === wf.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-500 hover:text-indigo-500'}`}
                  >
                    <RefreshCw size={18} className={syncing === wf.id ? 'animate-spin text-indigo-500' : 'text-slate-300'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Local Configuration</h3>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-indigo-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap size={18} />
              </div>
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Automation Stats</h4>
            </div>
            
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">n8n Host Port</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-700 font-bold">localhost:5678</span>
                  <ExternalLink size={12} className="text-slate-300" />
                </div>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <AlertCircle size={14} />
                  <p className="text-[9px] font-black uppercase tracking-widest">Dữ liệu thấp</p>
                </div>
                <p className="text-[10px] text-rose-500 font-medium italic">Vui lòng dùng Simulator để tạo thêm test case.</p>
              </div>

              <button className="w-full mt-4 py-3.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg">
                <Play size={14} /> Khởi chạy n8n GUI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenter;
