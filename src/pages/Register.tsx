import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  
  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        fullName,
        email,
        password,
        role
      });

      alert(role === 'mentor' 
        ? 'Registration successful! Please wait for Admin approval.' 
        : 'Registration successful! You can now log in.');
      
      navigate('/'); 
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-slate-300 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* LEFT SIDE: Branding & Testimonials (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-900 to-slate-900 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">L</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">LMS Platform</h1>
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start your learning <br /> journey today.
          </h2>
          <p className="text-lg text-blue-200 max-w-md">
            Join thousands of students and mentors managing projects, tracking progress, and earning certificates in real-time.
          </p>
        </div>
        
        {/* Subtle Grid Pattern Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="relative z-10 text-sm text-blue-300">
          © 2024 Internship LMS. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-[#0f172a]">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
            <p className="text-slate-400">Enter your details to get started.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 rounded text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Role Selection Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setRole('student')}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${role === 'student' ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
              >
                <span className="text-2xl">🎓</span>
                <span className="font-medium text-sm">Student</span>
              </div>
              <div 
                onClick={() => setRole('mentor')}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${role === 'mentor' ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
              >
                <span className="text-2xl">👨‍🏫</span>
                <span className="font-medium text-sm">Mentor</span>
              </div>
            </div>

            {/* Inputs Group */}
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            {/* Mentor Warning */}
            {role === 'mentor' && (
              <div className="text-xs text-purple-300 bg-purple-900/20 border border-purple-500/20 p-3 rounded-lg flex gap-2">
                ℹ️ Mentor accounts require manual approval from an administrator before access is granted.
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-bold text-white transition-all duration-200 transform active:scale-[0.98] ${
                loading 
                  ? 'bg-slate-700 cursor-wait' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30'
              }`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;