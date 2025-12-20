import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import this to read the role immediately

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;
      
      // 1. Log the user in (save to context)
      login(token);

      // 2. Decode token to find Role
      const decoded: any = jwtDecode(token);
      const role = decoded.role;

      // 3. Dynamic Redirect based on Role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'mentor') {
        navigate('/mentor');
      } else {
        navigate('/dashboard'); 
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">LMS Login</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input 
            type="email" 
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input 
            type="password" 
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200">
          Sign In
        </button>
        <p className="mt-4 text-center">
  Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
</p>
      </form>
    </div>
  );
};

export default Login;