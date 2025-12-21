import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
}

const MentorDashboard = () => {
  const { logout, user } = useAuth();
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States (Course)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Form States (Chapter)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState('');
  
  // ✅ FIX 1: Added missing states
  const [chapterDesc, setChapterDesc] = useState(''); 
  const [imageUrl, setImageUrl] = useState(''); 
  
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
      // ✅ FIX 2: Sending the new fields to the Backend
      await api.post(`/courses/${selectedCourseId}/chapters`, {
        title: chapterTitle,
        description: chapterDesc,  // <--- Backend needs this!
        imageUrl: imageUrl,        // <--- Backend needs this!
        sequenceOrder: sequence,
        contentUrl: contentUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      alert('✅ Chapter Added!');
      
      // Reset Form
      setChapterTitle(''); 
      setChapterDesc(''); 
      setContentUrl(''); 
      setImageUrl('');
      setSequence(prev => prev + 1);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-900">
      
      <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">👨‍🏫</div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">LearnHub Mentor</h1>
              <p className="text-xs text-slate-500">Instructor Dashboard</p>
            </div>
          </div>
          <button onClick={logout} className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all">Sign Out</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Create Course Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-slate-200 shadow-md p-6 sticky top-28">
              <h3 className="font-bold text-slate-900 mb-4">New Course</h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <input className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg" placeholder="Course Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <textarea className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg h-24" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
                <button disabled={loading} className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold">Create</button>
              </form>
            </div>
          </div>

          {/* Manage Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <label className="block font-bold text-xs uppercase text-slate-500 mb-2">Select Course</label>
              <select className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Add Chapter Form */}
              <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 ${!selectedCourseId ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-slate-900 mb-4">Add Chapter</h3>
                <form onSubmit={handleAddChapter} className="space-y-3">
                  <input className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm" placeholder="Chapter Title" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} required />
                  
                  {/* ✅ FIX 3: Added Description Input */}
                  <textarea 
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm h-20" 
                    placeholder="Chapter Description (What will they learn?)" 
                    value={chapterDesc} 
                    onChange={e => setChapterDesc(e.target.value)} 
                    required 
                  />
                  
                  {/* ✅ FIX 4: Added Image URL Input */}
                  <input 
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm" 
                    placeholder="Image URL (Optional)" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)} 
                  />
                  
                  <input className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm" placeholder="Video URL" value={contentUrl} onChange={e => setContentUrl(e.target.value)} required />
                  <input type="number" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm" placeholder="Sequence (e.g. 1)" value={sequence} onChange={e => setSequence(Number(e.target.value))} required />
                  
                  <button disabled={loading} className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-sm">+ Add Chapter</button>
                </form>
              </div>

              {/* Assign Student Form */}
              <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 ${!selectedCourseId ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-slate-900 mb-4">Enroll Student</h3>
                <form onSubmit={handleAssignStudent} className="space-y-3">
                  <input type="email" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm" placeholder="student@email.com" value={assignEmail} onChange={e => setAssignEmail(e.target.value)} required />
                  <button disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">Assign Access</button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;