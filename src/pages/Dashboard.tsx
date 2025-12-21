import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Chapter {
  id: number;
  title: string;
  description?: string; // ✅ NEW
  sequence_order: number;
  content_url?: string;
  image_url?: string;   // ✅ NEW
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
  const [view, setView] = useState<'list' | 'view'>('list');
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [progressStats, setProgressStats] = useState<Record<string, number>>({});
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedOrders, setCompletedOrders] = useState<number[]>([]); 

  useEffect(() => {
    fetchAssignedCourses();
    fetchProgress(); 
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
      
      // ✅ FETCH ACTUAL COMPLETED CHAPTERS FROM BACKEND
      fetchCompletedChapters(course.id);
      
      setView('view');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot access course');
    }
  };

  const fetchCompletedChapters = async (courseId: string) => {
    try {
      const res = await api.get(`/progress/course/${courseId}`);
      // Backend should return array of completed sequence_order numbers
      const completed = res.data.completedSequences || [];
      setCompletedOrders(completed);
    } catch (err) {
      console.error("Failed to fetch completed chapters", err);
      setCompletedOrders([0]); // Default to just first chapter unlocked
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
      setCompletedOrders((prev) => [...prev, chapter.sequence_order]);
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

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-900">
        <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">📚</div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">LearnHub Student</h1>
                <p className="text-xs text-slate-500">Learning Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right border-r border-slate-200 pr-4 hidden md:block">
                <p className="text-xs text-slate-500 font-mono">ID: {user?.userId?.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-semibold text-slate-900">Student</p>
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">My Learning</h2>
            <p className="text-slate-600">Continue your courses and track your progress</p>
          </div>

          {assignedCourses.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
              <div className="text-6xl mb-4 opacity-30">📚</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Courses Yet</h3>
              <p className="text-slate-600">Wait for your mentor to assign you courses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedCourses.map(course => {
                const progress = progressStats[course.id] || 0;
                return (
                  <div key={course.id} className="bg-white rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-slate-900 flex-1">{course.title}</h3>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                          {progress}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-6 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-bold text-slate-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <button 
                        onClick={() => openCourse(course)} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm hover:shadow-lg shadow-indigo-200 transition-all"
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => setView('list')} 
            className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            ← Back to Courses
          </button>
          <h1 className="font-bold text-slate-900 text-center flex-1">{activeCourse?.title}</h1>
          <button 
            onClick={downloadCertificate} 
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg shadow-indigo-200 transition-all"
          >
            🏆 Get Certificate
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-10 space-y-6">
        {chapters.map((chapter) => {
          const isUnlocked = chapter.sequence_order === 1 || completedOrders.includes(chapter.sequence_order - 1);
          const isCompleted = completedOrders.includes(chapter.sequence_order);

          return (
            <div 
              key={chapter.id} 
              className={`bg-white border-2 rounded-xl overflow-hidden transition-all ${
                isUnlocked 
                  ? 'border-slate-300 shadow-sm hover:shadow-md' 
                  : 'border-slate-200 opacity-60 pointer-events-none'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        CH {chapter.sequence_order}
                      </span>
                      {!isUnlocked && <span className="text-xs font-bold text-slate-600 flex items-center gap-1">🔒 Locked</span>}
                      {isCompleted && <span className="text-xs font-bold text-green-600 flex items-center gap-1">✅ Completed</span>}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{chapter.title}</h3>
                    
                    {chapter.description && (
                      <p className="text-slate-600 text-sm">{chapter.description}</p>
                    )}
                    {!chapter.description && (
                      <p className="text-slate-400 text-sm italic">No description provided</p>
                    )}
                  </div>
                  {isUnlocked && !isCompleted && (
                    <button 
                      onClick={() => handleComplete(chapter)} 
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap hover:shadow-lg shadow-indigo-200 transition-all"
                    >
                      ✓ Mark Done
                    </button>
                  )}
                </div>
              </div>

              {isUnlocked && (
                <div className="border-t border-slate-100 p-6 bg-slate-50 space-y-4">
                  {chapter.image_url && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chapter Resource</p>
                      <img 
                        src={chapter.image_url} 
                        alt="Chapter Resource" 
                        className="rounded-lg border border-slate-200 max-h-80 object-cover w-full" 
                      />
                    </div>
                  )}
                  
                  {chapter.content_url && (
                    <a 
                      href={chapter.content_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-4 p-4 bg-white border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">🎥</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">Watch Video Content</div>
                        <div className="text-xs text-indigo-600 group-hover:underline">Click to open in new tab →</div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default StudentDashboard;