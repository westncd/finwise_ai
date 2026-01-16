import React, { useState } from 'react';
import { X, Save, History, TrendingDown, Target, Edit3 } from 'lucide-react';
import { Budget, Transaction } from '../types';

interface BudgetDetailModalProps {
    budget: Budget | null;
    transactions: Transaction[];
    onClose: () => void;
    onUpdateSuccess: () => void;
}

const BudgetDetailModal: React.FC<BudgetDetailModalProps> = ({ budget, transactions, onClose, onUpdateSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newLimit, setNewLimit] = useState<string>('');
    const [saving, setSaving] = useState(false);

    if (!budget) return null;

    // Filter transactions for this budget category
    const connectedTransactions = transactions.filter(t => t.category === budget.category);

    // Default new limit to current limit when opening edit mode
    const startEditing = () => {
        setNewLimit(budget.limit.toLocaleString('vi-VN'));
        setIsEditing(true);
    }

    const handleSaveLimit = async () => {
        setSaving(true);
        try {
            const rawLimit = parseInt(newLimit.replace(/\./g, '').replace(/,/g, ''));
            const res = await fetch(`http://localhost:5000/api/budgets/${budget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: rawLimit })
            });
            if (res.ok) {
                onUpdateSuccess();
                setIsEditing(false);
            } else {
                alert("Lỗi khi cập nhật!");
            }
        } catch (e) {
            alert("Lỗi kết nối Server!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                    <div>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Chi tiết Ngân sách</p>
                        <h2 className="text-3xl font-black uppercase tracking-tight">{budget.category}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Limit Section */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Target size={12} /> Hạn mức hiện tại</p>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="bg-white border border-indigo-200 text-2xl font-black text-indigo-600 w-40 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newLimit}
                                        onChange={e => {
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            if (rawValue) {
                                                const formatted = parseInt(rawValue).toLocaleString('vi-VN');
                                                setNewLimit(formatted);
                                            } else {
                                                setNewLimit('');
                                            }
                                        }}
                                    />
                                    <button onClick={handleSaveLimit} disabled={saving} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        <Save size={20} />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-3xl font-black text-slate-900">{budget.limit.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} <span className="text-sm text-slate-400">VND</span></p>
                            )}
                        </div>
                        {!isEditing && (
                            <button onClick={startEditing} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2">
                                <Edit3 size={14} /> Chỉnh sửa
                            </button>
                        )}
                    </div>

                    {/* Transactions List */}
                    <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                            <History size={16} className="text-indigo-500" /> Các khoản chi tiêu gần đây
                        </h4>
                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {connectedTransactions.length === 0 ? (
                                <p className="text-slate-400 italic text-sm text-center py-8">Chưa có giao dịch nào trong danh mục này.</p>
                            ) : connectedTransactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                                            <TrendingDown size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{t.description}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-slate-900 text-sm">-{t.amount.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetDetailModal;
