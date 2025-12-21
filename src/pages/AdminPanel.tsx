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
      fetchData(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("⚠️ Permanently delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      alert('🗑️ User deleted');
      fetchData(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">⚙️</div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">Admin<span className="text-slate-500">Console</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right border-r border-slate-200 pr-4 hidden md:block">
              <p className="text-xs text-slate-500 font-mono">ID: {user?.userId?.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm font-semibold text-slate-900">Administrator</p>
            </div>
            <button 
              onClick={logout} 
              className="text-sm bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Platform Overview</h2>
            <p className="text-slate-500 mt-1">Manage users and track learning analytics</p>
          </div>
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'users' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('internships')}
              className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'internships' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-900 mb-4"></div>
              <p className="font-medium text-sm">Loading data...</p>
            </div>
          ) : (
            <>
              {/* USER MANAGEMENT TAB */}
              {activeTab === 'users' && (
                <div>
                  {users.length === 0 ? (
                    <div className="text-center py-32">
                      <p className="text-slate-500 font-medium">No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">User Details</th>
                            <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right font-bold text-slate-700 uppercase text-xs tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                    {u.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{u.email}</div>
                                    <div className="text-xs text-slate-400 font-mono">ID: {u.id.substring(0, 8)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                                  u.role === 'mentor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                                  u.role === 'admin' ? 'bg-slate-800 text-white border-slate-800' : 
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {u.role === 'mentor' ? (
                                  <div className={`text-xs font-bold flex items-center gap-1.5 ${u.is_approved ? 'text-green-600' : 'text-amber-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${u.is_approved ? 'bg-green-600' : 'bg-amber-500'}`}></div>
                                    {u.is_approved ? 'Active' : 'Pending Approval'}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {u.role === 'mentor' && !u.is_approved && (
                                    <button 
                                      onClick={() => approveMentor(u.id)}
                                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-bold shadow-sm transition-all"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => deleteUser(u.id)}
                                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs rounded-lg font-bold transition-all"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ANALYTICS TAB */}
              {activeTab === 'internships' && (
                <div className="p-8 bg-slate-50">
                  {stats.length === 0 ? (
                    <div className="text-center py-24 text-slate-500">
                      <p>No analytics data available yet</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {stats.map(course => (
                        <div key={course.courseId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-xl text-slate-900">{course.title}</h3>
                                <p className="text-slate-500 text-sm mt-1">Mentor: <span className="font-medium text-slate-900">{course.mentorName || course.mentorEmail}</span></p>
                              </div>
                              <div className="flex gap-4 text-center">
                                 <div>
                                    <div className="text-2xl font-bold text-slate-900">{course.totalStudents}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Enrolled</div>
                                 </div>
                                 <div>
                                    <div className="text-2xl font-bold text-green-600">{course.studentsCompleted}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Done</div>
                                 </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50/50">
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-6 py-3 text-left font-bold text-slate-600">Student</th>
                                  <th className="px-6 py-3 text-left font-bold text-slate-600">Progress</th>
                                  <th className="px-6 py-3 text-right font-bold text-slate-600">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {course.studentDetails.length === 0 ? (
                                  <tr><td colSpan={3} className="p-4 text-center text-slate-400 italic">No students</td></tr>
                                ) : (
                                  course.studentDetails.map((student, idx) => (
                                    <tr key={idx}>
                                      <td className="px-6 py-3">
                                        <div className="font-bold text-slate-900">{student.studentName || 'Student'}</div>
                                        <div className="text-slate-500">{student.studentEmail}</div>
                                      </td>
                                      <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                            <div 
                                              className={`h-full rounded-full ${student.isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                              style={{ width: `${student.percentage}%` }}
                                            ></div>
                                          </div>
                                          <span className="font-bold text-slate-700">{student.percentage}%</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-3 text-right">
                                        {student.isCompleted ? (
                                          <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Certified</span>
                                        ) : (
                                          <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">Active</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
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