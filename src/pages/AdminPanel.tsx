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
  mentorId: string;
  mentorEmail: string;
  mentorName: string;
  totalChapters: number;
  totalStudents: number;
  studentsCompleted: number;
  studentsNotCompleted: number;
  studentDetails: Array<{
    studentId: string;
    studentEmail: string;
    studentName: string;
    completed: number;
    total: number;
    percentage: number;
    isCompleted: boolean;
  }>;
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-900">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-red-200 shadow-lg">⚙️</div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">LMS Admin</h1>
              <p className="text-xs text-slate-500">System Administration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right border-r border-slate-200 pr-4 hidden md:block">
              <p className="text-xs text-slate-500 font-mono">ID: {user?.userId?.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm font-semibold text-slate-900">Administrator</p>
            </div>
            <button 
              onClick={logout} 
              className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-all font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Platform Overview</h2>
            <p className="text-slate-600 mt-1">Manage users, approve mentors, and monitor internship analytics</p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'users' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              👥 Users
            </button>
            <button 
              onClick={() => setActiveTab('internships')}
              className={`px-5 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'internships' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📊 Analytics
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-600">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-red-600 mb-4"></div>
              <p className="font-medium text-sm">Loading system data...</p>
            </div>
          ) : (
            <>
              {/* USER MANAGEMENT TAB */}
              {activeTab === 'users' && (
                <div className="overflow-hidden rounded-xl">
                  {users.length === 0 ? (
                    <div className="text-center py-32">
                      <div className="text-6xl mb-4 opacity-20">👤</div>
                      <p className="text-slate-600 font-medium">No users found in the system</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">User Details</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                                  {u.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">{u.email}</div>
                                  <div className="text-xs text-slate-400 font-mono">ID: {u.id.substring(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                u.role === 'mentor' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                  : u.role === 'admin' 
                                  ? 'bg-red-50 text-red-700 border-red-100' 
                                  : 'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>
                                {u.role === 'mentor' ? '👨‍🏫' : u.role === 'admin' ? '🛡️' : '🎓'}
                                <span className="capitalize">{u.role}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {u.role === 'mentor' ? (
                                <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  u.is_approved ? 'text-green-600' : 'text-amber-600'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${u.is_approved ? 'bg-green-600' : 'bg-amber-600 animate-pulse'}`}></span>
                                  {u.is_approved ? 'Active' : 'Needs Approval'}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {u.role === 'mentor' && !u.is_approved && (
                                  <button 
                                    onClick={() => approveMentor(u.id)}
                                    className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs rounded-md font-medium transition-colors flex items-center gap-1"
                                  >
                                    ✓ Approve
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteUser(u.id)}
                                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs rounded-md font-medium transition-all"
                                >
                                  Delete
                                </button>
                              </div>
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
                      <h3 className="text-lg font-bold text-slate-900">No Courses Data</h3>
                      <p className="text-slate-500 text-sm mt-1">Analytics will appear here once mentors create content.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {stats.map(course => (
                        <div key={course.courseId} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          
                          {/* Course Header */}
                          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-slate-200">COURSE</span>
                                  <span className="text-xs text-slate-400 font-mono">{course.courseId.split('-')[0]}</span>
                                </div>
                                <h3 className="font-bold text-xl">{course.title}</h3>
                                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">M</span>
                                  {course.mentorName || course.mentorEmail}
                                </p>
                              </div>
                              <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <div className="text-2xl font-bold">{course.totalChapters}</div>
                                <div className="text-[10px] text-slate-300 uppercase tracking-wider">Chapters</div>
                              </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                              <div className="text-center">
                                <div className="text-2xl font-bold">{course.totalStudents}</div>
                                <div className="text-xs text-slate-400">Enrolled</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{course.studentsCompleted}</div>
                                <div className="text-xs text-slate-400">Graduates</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-amber-400">{course.studentsNotCompleted}</div>
                                <div className="text-xs text-slate-400">Active</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                  {course.totalStudents > 0 ? Math.round((course.studentsCompleted / course.totalStudents) * 100) : 0}%
                                </div>
                                <div className="text-xs text-slate-400">Success Rate</div>
                              </div>
                            </div>
                          </div>

                          {/* Student Details Table */}
                          <div className="bg-slate-50 border-t border-slate-200 p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Student Progress</h4>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-slate-600">Student</th>
                                    <th className="px-4 py-2 text-center font-medium text-slate-600">Completion</th>
                                    <th className="px-4 py-2 text-center font-medium text-slate-600">Chapters</th>
                                    <th className="px-4 py-2 text-right font-medium text-slate-600">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {course.studentDetails.length === 0 ? (
                                    <tr>
                                      <td colSpan={4} className="px-4 py-4 text-center text-slate-400 italic">No active students</td>
                                    </tr>
                                  ) : (
                                    course.studentDetails.map((student, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                          <div className="font-medium text-slate-900">{student.studentName || 'Student'}</div>
                                          <div className="text-slate-400 truncate max-w-[150px]">{student.studentEmail}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div 
                                                className={`h-full rounded-full ${student.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${student.percentage}%` }}
                                              ></div>
                                            </div>
                                            <span className="font-bold text-slate-700">{student.percentage}%</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                            {student.completed}/{student.total}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          {student.isCompleted ? (
                                            <span className="text-green-600 font-bold flex items-center justify-end gap-1">
                                              ✓ Certified
                                            </span>
                                          ) : (
                                            <span className="text-amber-600 font-medium flex items-center justify-end gap-1">
                                              In Progress
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
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

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-400 py-6 border-t border-slate-200">
          <p>© 2024 LMS Admin Console • Authorized Personnel Only</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminPanel;