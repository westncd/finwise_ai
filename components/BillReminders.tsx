
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
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-[8px] border-l-rose-500 max-w-sm">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Cần thanh toán (MySQL)</p>
        <p className="text-3xl font-black text-slate-800">{bills.filter(b => b.status !== 'Đã thanh toán').length}</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
            <Calendar size={16} className="text-rose-500" /> Hóa đơn chưa thanh toán
          </h3>
          <span className="text-[9px] font-black text-slate-300 uppercase italic">Ưu tiên xử lý</span>
        </div>
        <div className="divide-y divide-slate-100">
          {bills.filter(b => b.status !== 'Đã thanh toán').length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium italic text-sm">Tuyệt vời! Bạn không còn hóa đơn nợ.</div>
          ) : bills.filter(b => b.status !== 'Đã thanh toán').map((bill) => (
            <div key={bill.id} className="p-8 flex items-center gap-6 hover:bg-slate-50/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
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
                <button
                  onClick={async () => {
                    if (!confirm("Xác nhận thanh toán hóa đơn này?")) return;
                    try {
                      const res = await fetch(`http://localhost:5000/api/bills/${bill.id}/pay`, { method: 'POST' });
                      const data = await res.json();

                      if (res.ok) {
                        addLog(`Đã thanh toán hóa đơn: ${bill.name}`);
                        window.location.reload();
                      } else {
                        alert(`Lỗi Server: ${data.message || 'Không rõ nguyên nhân'}`);
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Lỗi kết nối đến Backend (Flask)!");
                    }
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                  Thanh toán ngay
                </button>
                <span className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-[9px] font-black uppercase tracking-widest">
                  {bill.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {bills.some(b => b.status === 'Đã thanh toán') && (
        <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200/60 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
          <div className="p-6 border-b border-slate-200/50 flex items-center gap-3">
            <CheckCircle size={16} className="text-emerald-500" />
            <h4 className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Lịch sử đã thanh toán</h4>
          </div>
          <div className="divide-y divide-slate-200/50">
            {bills.filter(b => b.status === 'Đã thanh toán').map(bill => (
              <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{bill.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{bill.dueDate} • {bill.amount.toLocaleString()} ₫</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                  Đã thanh toán
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillReminders;
