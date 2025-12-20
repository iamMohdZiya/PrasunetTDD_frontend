import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Chapter {
  id: number;
  title: string;
  sequence_order: number;
  content_url?: string;
  image_url?: string; // NEW: Image Support
}

interface Course {
  id: string;
  title: string;
  description: string;
}

interface ProgressStat {
  courseId: string;
  percentage: number;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  
  // Views
  const [view, setView] = useState<'list' | 'view'>('list');
  
  // Data State
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [progressStats, setProgressStats] = useState<Record<string, number>>({}); // NEW: Stores % per course
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // Lock Logic
  const [completedOrders, setCompletedOrders] = useState<number[]>([]); 

  useEffect(() => {
    fetchAssignedCourses();
    fetchProgress(); // Load progress bars
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      const res = await api.get('/courses/assigned');
      setAssignedCourses(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get('/progress/my');
      // Convert Array to Map: { 'courseId': 50 }
      const statsMap: Record<string, number> = {};
      res.data.forEach((p: ProgressStat) => {
        statsMap[p.courseId] = p.percentage;
      });
      setProgressStats(statsMap);
    } catch (err) {
      console.error("Progress load error", err);
    }
  };

  const openCourse = async (course: Course) => {
    try {
      const res = await api.get(`/courses/${course.id}`);
      setActiveCourse(res.data.course);
      setChapters(res.data.chapters);
      
      // Reset local session progress tracking (ideally fetched from backend in a real app)
      setCompletedOrders([0]); 
      
      setView('view');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot access course');
    }
  };

  const handleComplete = async (chapter: Chapter) => {
    if (!activeCourse) return;
    try {
      await api.post('/progress/complete', {
        courseId: activeCourse.id,
        chapterId: chapter.id,
        sequenceOrder: chapter.sequence_order
      });
      alert(`🎉 Chapter ${chapter.sequence_order} Completed!`);
      
      // Unlock next
      setCompletedOrders((prev) => [...prev, chapter.sequence_order]);
      
      // Refresh global progress stats in background
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error completing chapter');
    }
  };

  const downloadCertificate = async () => {
    if (!activeCourse) return;
    try {
      const res = await api.get(`/certificates/${activeCourse.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${activeCourse.title}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err: any) {
      alert('Certificate not ready! Have you completed all chapters?');
    }
  };

  // --- VIEW 1: ALL COURSES LIST ---
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🎓 My Learning</h1>
            <p className="text-gray-500">Welcome, {user?.userId}</p>
          </div>
          <button onClick={logout} className="text-gray-600 underline">Logout</button>
        </div>

        {assignedCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded shadow">
            <h2 className="text-xl text-gray-500">No courses assigned yet.</h2>
            <p className="text-gray-400">Wait for your mentor to assign you a course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedCourses.map(course => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2 text-blue-600">{course.title}</h2>
                  <p className="text-gray-600 mb-4 h-12 overflow-hidden text-sm">{course.description}</p>
                  
                  {/* NEW: VISUAL PROGRESS BAR */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-gray-500">Progress</span>
                      <span className="font-bold text-blue-600">{progressStats[course.id] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progressStats[course.id] || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => openCourse(course)}
                  className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 mt-2"
                >
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: COURSE CONTENT PLAYER ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow p-4 flex justify-between items-center px-8 sticky top-0 z-10">
        <div>
          <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-black mb-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{activeCourse?.title}</h1>
        </div>
        <button 
          onClick={downloadCertificate}
          className="bg-yellow-500 text-white px-6 py-2 rounded shadow hover:bg-yellow-600 font-bold flex items-center gap-2"
        >
          🏆 Download Certificate
        </button>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const isUnlocked = chapter.sequence_order === 1 || completedOrders.includes(chapter.sequence_order - 1);
            const isCompleted = completedOrders.includes(chapter.sequence_order);

            return (
              <div 
                key={chapter.id} 
                className={`border rounded-lg p-6 transition shadow-sm ${
                  isUnlocked ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${isUnlocked ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                        Chapter {chapter.sequence_order}
                      </span>
                      {!isUnlocked && <span className="text-xs text-red-500 font-bold">🔒 LOCKED</span>}
                      {isCompleted && <span className="text-xs text-green-600 font-bold">✅ COMPLETED</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{chapter.title}</h3>
                  </div>
                  
                  {isUnlocked && !isCompleted && (
                    <button 
                      onClick={() => handleComplete(chapter)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-sm text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>

                {isUnlocked && (
                  <div className="mt-4 space-y-4">
                    {/* NEW: DISPLAY IMAGE IF EXISTS */}
                    {chapter.image_url && (
                        <div className="mb-4">
                            <img src={chapter.image_url} alt="Chapter Diagram" className="max-w-full h-auto rounded border" />
                        </div>
                    )}

                    {chapter.content_url && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-100 text-blue-700">
                         🎥 <a href={chapter.content_url} target="_blank" rel="noreferrer" className="underline font-medium hover:text-blue-900">
                           Watch Video / View Resources
                         </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;