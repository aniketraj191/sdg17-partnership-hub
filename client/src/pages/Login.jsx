import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe2, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      notifySuccess('Welcome back! Signed in successfully.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      notifyError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click fill demo accounts
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-md">
          <Globe2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to SDG 17 Hub
        </h1>
        <p className="text-xs text-slate-500">
          Access your organization's dashboard, manage projects, and audit contributions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-9"
                placeholder="name@organization.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-2.5 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-forest-700 hover:underline">
            Register here
          </Link>
        </div>

        {/* Demo Credentials Quick-Select Pill Box */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Demonstration Logins:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@sdg17hub.demo', 'Admin@123456')}
              className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition text-left"
            >
              <b className="block">Admin Account</b>
              <span className="text-[10px] text-emerald-700">admin@sdg17hub.demo</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('greenearth@sdg17hub.demo', 'Partner@123456')}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition text-left"
            >
              <b className="block">Green Earth (NGO)</b>
              <span className="text-[10px] text-slate-500">greenearth@sdg17hub.demo</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('cleanpower@sdg17hub.demo', 'Partner@123456')}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition text-left"
            >
              <b className="block">Clean Energy (Co.)</b>
              <span className="text-[10px] text-slate-500">cleanpower@sdg17hub.demo</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('edulearn@sdg17hub.demo', 'Partner@123456')}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition text-left"
            >
              <b className="block">Digital Learn (NGO)</b>
              <span className="text-[10px] text-slate-500">edulearn@sdg17hub.demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
