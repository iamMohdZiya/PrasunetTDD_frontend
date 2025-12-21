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
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* LEFT SIDE: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/20 backdrop-blur-md h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg border border-white/30">📚</div>
            <span className="font-bold text-2xl tracking-tight">LearnHub</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Start your learning journey today.
          </h1>
          <p className="text-pink-100 text-lg max-w-md leading-relaxed">
            Join thousands of students and mentors. Gain skills, track progress, earn certificates, and grow your career with structured learning.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-pink-100 text-sm">Active Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-pink-100 text-sm">Expert Mentors</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-pink-100">
          © 2024 LearnHub - Professional Learning Management
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="w-full max-w-lg space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-600 text-base">Select your role and get started learning</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm flex items-center gap-3 shadow-sm">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Role Selection Cards */}
            <div className="bg-white rounded-lg p-6 border-2 border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-4">Select Your Role</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setRole('student')}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 ${role === 'student' ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200/50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'}`}
                >
                  <span className="text-4xl">🎓</span>
                  <div className="text-center">
                    <div className="font-bold text-sm text-slate-900">Student</div>
                    <div className="text-xs text-slate-500">Learn & Progress</div>
                  </div>
                </div>
                <div 
                  onClick={() => setRole('mentor')}
                  className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 ${role === 'mentor' ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200/50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'}`}
                >
                  <span className="text-4xl">👨‍🏫</span>
                  <div className="text-center">
                    <div className="font-bold text-sm text-slate-900">Mentor</div>
                    <div className="text-xs text-slate-500">Teach & Guide</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-slate-200 text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-slate-400"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-white border-2 border-slate-200 text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-white border-2 border-slate-200 text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            {/* Mentor Info Box */}
            {role === 'mentor' && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                <div className="flex gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Mentor Account Approval Required</div>
                    <p className="text-slate-600 text-xs mt-1">Your account will need to be verified by an administrator before you can start creating courses.</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-base shadow-lg transition-all transform active:scale-95 ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
            >
              {loading ? '⏳ Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="border-t border-slate-300 pt-6">
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <p className="mb-3">© 2024 LearnHub • Internship Learning Management System</p>
            <div className="flex justify-center gap-4 text-slate-600">
              <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;