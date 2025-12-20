import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
}

const MentorDashboard = () => {
  const { user, logout } = useAuth();
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [sequence, setSequence] = useState(1);

  const [assignEmail, setAssignEmail] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses/my');
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses");
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courses', { title, description });
      alert('✅ Course Created!');
      setTitle(''); setDescription('');
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Select a course first!');
    setLoading(true);
    try {
      await api.post(`/courses/${selectedCourseId}/chapters`, {
        title: chapterTitle,
        sequenceOrder: sequence,
        contentUrl: contentUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      alert('✅ Chapter Added!');
      setChapterTitle(''); setContentUrl(''); setSequence(prev => prev + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Select a course first!');
    setLoading(true);
    try {
      await api.post(`/courses/${selectedCourseId}/assign`, {
        studentEmail: assignEmail
      });
      alert('✅ Student Assigned!');
      setAssignEmail('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* 1. Top Navigation Bar */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 h-8 w-8 rounded flex items-center justify-center font-bold">M</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Instructor Hub</h1>
            <p className="text-xs text-slate-400">ID: {user?.userId.slice(0,8)}...</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded transition-colors text-slate-300 hover:text-white"
        >
          Sign Out
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Curriculum Management</h2>
          <p className="text-slate-500 text-sm mt-1">Create courses, add chapters, and enroll students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: CREATE COURSE */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-md text-xs font-bold">01</span>
                <h3 className="font-bold text-slate-800">Create New Course</h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Title</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. Advanced React Patterns" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                    <textarea 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm h-32 resize-none"
                      placeholder="Brief overview of what students will learn..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      required 
                    />
                  </div>
                  <button 
                    disabled={loading} 
                    className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all disabled:bg-slate-300"
                  >
                    {loading ? 'Creating...' : 'Create Course'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* COLUMN 2 & 3: MANAGE CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Context Selector */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Active Course</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm bg-white"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">-- Choose a course to manage --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="hidden md:block text-slate-300 text-4xl font-thin">/</div>
              <div className="text-sm text-slate-500 md:max-w-xs">
                Select a course from the dropdown to unlock chapter management and student enrollment features.
              </div>
            </div>

            {/* Content Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Add Chapter Card */}
              <div className={`bg-white rounded-xl border transition-all duration-300 ${selectedCourseId ? 'border-gray-200 shadow-sm opacity-100' : 'border-gray-100 opacity-60 grayscale'}`}>
                <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                   <span className="bg-green-100 text-green-700 p-1.5 rounded-md text-xs font-bold">02</span>
                   <h3 className="font-bold text-slate-800">Add Chapter Content</h3>
                </div>
                <div className="p-6">
                  <form onSubmit={handleAddChapter} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chapter Title</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm disabled:bg-gray-50"
                        placeholder="e.g. Introduction to Hooks" 
                        value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} 
                        disabled={!selectedCourseId} required 
                      />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Video URL</label>
                       <input 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm disabled:bg-gray-50"
                        placeholder="YouTube/Vimeo Link" 
                        value={contentUrl} onChange={e => setContentUrl(e.target.value)} 
                        disabled={!selectedCourseId} required 
                      />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sequence Order</label>
                       <input 
                        type="number"
                        className="w-24 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm disabled:bg-gray-50"
                        value={sequence} onChange={e => setSequence(Number(e.target.value))} 
                        disabled={!selectedCourseId} required 
                      />
                    </div>
                    <button disabled={loading || !selectedCourseId} className="w-full py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 shadow-sm transition-all disabled:bg-slate-300">
                      + Add Chapter
                    </button>
                  </form>
                </div>
              </div>

              {/* Assign Student Card */}
              <div className={`bg-white rounded-xl border transition-all duration-300 ${selectedCourseId ? 'border-gray-200 shadow-sm opacity-100' : 'border-gray-100 opacity-60 grayscale'}`}>
                <div className="bg-purple-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                   <span className="bg-purple-100 text-purple-700 p-1.5 rounded-md text-xs font-bold">03</span>
                   <h3 className="font-bold text-slate-800">Enroll Student</h3>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-500 mb-4">
                    Assign a student to <strong>{courses.find(c => c.id === selectedCourseId)?.title || 'selected course'}</strong> to grant them access.
                  </p>
                  <form onSubmit={handleAssignStudent} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Student Email</label>
                      <input 
                        type="email"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm disabled:bg-gray-50"
                        placeholder="student@example.com" 
                        value={assignEmail} onChange={e => setAssignEmail(e.target.value)} 
                        disabled={!selectedCourseId} required 
                      />
                    </div>
                    <button disabled={loading || !selectedCourseId} className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-sm transition-all disabled:bg-slate-300">
                      Assign Student
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;