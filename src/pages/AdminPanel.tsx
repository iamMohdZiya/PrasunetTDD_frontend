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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">⚙️</div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">LearnHub Admin</h1>
              <p className="text-xs text-slate-500">System Administration Console</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-all font-medium"
          >
            Sign Out
          </button>
          <div className="text-right border-l border-slate-200 pl-4">
            <p className="text-xs text-slate-500 font-mono">ID: {user?.userId?.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm font-semibold text-slate-900">{user?.role === 'admin' ? 'Admin' : 'User'}</p>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Header Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Platform Administration</h2>
          <p className="text-slate-600 mt-2">Manage users, approve mentors, and monitor platform analytics</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-3 mb-8 bg-white rounded-xl border border-slate-200 p-2 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            👥 User Management
          </button>
          <button 
            onClick={() => setActiveTab('internships')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'internships' 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            📊 Course Analytics
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-red-600 mb-4"></div>
              <p className="font-medium">Loading system data...</p>
            </div>
          ) : (
            <>
              {/* USER MANAGEMENT TAB */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  {users.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4 opacity-20">👤</div>
                      <p className="text-slate-600 font-medium">No users found</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                          <th className="px-6 py-4 text-left font-bold text-slate-900 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left font-bold text-slate-900 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left font-bold text-slate-900 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right font-bold text-slate-900 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{u.email}</div>
                              <div className="text-xs text-slate-500 font-mono mt-1">ID: {u.id.substring(0, 12)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="inline-flex items-center gap-2">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                  u.role === 'mentor' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : u.role === 'admin' 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {u.role === 'mentor' ? '👨‍🏫' : u.role === 'admin' ? '⚙️' : '🎓'} {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {u.role === 'mentor' ? (
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                                  u.is_approved 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${u.is_approved ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                                  {u.is_approved ? 'Approved' : 'Pending'}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {u.role === 'mentor' && !u.is_approved && (
                                <button 
                                  onClick={() => approveMentor(u.id)}
                                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold text-xs rounded-lg transition-all"
                                >
                                  ✓ Approve
                                </button>
                              )}
                              <button 
                                onClick={() => deleteUser(u.id)}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg transition-all"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* COURSE ANALYTICS TAB */}
              {activeTab === 'internships' && (
                <div className="p-8">
                  {stats.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4 opacity-20">📊</div>
                      <h3 className="text-lg font-bold text-slate-900">No Courses Yet</h3>
                      <p className="text-slate-600 text-sm mt-1">Platform statistics will appear once mentors create courses</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stats.map(course => (
                        <div 
                          key={course.courseId} 
                          className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6 hover:border-red-400 hover:shadow-lg transition-all group"
                        >
                          {/* Course Title */}
                          <div className="mb-5">
                            <h3 className="font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-red-600 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1">
                              by <span className="font-semibold text-slate-900">{course.mentorEmail}</span>
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="mb-6">
                            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold">{course.studentCount}</div>
                              <div className="text-xs font-semibold mt-1 uppercase tracking-wider opacity-90">Students Enrolled</div>
                            </div>
                          </div>

                          {/* Student List */}
                          <div>
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                              👥 Students
                              <span className="flex-1 h-px bg-slate-300"></span>
                            </div>
                            
                            {course.students.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {course.students.map((email, idx) => (
                                  <div 
                                    key={idx} 
                                    className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-600 truncate hover:bg-slate-50"
                                    title={email}
                                  >
                                    📧 {email}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded">
                                No students enrolled yet
                              </div>
                            )}
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

        {/* Professional Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-600 to-orange-600 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                <div>
                  <h3 className="font-bold text-slate-900">LearnHub Admin</h3>
                  <p className="text-xs text-slate-500">© 2024 All Rights Reserved</p>
                </div>
              </div>
              <div className="flex justify-center items-start">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-3">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-red-600 transition-colors">Support</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-xs text-slate-500">Version 1.0.0</p>
                <p className="text-xs font-mono text-slate-500 mt-2">Admin ID: {user?.userId?.slice(0, 12).toUpperCase()}</p>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
              <p>LearnHub Administration Platform • System Management & Oversight</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminPanel;