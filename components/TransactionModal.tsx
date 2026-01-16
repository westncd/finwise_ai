import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const API_BASE = "http://localhost:5000/api"; // Or import from config if available

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        category: 'Ăn uống',
        description: '',
        source: 'Thủ công',
        date: new Date().toISOString().slice(0, 16) // datetime-local format
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseInt(formData.amount.replace(/\./g, '').replace(/,/g, ''))
                })
            });

            if (response.ok) {
                onSuccess();
                onClose();
                // Reset form slightly
                setFormData(prev => ({ ...prev, amount: '', description: '' }));
            } else {
                alert("Lỗi khi lưu giao dịch!");
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Không thể kết nối Server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">Thêm Giao Dịch Mới</h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Amount & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số tiền (VND)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="0"
                                value={formData.amount}
                                onChange={e => {
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    if (rawValue) {
                                        const formatted = parseInt(rawValue).toLocaleString('vi-VN');
                                        setFormData({ ...formData, amount: formatted });
                                    } else {
                                        setFormData({ ...formData, amount: '' });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loại</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="expense">Chi tiêu 💸</option>
                                <option value="income">Thu nhập 💰</option>
                            </select>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Danh mục</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Ăn uống">Ăn uống</option>
                            <option value="Di chuyển">Di chuyển</option>
                            <option value="Mua sắm">Mua sắm</option>
                            <option value="Hóa đơn">Hóa đơn & Tiện ích</option>
                            <option value="Giải trí">Giải trí</option>
                            <option value="Sức khỏe">Sức khỏe</option>
                            <option value="Giáo dục">Giáo dục</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nội dung</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Ví dụ: Ăn trưa, Cà phê..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Date & Source */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nguồn tiền</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="Thủ công">Thủ công</option>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Ngân hàng">Ngân hàng</option>
                                <option value="MoMo">MoMo</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            {loading ? 'Đang lưu...' : 'Lưu Giao Dịch'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
