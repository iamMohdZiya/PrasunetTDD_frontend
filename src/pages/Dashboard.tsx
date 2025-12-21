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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans">
        <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <h1 className="font-bold text-lg text-slate-900">Student Dashboard</h1>
            </div>
            <button onClick={logout} className="text-sm bg-slate-100 px-4 py-2 rounded-lg font-medium">Sign Out</button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">My Learning</h2>
            <p className="text-slate-600">Welcome back, {user?.userId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignedCourses.map(course => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{course.title}</h3>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {progressStats[course.id] || 0}%
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{course.description}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progressStats[course.id] || 0}%` }}></div>
                </div>
                <button onClick={() => openCourse(course)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Continue Learning</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm px-8 py-4 flex justify-between items-center">
        <button onClick={() => setView('list')} className="text-sm font-bold text-slate-600">← Back</button>
        <h1 className="font-bold text-slate-900">{activeCourse?.title}</h1>
        <button onClick={downloadCertificate} className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm">🏆 Certificate</button>
      </div>

      <main className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {chapters.map((chapter) => {
          const isUnlocked = chapter.sequence_order === 1 || completedOrders.includes(chapter.sequence_order - 1);
          const isCompleted = completedOrders.includes(chapter.sequence_order);

          return (
            <div key={chapter.id} className={`bg-white border rounded-xl overflow-hidden ${isUnlocked ? 'border-slate-300 shadow-sm' : 'border-slate-200 opacity-60'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">CH {chapter.sequence_order}</span>
                      {!isUnlocked && <span className="text-xs font-bold text-red-500 flex items-center">🔒 Locked</span>}
                      {isCompleted && <span className="text-xs font-bold text-green-600 flex items-center">✅ Completed</span>}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{chapter.title}</h3>
                    
                    {/* ✅ NEW: Description Display */}
                    {chapter.description && <p className="text-slate-600 mt-2 text-sm">{chapter.description}</p>}
{!chapter.description && <p className="text-slate-400 mt-2 text-sm italic">No description provided</p>}
                  </div>
                  {isUnlocked && !isCompleted && (
                    <button onClick={() => handleComplete(chapter)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Mark Done</button>
                  )}
                </div>
              </div>

              {isUnlocked && (
                <div className="border-t border-slate-100 p-6 bg-slate-50 space-y-4">
                  {/* ✅ NEW: Image Display */}
                  {chapter.image_url && (
                    <img src={chapter.image_url} alt="Chapter Resource" className="rounded-lg border border-slate-200 max-h-80 object-cover w-full" />
                  )}
                  
                  {chapter.content_url && (
                    <a href={chapter.content_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all group">
                      <span className="text-2xl">🎥</span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Watch Video Content</div>
                        <div className="text-xs text-blue-600 group-hover:underline">Open Resource →</div>
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