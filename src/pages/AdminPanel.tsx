import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Types
interface User {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
}

interface CourseStat {
  courseId: string;
  title: string;
  mentorEmail: string;
  studentCount: number;
  students: string[];
}

const AdminPanel = () => {
  const { logout, user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'users' | 'internships'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/users');
        setUsers(res.data);
      } else {
        const res = await api.get('/users/stats');
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const approveMentor = async (userId: string) => {
    if (!window.confirm("Confirm approval for this mentor?")) return;
    try {
      await api.put(`/users/${userId}/approve-mentor`);
      alert('✅ Mentor Approved');
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("⚠️ Permanently delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      alert('🗑️ User deleted');
      fetchData(); // Refresh table
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-300 selection:bg-blue-500 selection:text-white">
      
      {/* 1. Top Navigation Bar (Dark Theme) */}
      <nav className="bg-[#1e293b]/50 backdrop-blur-md border-b border-slate-700/50 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">A</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Admin Console</h1>
            <p className="text-xs text-slate-400 font-mono">ID: {user?.userId}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-all hover:text-white hover:border-slate-600"
        >
          Sign Out
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* 2. Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
            <p className="text-slate-400 mt-1">Manage platform users and monitor internship statistics.</p>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'users' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              👥 User Management
            </button>
            <button 
              onClick={() => setActiveTab('internships')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'internships' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              📊 Internship Stats
            </button>
          </div>
        </div>

        {/* 3. Content Area */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden min-h-[500px] backdrop-blur-sm">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-96 text-slate-500">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
               <p className="text-sm font-medium">Loading system data...</p>
             </div>
          ) : (
            <>
              {/* VIEW A: USER TABLE */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-6">User Identity</th>
                        <th className="p-6">Role</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-700/30 transition-colors group">
                          <td className="p-6">
                            <div className="font-medium text-white">{u.email}</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">ID: {u.id.substring(0, 8)}...</div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                              u.role === 'mentor' 
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                : u.role === 'admin' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="p-6">
                            {u.role === 'mentor' ? (
                              u.is_approved ? 
                              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> 
                                Active
                              </div> : 
                              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span> 
                                Pending
                              </div>
                            ) : <span className="text-slate-600 text-sm">-</span>}
                          </td>
                          <td className="p-6 text-right space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {u.role === 'mentor' && !u.is_approved && (
                              <button 
                                onClick={() => approveMentor(u.id)}
                                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                ✓ Approve
                              </button>
                            )}
                            <button 
                                onClick={() => deleteUser(u.id)}
                                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                                Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW B: INTERNSHIP STATS GRID */}
              {activeTab === 'internships' && (
                <div className="p-8">
                  {stats.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50 border-dashed">
                      <div className="text-5xl mb-4 opacity-20">📊</div>
                      <h3 className="text-lg font-medium text-slate-300">No active internships found</h3>
                      <p className="text-slate-500 text-sm mt-1">Platform statistics will appear here once mentors create courses.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stats.map(course => (
                        <div key={course.courseId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 transition-all hover:border-blue-500/30 group">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-blue-400 transition-colors" title={course.title}>
                                {course.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Mentor: <span className="text-slate-300 font-medium">{course.mentorEmail}</span>
                              </p>
                            </div>
                            <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-2 rounded-lg text-center min-w-[70px]">
                              <span className="block text-2xl font-bold leading-none">{course.studentCount}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Enrolled</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                              Students <div className="h-px bg-slate-700 flex-1"></div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {course.students.length > 0 ? (
                                course.students.map((email, idx) => (
                                  <span key={idx} className="bg-slate-900/50 text-slate-400 px-2 py-1 rounded text-xs border border-slate-700/50 truncate max-w-[150px]" title={email}>
                                    {email}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-600 italic">No students assigned yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;