
import React, { useState } from 'react';
import { Search, ShieldAlert, RefreshCw, AlertTriangle, CreditCard, MoreHorizontal, ShoppingBag, Utensils, Car, Zap, Home, TrendingUp, HelpCircle, ShieldCheck } from 'lucide-react';
import { Transaction, Category } from '../types';
import { detectAnomalies } from '../services/aiService';

interface TransactionsListProps {
  transactions: Transaction[];
  onUpdateTransactions: (txs: Transaction[]) => void;
  addLog: (msg: string) => void;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'Mua sắm': return <ShoppingBag size={18} />;
    case 'Ăn uống': return <Utensils size={18} />;
    case 'Di chuyển': return <Car size={18} />;
    case 'Tiện ích': return <Zap size={18} />;
    case 'Nhà ở': return <Home size={18} />;
    case 'Đầu tư': return <TrendingUp size={18} />;
    default: return <HelpCircle size={18} />;
  }
};

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, onUpdateTransactions, addLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSecurityScan = async () => {
    if (transactions.length === 0) return;
    setIsScanning(true);
    addLog("n8n: Khởi chạy Security Workflow...");
    try {
      addLog("Dify: Đang phân tích rủi ro dữ liệu từ MySQL...");
      const result = await detectAnomalies(transactions);
      
      const updatedTransactions = transactions.map(t => {
        const anomaly = result.anomalies?.find((a: any) => a.id === t.id);
        if (anomaly) {
          addLog(`CẢNH BÁO: Phát hiện bất thường tại '${t.description}'`);
          return { ...t, isAnomaly: true, anomalyReason: anomaly.reason };
        }
        return { ...t, isAnomaly: false };
      });

      onUpdateTransactions(updatedTransactions);
      addLog("Dify: Quét bảo mật hoàn tất.");
    } catch (e) {
      addLog("LỖI: Không thể kết nối Dify Security Workflow.");
    } finally {
      setIsScanning(false);
    }
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm giao dịch (n8n & Mock)..." 
            className="w-full pl-14 pr-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleSecurityScan}
          disabled={isScanning || transactions.length === 0}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-30"
        >
          {isScanning ? <RefreshCw size={16} className="animate-spin text-indigo-400" /> : <ShieldAlert size={16} />}
          {isScanning ? 'Dify Scanning...' : 'Dify Security Scan'}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung & Source</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic text-sm font-medium">Chưa có giao dịch. Hãy dùng Simulator trong Data Center.</td>
                </tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className={`hover:bg-slate-50/50 transition-all ${t.isAnomaly ? 'bg-rose-50/40' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-2xl ${t.isAnomaly ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-500'} transition-colors`}>
                        {getCategoryIcon(t.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 text-[13px] tracking-tight">{t.description}</p>
                          {t.isAnomaly && (
                            <div className="group relative">
                              <AlertTriangle size={14} className="text-rose-500 cursor-help" />
                              <div className="absolute bottom-full mb-2 left-0 w-48 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold">
                                {t.anomalyReason || "Dify phát hiện bất thường!"}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mt-1.5 tracking-widest flex items-center gap-1.5">
                          <span className="text-indigo-400">{t.source}</span> • {new Date(t.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className={`font-black text-sm ${t.isAnomaly ? 'text-rose-600' : 'text-slate-900'}`}>
                      {t.amount.toLocaleString('vi-VN')} ₫
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 py-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={14} /> Dify Encrypted Scan
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <RefreshCw size={14} /> Auto-Sync: Active
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
