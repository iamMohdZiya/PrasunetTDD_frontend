import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
}

const MentorDashboard = () => {
  // ✅ FIX: We are now using 'user' in the JSX below
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
  
  // Chapter Details
  const [chapterDesc, setChapterDesc] = useState(''); 
  const [imageUrl, setImageUrl] = useState(''); 
  const [contentUrl, setContentUrl] = useState('');
  const [sequence, setSequence] = useState(1);

  const [assignEmail, setAssignEmail] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterFields, setEditChapterFields] = useState({ title: '', description: '', image_url: '', content_url: '', sequence_order: 1 });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // Fetch chapters when a course is selected
  useEffect(() => {
    if (!selectedCourseId) {
      setChapters([]);
      return;
    }
    fetchChapters(selectedCourseId);
  }, [selectedCourseId]);

  const fetchChapters = async (courseId: string) => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setChapters(res.data.chapters || []);
    } catch (err) {
      console.error('Failed to load chapters', err);
      setChapters([]);
    }
  };

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
      // Sending data to backend
      await api.post(`/courses/${selectedCourseId}/chapters`, {
        title: chapterTitle,
        description: chapterDesc, 
        imageUrl: imageUrl,       
        sequenceOrder: sequence,
        contentUrl: contentUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      alert('✅ Chapter Added!');
      
      // Clear Form
      setChapterTitle(''); 
      setChapterDesc(''); 
      setContentUrl(''); 
      setImageUrl('');
      setSequence(prev => prev + 1);
      // refresh chapters
      if (selectedCourseId) fetchChapters(selectedCourseId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      await api.delete(`/courses/${selectedCourseId}/chapters/${chapterId}`);
      alert('🗑️ Chapter deleted');
      if (selectedCourseId) fetchChapters(selectedCourseId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete chapter');
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

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Permanently delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      alert('🗑️ Course deleted');
      // If the deleted course was selected, clear selection
      if (selectedCourseId === courseId) setSelectedCourseId('');
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course');
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
          
          {/* ✅ FIX: Added User Profile Section here to use the 'user' variable */}
          <div className="flex items-center gap-4">
            <div className="text-right border-r border-slate-200 pr-4 hidden md:block">
              <p className="text-xs text-slate-500 font-mono">ID: {user?.userId?.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm font-semibold text-slate-900">Mentor</p>
            </div>
            <button 
              onClick={logout} 
              className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all"
            >
              Sign Out
            </button>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Create Course */}
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

          {/* Manage Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <label className="block font-bold text-xs uppercase text-slate-500 mb-2">Select Course</label>
              <select className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Course List with actions */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map(c => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {editingCourseId === c.id ? (
                    <div className="space-y-2">
                      <input className="w-full px-3 py-2 border rounded" value={editCourseTitle} onChange={e => setEditCourseTitle(e.target.value)} />
                      <input className="w-full px-3 py-2 border rounded" value={editCourseDesc} onChange={e => setEditCourseDesc(e.target.value)} />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingCourseId(null); }} className="px-3 py-1 text-xs bg-slate-200 rounded">Cancel</button>
                        <button onClick={async () => {
                          try {
                            await api.put(`/courses/${c.id}`, { title: editCourseTitle, description: editCourseDesc });
                            alert('✅ Course updated');
                            setEditingCourseId(null);
                            fetchMyCourses();
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Failed to update course');
                          }
                        }} className="px-3 py-1 text-xs bg-amber-200 hover:bg-amber-300 rounded">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate mr-3">{c.title}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingCourseId(c.id); setEditCourseTitle(c.title); setEditCourseDesc((c as any).description || ''); }} className="px-3 py-1 text-xs bg-amber-200 hover:bg-amber-300 rounded">Edit</button>
                        <button onClick={() => handleDeleteCourse(c.id)} className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Chapter Form */}
              <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 ${!selectedCourseId ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-slate-900 mb-4">Add Chapter</h3>
                <form onSubmit={handleAddChapter} className="space-y-3">
                  <input className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm" placeholder="Chapter Title" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} required />
                  
                  <textarea 
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm h-20" 
                    placeholder="Chapter Description..." 
                    value={chapterDesc} 
                    onChange={e => setChapterDesc(e.target.value)} 
                    required 
                  />
                  
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

            {/* Chapters List */}
            {selectedCourseId && (
              <div className="mt-6 bg-white rounded-xl border-2 border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Chapters</h3>
                <div className="space-y-3">
                  {chapters.length === 0 && <div className="text-sm text-slate-500 italic">No chapters yet</div>}
                  {chapters.map(ch => (
                    <div key={ch.id} className="border rounded p-3 flex justify-between items-start">
                      {editingChapterId === String(ch.id) ? (
                        <div className="w-full space-y-2">
                          <input className="w-full px-3 py-2 border rounded" value={editChapterFields.title} onChange={e => setEditChapterFields({ ...editChapterFields, title: e.target.value })} />
                          <input className="w-full px-3 py-2 border rounded" value={editChapterFields.description} onChange={e => setEditChapterFields({ ...editChapterFields, description: e.target.value })} />
                          <input className="w-full px-3 py-2 border rounded" value={editChapterFields.image_url} onChange={e => setEditChapterFields({ ...editChapterFields, image_url: e.target.value })} />
                          <input className="w-full px-3 py-2 border rounded" value={editChapterFields.content_url} onChange={e => setEditChapterFields({ ...editChapterFields, content_url: e.target.value })} />
                          <input type="number" className="w-24 px-3 py-2 border rounded" value={editChapterFields.sequence_order} onChange={e => setEditChapterFields({ ...editChapterFields, sequence_order: Number(e.target.value) })} />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingChapterId(null)} className="px-3 py-1 text-xs bg-slate-200 rounded">Cancel</button>
                            <button onClick={async () => {
                              try {
                                await api.put(`/courses/${selectedCourseId}/chapters/${ch.id}`, {
                                  title: editChapterFields.title,
                                  description: editChapterFields.description,
                                  imageUrl: editChapterFields.image_url,
                                  contentUrl: editChapterFields.content_url,
                                  sequenceOrder: editChapterFields.sequence_order
                                });
                                alert('✅ Chapter updated');
                                setEditingChapterId(null);
                                fetchChapters(selectedCourseId);
                              } catch (err: any) {
                                alert(err.response?.data?.message || 'Failed to update chapter');
                              }
                            }} className="px-3 py-1 text-xs bg-amber-200 hover:bg-amber-300 rounded">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{ch.title} <span className="text-xs text-slate-500">(CH {ch.sequence_order})</span></div>
                            <div className="text-sm text-slate-600">{ch.description}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingChapterId(String(ch.id)); setEditChapterFields({ title: ch.title, description: ch.description || '', image_url: ch.image_url || '', content_url: ch.content_url || '', sequence_order: ch.sequence_order || 1 }); }} className="px-3 py-1 text-xs bg-amber-200 hover:bg-amber-300 rounded">Edit</button>
                              <button onClick={() => handleDeleteChapter(ch.id)} className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded">Delete</button>
                            </div>
                            {ch.image_url && <img src={ch.image_url} alt="thumb" className="w-24 h-16 object-cover rounded" />}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;