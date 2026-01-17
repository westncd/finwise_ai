import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Receipt, RefreshCw, AlertTriangle, ArrowRight, X, CreditCard } from 'lucide-react';
import { Bill } from '../types';

interface BillRemindersProps {
  bills: Bill[];
  onAddBill?: (bill: Bill) => void;
  addLog: (msg: string) => void;
}

const BillReminders: React.FC<BillRemindersProps> = ({ bills, addLog }) => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingBills = bills.filter(b => b.status !== 'Đã thanh toán');
  const paidBills = bills.filter(b => b.status === 'Đã thanh toán');
  const totalPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  const initiatePayment = (bill: Bill) => {
    setSelectedBill(bill);
  };

  const confirmPayment = async () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bills/${selectedBill.id}/pay`, { method: 'POST' });
      if (res.ok) {
        addLog(`Đã thanh toán hóa đơn: ${selectedBill.name}`);
        window.location.reload();
      } else {
        alert("Lỗi thanh toán!");
      }
    } catch (e) {
      alert("Lỗi kết nối Server!");
    } finally {
      setIsProcessing(false);
      setSelectedBill(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-[2rem] text-white shadow-lg shadow-rose-200 relative overflow-hidden">
          <Receipt className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Tổng nợ cần trả</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-3xl font-black">{totalPending.toLocaleString()}</p>
            <span className="text-[10px] font-bold opacity-60">VNĐ</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Số hóa đơn chờ</p>
          <p className="text-3xl font-black text-slate-800 flex items-center gap-2">
            {pendingBills.length} <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">Bill</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Đã thanh toán</p>
          <p className="text-3xl font-black text-emerald-600 flex items-center gap-2">
            {paidBills.length} <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">Bill</span>
          </p>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[11px] flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" /> Hóa đơn đến hạn
            </h3>
          </div>

          <div className="space-y-4">
            {pendingBills.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="font-bold text-slate-900">Không có hóa đơn nợ!</h4>
                <p className="text-xs text-slate-400 mt-1">Bạn đã thanh toán tất cả hóa đơn.</p>
              </div>
            ) : (
              pendingBills.map(bill => (
                <div key={bill.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-indigo-50 transition-colors"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{bill.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock size={10} /> Hạn: {bill.dueDate}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {bill.isRecurring ? 'Định kỳ' : 'Một lần'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-16 md:pl-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Số tiền</p>
                        <p className="text-xl font-black text-slate-900">{bill.amount.toLocaleString()} ₫</p>
                      </div>
                      <button
                        onClick={() => initiatePayment(bill)}
                        className="p-4 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 hover:scale-105 transition-all shadow-md group/btn"
                      >
                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar History */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">Lịch sử thanh toán</h3>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit max-h-[500px] overflow-y-auto">
            {paidBills.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">Chưa có lịch sử.</p>
            ) : (
              <div className="space-y-6">
                {paidBills.map(bill => (
                  <div key={bill.id} className="flex justify-between items-start opacity-60 hover:opacity-100 transition-opacity">
                    <div>
                      <p className="text-sm font-bold text-slate-700 line-through decoration-slate-300">{bill.name}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle size={10} /> Đã thanh toán
                      </p>
                    </div>
                    <p className="text-xs font-black text-slate-400">{bill.amount.toLocaleString()} ₫</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-600" /> Xác nhận thanh toán
              </h3>
              <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl mb-6 space-y-4 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Hóa đơn</span>
                <span className="text-sm font-bold text-slate-800">{selectedBill.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Hạn thanh toán</span>
                <span className="text-sm font-bold text-slate-800">{selectedBill.dueDate}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Số tiền</span>
                <span className="text-2xl font-black text-indigo-600">{selectedBill.amount.toLocaleString()} ₫</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBill(null)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmPayment}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillReminders;
