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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-lg">📚</div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">LearnHub</h1>
                <p className="text-xs text-slate-500">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right border-r border-slate-200 pr-4">
                <p className="text-xs text-slate-500 font-mono">ID: {user?.userId?.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm font-semibold text-slate-900">{user?.role === 'student' ? 'Student' : 'User'}</p>
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

        <main className="max-w-7xl mx-auto px-8 py-12 flex-1">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back!</h2>
            <p className="text-slate-600 mt-2">Continue your learning journey and earn certificates</p>
          </div>

          {/* Courses Grid */}
          {assignedCourses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Courses Yet</h3>
              <p className="text-slate-600">Wait for your mentor to assign you a course. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-200 overflow-hidden group">
                  {/* Card Header with Progress */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight flex-1">{course.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (progressStats[course.id] || 0) === 100 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {(progressStats[course.id] || 0) === 100 ? '✅ Complete' : 'In Progress'}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-6 py-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{progressStats[course.id] || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-blue-600/30" 
                        style={{ width: `${progressStats[course.id] || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-6 py-4 border-t border-slate-200">
                    <button 
                      onClick={() => openCourse(course)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      {(progressStats[course.id] || 0) === 100 ? 'Review Course' : 'Continue Learning'} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- VIEW 2: COURSE CONTENT PLAYER ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')} 
              className="text-sm text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all"
            >
              ← Back to Courses
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{activeCourse?.title}</h1>
              <p className="text-xs text-slate-500 font-mono">Learning in progress</p>
            </div>
          </div>
          <button 
            onClick={downloadCertificate}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg font-bold flex items-center gap-2 transition-all transform active:scale-95"
          >
            🏆 Get Certificate
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
        <div className="space-y-5">
          {chapters.map((chapter) => {
            const isUnlocked = chapter.sequence_order === 1 || completedOrders.includes(chapter.sequence_order - 1);
            const isCompleted = completedOrders.includes(chapter.sequence_order);

            return (
              <div 
                key={chapter.id} 
                className={`border-2 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md ${
                  isUnlocked 
                    ? 'border-slate-300 bg-white hover:border-blue-400' 
                    : 'border-slate-200 bg-slate-50 opacity-70'
                }`}
              >
                {/* Chapter Header */}
                <div className={`p-6 ${isUnlocked && !isCompleted ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className={`px-4 py-1 rounded-full text-xs font-bold ${
                          isUnlocked 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          Chapter {chapter.sequence_order}
                        </div>
                        {!isUnlocked && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">🔒 Locked</span>}
                        {isCompleted && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✅ Completed</span>}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{chapter.title}</h3>
                    </div>
                    
                    {isUnlocked && !isCompleted && (
                      <button 
                        onClick={() => handleComplete(chapter)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl font-bold transition-all transform active:scale-95 whitespace-nowrap"
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Chapter Content */}
                {isUnlocked && (
                  <div className="p-6 space-y-5 border-t border-slate-200">
                    {/* Image Display */}
                    {chapter.image_url && (
                      <div className="rounded-lg overflow-hidden border border-slate-300">
                        <img 
                          src={chapter.image_url} 
                          alt="Chapter Content" 
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Video/Content Link */}
                    {chapter.content_url && (
                      <a 
                        href={chapter.content_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all group"
                      >
                        <span className="text-4xl">🎥</span>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">Watch Video & Resources</div>
                          <div className="text-sm text-slate-600">Click to view course materials</div>
                        </div>
                        <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Locked State Message */}
                {!isUnlocked && (
                  <div className="p-6 text-center text-slate-600">
                    <span className="text-3xl">🔐</span>
                    <p className="mt-2 font-medium">Complete Chapter {chapter.sequence_order - 1} to unlock this chapter</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">LearnHub</span>
              <span className="text-sm text-slate-500">© 2024 Internship LMS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition">Contact Support</a>
            </div>
            <div className="text-xs text-slate-500">
              <p>Student ID: {user?.userId?.slice(0, 12).toUpperCase()}</p>
              <p>Version 1.0 | Last Updated: Dec 2024</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;