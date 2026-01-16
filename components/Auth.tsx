
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Github, UserPlus } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mô phỏng quá trình xác thực với Flask/Firebase
    setTimeout(() => {
      onLogin({ 
        email, 
        name: isLogin ? email.split('@')[0] : name,
        id: Math.random().toString()
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-500/30 mb-6 rotate-3">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">FinWise AI</h1>
          <p className="text-slate-500 mt-3 font-medium">Hệ sinh thái tài chính thông minh của bạn</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white">
          <div className="flex gap-2 mb-10 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              Đăng nhập
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Họ tên</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" required placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="email" required placeholder="admin@finwise.vn" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 disabled:opacity-70 group">
              {loading ? 'Đang xác thực...' : isLogin ? 'Vào FinWise' : 'Tạo tài khoản ngay'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 flex flex-col items-center gap-6">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Hoặc đăng nhập qua</span>
            <div className="flex gap-4 w-full">
              <button className="flex-1 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-bold text-slate-600 text-sm">
                <Github size={18} /> Github
              </button>
              <button className="flex-1 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-bold text-slate-600 text-sm">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" /> Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
