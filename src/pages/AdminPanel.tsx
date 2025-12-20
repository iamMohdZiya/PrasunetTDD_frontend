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
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-2xl font-bold text-red-700">🛡️ Admin Control Panel</h1>
          <p className="text-gray-500 text-sm">System Administrator: {user?.userId}</p>
        </div>
        <button onClick={logout} className="text-gray-600 hover:text-red-600 font-medium">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-full font-bold transition ${
            activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          👥 User Approvals
        </button>
        <button 
          onClick={() => setActiveTab('internships')}
          className={`px-6 py-2 rounded-full font-bold transition ${
            activeTab === 'internships' ? 'bg-red-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          📊 Internship Overview
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading data...</div>
        ) : (
          <>
            {/* VIEW 1: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                  <tr>
                    <th className="p-4 border-b">Email</th>
                    <th className="p-4 border-b">Role</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 border-b last:border-0">
                      <td className="p-4 font-medium">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          u.role === 'mentor' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'mentor' ? (
                          u.is_approved ? 
                          <span className="text-green-600 flex items-center gap-1">✅ Active</span> : 
                          <span className="text-orange-500 flex items-center gap-1">⏳ Pending</span>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="p-4 flex gap-2">
                        {u.role === 'mentor' && !u.is_approved && (
                          <button 
                            onClick={() => approveMentor(u.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 shadow"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                            onClick={() => deleteUser(u.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100 border border-red-200"
                        >
                            Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* VIEW 2: INTERNSHIP STATISTICS */}
            {activeTab === 'internships' && (
              <div className="p-6">
                {stats.length === 0 ? (
                  <p className="text-center text-gray-500">No internships created yet.</p>
                ) : (
                  <div className="grid gap-6">
                    {stats.map(course => (
                      <div key={course.courseId} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4 border-b pb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                            <p className="text-sm text-gray-500">Mentor: <span className="font-medium text-purple-600">{course.mentorEmail}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="block text-3xl font-bold text-blue-600">{course.studentCount}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Students Enrolled</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-sm text-gray-700 mb-2">Student List:</h4>
                          {course.students.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {course.students.map((email, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border">
                                  {email}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No students assigned yet.</p>
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
    </div>
  );
};

export default AdminPanel;