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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Create Account</h2>
        <p className="text-center text-gray-500 mb-6">Join the Learning Management System</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* NEW: Full Name Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">I am a:</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center p-3 rounded border cursor-pointer transition ${role === 'student' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')}
                  className="hidden" 
                />
                🎓 Student
              </label>
              
              <label className={`flex-1 flex items-center justify-center p-3 rounded border cursor-pointer transition ${role === 'mentor' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="mentor" 
                  checked={role === 'mentor'} 
                  onChange={() => setRole('mentor')}
                  className="hidden" 
                />
                👨‍🏫 Mentor
              </label>
            </div>
          </div>

          {role === 'mentor' && (
            <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
              ℹ️ Note: Mentor accounts require Admin approval before you can access the dashboard.
            </p>
          )}

          <button 
            disabled={loading}
            className={`w-full text-white p-3 rounded font-medium transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;