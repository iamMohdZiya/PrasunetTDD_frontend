import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;
      
      login(token);
      const decoded: any = jwtDecode(token);
      
      if (decoded.role === 'admin') navigate('/admin');
      else if (decoded.role === 'mentor') navigate('/mentor');
      else navigate('/dashboard'); 

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill demo credentials
  const fillDemoCredentials = (role: 'student' | 'mentor' | 'admin') => {
    if (role === 'student') {
      setEmail('student@example.com');
      setPassword('student@123');
    } else if (role === 'mentor') {
      setEmail('mentor@example.com');
      setPassword('mentor@123');
    } else if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* LEFT SIDE: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/20 backdrop-blur-md h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg border border-white/30">📚</div>
            {/* UPDATED BRAND NAME */}
            <span className="font-bold text-2xl tracking-tight">LMS</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6 text-white">
            Master your skills with structured learning.
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Join thousands of students and mentors. Track progress, complete courses, and earn certificates in a comprehensive learning ecosystem.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <span className="text-blue-50">Sequential chapter progression</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <span className="text-blue-50">Real-time progress tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <span className="text-blue-50">Professional certificates</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-blue-100">
          © 2024 LMS - Internship Learning Management System
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="w-full max-w-md space-y-8">
          
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-600 mt-2 text-base">Sign in to your account to continue learning</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0 text-red-500 text-xl">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* DEMO CREDENTIALS SECTION */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 text-center">
              🚀 Demo Credentials (Click to Fill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => fillDemoCredentials('student')}
                className="bg-white hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2 px-1 rounded border border-blue-200 transition-colors"
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => fillDemoCredentials('mentor')}
                className="bg-white hover:bg-purple-100 text-purple-700 text-xs font-semibold py-2 px-1 rounded border border-purple-200 transition-colors"
              >
                Mentor
              </button>
              <button 
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-1 rounded border border-slate-300 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-50 outline-none transition-all text-sm placeholder-slate-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-50 outline-none transition-all text-sm placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-base shadow-lg transition-all transform active:scale-95 ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
            >
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-slate-50 to-slate-100 text-slate-500">New to LMS?</span>
            </div>
          </div>

          <Link to="/register" className="w-full block py-3 px-4 rounded-lg text-center font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 transition-all">
            Create Account
          </Link>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <p className="mb-3">© 2024 LMS • Internship Learning Management System</p>
            <div className="flex justify-center gap-4 text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;