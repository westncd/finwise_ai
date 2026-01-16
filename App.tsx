
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Wallet, PieChart, Bell, TrendingUp, MessageSquare,
  Plus, LogOut, Terminal, Zap, RefreshCw, BarChart3, DatabaseZap, Server
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import BudgetManager from './components/BudgetManager';
import BillReminders from './components/BillReminders';
import ForecastView from './components/ForecastView';
import ChatAdvisor from './components/ChatAdvisor';
import BIAnalytics from './components/BIAnalytics';
import DataCenter from './components/DataCenter';
import Auth from './components/Auth';
import { Transaction, Budget, Bill } from './types';

const API_BASE = "http://localhost:5000/api";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('finwise_auth') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('finwise_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('finwise_auth');
    setIsAuthenticated(false);
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));
  };

  const handleInjectMockData = (type: 'momo' | 'bank' | 'bill') => {
    addLog(`n8n: Simulating incoming email for ${type.toUpperCase()}...`);

    if (type === 'momo') {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        amount: Math.floor(Math.random() * 500000) + 50000,
        category: 'Ăn uống',
        description: `Thanh toán MoMo tại HIGHLANDS COFFEE #${Math.floor(Math.random() * 1000)}`,
        source: 'MoMo'
      };
      setTransactions(prev => [newTx, ...prev]);
      addLog(`MySQL: Giả lập thành công - Đã lưu 1 giao dịch MoMo.`);
    } else if (type === 'bank') {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        amount: Math.floor(Math.random() * 2000000) + 100000,
        category: 'Mua sắm',
        description: `GD: 00123-9992 - Chuyển khoản nội bộ VCB`,
        source: 'Ngân hàng'
      };
      setTransactions(prev => [newTx, ...prev]);
      addLog(`MySQL: Giả lập thành công - Đã lưu 1 giao dịch Ngân hàng.`);
    } else if (type === 'bill') {
      const newBill: Bill = {
        id: Math.random().toString(),
        name: 'Hóa đơn Điện tháng ' + (new Date().getMonth() + 1),
        amount: 850000,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Chờ thanh toán',
        isRecurring: true
      };
      setBills(prev => [newBill, ...prev]);
      addLog(`MySQL: Giả lập thành công - Phát hiện 1 hóa đơn mới từ Email.`);
    }
  };

  const fetchData = async () => {
    try {
      addLog("Kết nối Flask Engine...");
      const [txR, bR, blR] = await Promise.all([
        fetch(`${API_BASE}/transactions`).catch(() => null),
        fetch(`${API_BASE}/budgets`).catch(() => null),
        fetch(`${API_BASE}/bills`).catch(() => null)
      ]);

      if (txR && txR.ok) {
        const txData = await txR.json();
        setTransactions(txData);

        if (bR && bR.ok) {
          const bData = await bR.json();
          setBudgets(bData);
        }

        if (blR && blR.ok) {
          const blData = await blR.json();
          setBills(blData);
        }

        addLog("Đồng bộ MySQL (XAMPP) thành công.");
      } else {
        // Fallback data if local server is not running
        addLog("Backend Offline - Sử dụng dữ liệu giả lập Local.");
        setTransactions([
          { id: '1', date: '2024-06-01', amount: 450000, type: 'expense', category: 'Ăn uống', description: 'Ăn trưa tại Quán Ngon', source: 'MoMo' },
          { id: '2', date: '2024-06-02', amount: 1200000, type: 'expense', category: 'Mua sắm', description: 'Mua quần áo Uniqlo', source: 'Thẻ tín dụng' }
        ]);
        setBudgets([
          { category: 'Ăn uống', limit: 5000000, spent: 3200000 },
          { category: 'Di chuyển', limit: 1500000, spent: 400000 },
          { category: 'Mua sắm', limit: 3000000, spent: 2850000 }
        ]);
        setBills([
          { id: '101', name: 'Tiền mạng FPT', amount: 250000, dueDate: '2024-06-20', status: 'Chờ thanh toán', isRecurring: true }
        ]);
      }
    } catch (e) {
      addLog("LỖI hệ thống. Vui lòng kiểm tra Docker/n8n.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan & Đốt tiền', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lịch sử Giao dịch', icon: Wallet },
    { id: 'budgets', label: 'Hạn mức Ngân sách', icon: PieChart },
    { id: 'bills', label: 'Nhắc hóa đơn', icon: Bell },
    { id: 'forecast', label: 'Dự báo & Rủi ro', icon: TrendingUp },
    { id: 'metabase', label: 'Metabase BI', icon: BarChart3 },
    { id: 'superset', label: 'Superset Pro', icon: DatabaseZap },
    { id: 'datacenter', label: 'n8n Workflow Hub', icon: Server },
    { id: 'advisor', label: 'Dify Chat Advisor', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 h-screen sticky top-0 border-r border-slate-800">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 text-white">F</div>
          <span className="font-bold tracking-tighter text-lg uppercase italic text-white">FinWise AI</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-hide">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === item.id ? 'bg-indigo-600 shadow-md shadow-indigo-900/40 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest px-2">
            <Zap size={12} /> Dify & n8n Ecosystem
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-rose-400 transition-colors text-xs font-bold uppercase tracking-wide">
            <LogOut size={14} /> Thoát
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">Xử lý bởi Flask Engine • MySQL XAMPP • n8n</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
              <RefreshCw size={18} className="text-indigo-600" />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
              <Plus size={18} /> Giao dịch mới
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto pb-20">
          {activeTab === 'dashboard' && <Dashboard transactions={transactions} budgets={budgets} />}
          {activeTab === 'transactions' && <TransactionsList transactions={transactions} onUpdateTransactions={setTransactions} addLog={addLog} />}
          {activeTab === 'budgets' && <BudgetManager budgets={budgets} transactions={transactions} />}
          {activeTab === 'bills' && <BillReminders bills={bills} addLog={addLog} />}
          {activeTab === 'forecast' && <ForecastView transactions={transactions} />}
          {activeTab === 'metabase' && <BIAnalytics type="metabase" />}
          {activeTab === 'superset' && <BIAnalytics type="superset" />}
          {activeTab === 'datacenter' && <DataCenter onInjectMockData={handleInjectMockData} />}
          {activeTab === 'advisor' && <ChatAdvisor transactions={transactions} budgets={budgets} />}

          <div className="mt-12 bg-slate-900 rounded-2xl p-5 font-mono text-[11px] text-indigo-300 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-slate-500 uppercase tracking-widest font-black text-[9px]">
              <Terminal size={12} /> Dify & n8n Automation Logs
            </div>
            {logs.length === 0 ? <div className="text-slate-700 italic">Đang chờ tín hiệu từ Dify...</div> : logs.map((log, i) => (
              <div key={i} className="py-0.5 font-medium"><span className="text-slate-600 mr-2">➜</span>{log}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
