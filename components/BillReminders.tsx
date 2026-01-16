
import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, ExternalLink, Mail, RefreshCw, Smartphone, Sparkles, AlertCircle } from 'lucide-react';
import { Bill } from '../types';
import { extractBillFromEmail } from '../services/aiService';

interface BillRemindersProps {
  bills: Bill[];
  onAddBill?: (bill: Bill) => void;
  addLog: (msg: string) => void;
}

const BillReminders: React.FC<BillRemindersProps> = ({ bills, onAddBill, addLog }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const simulateAIScan = async () => {
    setIsScanning(true);
    addLog("n8n: Bắt đầu workflow IMAP Fetcher (Mock Scan)...");
    const mockEmail = "Thông báo cước FPT Telecom tháng 06/2024. Số tiền: 350,000 VND. Hạn: 20/06/2024.";
    
    try {
      addLog("Dify AI: Đang bóc tách dữ liệu email mẫu (NLP)...");
      // Thực tế sẽ gọi API Dify để bóc tách text từ n8n
      const result = await extractBillFromEmail(mockEmail);
      if (result) {
        setScanResult(result);
        addLog(`Dify: Phát hiện hóa đơn '${result.name}' thành công.`);
      }
    } catch (e) {
      addLog("Lỗi: Dify AI không phản hồi. Kiểm tra API Key.");
    } finally {
      setIsScanning(false);
    }
  };

  const confirmBill = () => {
    if (scanResult && onAddBill) {
      const newBill: Bill = {
        id: Math.random().toString(),
        name: scanResult.name,
        amount: scanResult.amount,
        dueDate: scanResult.dueDate || new Date().toISOString().split('T')[0],
        status: 'Chờ thanh toán',
        isRecurring: scanResult.isRecurring || false
      };
      onAddBill(newBill);
      addLog(`MySQL: Đã lưu hóa đơn ${newBill.name} vào MySQL.`);
      setScanResult(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <Smartphone size={120} />
          </div>
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-2">Trạng thái n8n</p>
          <p className="text-xl font-black flex items-center gap-2">Telegram Node Active</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-[8px] border-l-rose-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Cần thanh toán (MySQL)</p>
          <p className="text-3xl font-black text-slate-800">{bills.filter(b => b.status !== 'Đã thanh toán').length}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Trí tuệ nhân tạo</p>
          <p className="text-3xl font-black text-indigo-400">Dify Engine v2</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-200 bg-indigo-50/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center">
              <Mail size={28} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Dify Email Processor</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">n8n IMAP {'>'} Dify Extraction {'>'} Flask Engine</p>
            </div>
          </div>
          <button 
            onClick={simulateAIScan}
            disabled={isScanning}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
          >
            {isScanning ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isScanning ? 'Đang quét Email...' : 'Quét Email bằng Dify'}
          </button>
        </div>

        {scanResult && (
          <div className="mt-8 p-8 bg-white rounded-3xl border border-indigo-100 shadow-xl animate-in zoom-in border-b-4 border-b-emerald-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <CheckCircle size={32} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Dify AI bóc tách thành công:</p>
                    <h5 className="text-xl font-black text-slate-900">{scanResult.name}</h5>
                    <p className="text-sm font-bold text-slate-400 mt-1">Số tiền: {scanResult.amount?.toLocaleString()} ₫ • Hạn: {scanResult.dueDate}</p>
                 </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setScanResult(null)} className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[9px] hover:bg-slate-200 transition-all">Bỏ qua</button>
                <button onClick={confirmBill} className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] hover:bg-indigo-700 transition-all shadow-md">Lưu vào MySQL</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" /> Danh sách hóa đơn (Flask Sync)
          </h3>
          <span className="text-[9px] font-black text-slate-300 uppercase italic">Cập nhật bởi n8n</span>
        </div>
        <div className="divide-y divide-slate-100">
          {bills.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium italic text-sm">Chưa có hóa đơn nào được n8n ghi nhận.</div>
          ) : bills.map((bill) => (
            <div key={bill.id} className="p-8 flex items-center gap-6 hover:bg-slate-50/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{bill.name}</h4>
                <div className="flex items-center gap-6 mt-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                   <span className="flex items-center gap-1.5"><Calendar size={12} /> Hạn: {bill.dueDate}</span>
                   <span className="flex items-center gap-1.5 text-slate-900 font-black">Số tiền: {bill.amount.toLocaleString()} ₫</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                  bill.status === 'Đã thanh toán' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {bill.status}
                </span>
                <button className="p-2 text-slate-200 hover:text-indigo-500 transition-colors">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillReminders;
