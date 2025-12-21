import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { BookOpen, CheckCircle, Lock, Mail, ChevronRight } from 'lucide-react';

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

  const fillDemo = (role: 'student' | 'mentor' | 'admin') => {
    if (role === 'student') { setEmail('student@example.com'); setPassword('student@123'); }
    else if (role === 'mentor') { setEmail('mentor@example.com'); setPassword('mentor@123'); }
    else if (role === 'admin') { setEmail('admin@example.com'); setPassword('password123'); }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">LearnHub</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Elevate your <br/>
            <span className="text-indigo-400">learning journey.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            The professional platform for structured internships, mentorships, and skill certification.
          </p>
          <div className="mt-12 space-y-4">
            {['Expert Mentorship', 'Sequential Learning', 'Verified Certificates'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-indigo-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500 relative z-10">© 2024 LearnHub LMS Platform</p>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Demo Links - Styled Discreetly */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400 mb-3 uppercase tracking-wider font-bold">Quick Demo Access</p>
            <div className="flex justify-center gap-2">
              {['student', 'mentor', 'admin'].map((role) => (
                <button 
                  key={role}
                  onClick={() => fillDemo(role as any)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;