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

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* LEFT SIDE: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-16">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-bold">L</div>
            <span className="font-bold text-xl tracking-tight">LMS Platform</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Master your skills <br /> with structured learning.
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Join a community of mentors and students. Track your progress, earn certificates, and advance your career.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          © 2024 Internship LMS System
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-sm space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-slate-500 mt-2 text-sm">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0 text-red-500">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-sm shadow-md transition-all ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;