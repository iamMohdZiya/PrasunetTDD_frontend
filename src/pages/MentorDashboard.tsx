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
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">👨‍🏫</div>
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
              <h3 className="font-bold text-slate-900 mb-4 text-lg">📝 New Course</h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Course Title</label>
                  <input 
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg font-medium focus:border-indigo-500 focus:outline-none transition-colors" 
                    placeholder="e.g. React Basics" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Description</label>
                  <textarea 
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg h-24 font-medium focus:border-indigo-500 focus:outline-none transition-colors" 
                    placeholder="What will students learn?" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    required 
                  />
                </div>
                <button 
                  disabled={loading} 
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold hover:shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  ✨ Create Course
                </button>
              </form>
            </div>
          </div>

          {/* Manage Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <label className="block font-bold text-xs uppercase text-slate-600 mb-3">📌 Select a Course</label>
              <select 
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg font-medium focus:border-indigo-500 focus:outline-none transition-colors" 
                value={selectedCourseId} 
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">-- Choose a course to edit --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Course List with actions */}
            <div className="mt-6">
              <h3 className="font-bold text-slate-900 mb-4">📚 My Courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl border-2 border-slate-200 p-8 text-center">
                    <div className="text-4xl mb-3 opacity-40">📚</div>
                    <p className="text-slate-600 font-medium">No courses created yet</p>
                    <p className="text-sm text-slate-500 mt-1">Create a new course from the left panel</p>
                  </div>
                ) : (
                  courses.map(c => (
                    <div key={c.id} className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:shadow-md transition-all group">
                      {editingCourseId === c.id ? (
                        <div className="space-y-3">
                          <input 
                            className="w-full px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                            value={editCourseTitle} 
                            onChange={e => setEditCourseTitle(e.target.value)} 
                          />
                          <input 
                            className="w-full px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                            value={editCourseDesc} 
                            onChange={e => setEditCourseDesc(e.target.value)} 
                          />
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => { setEditingCourseId(null); }} 
                              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await api.put(`/courses/${c.id}`, { title: editCourseTitle, description: editCourseDesc });
                                  alert('✅ Course updated');
                                  setEditingCourseId(null);
                                  fetchMyCourses();
                                } catch (err: any) {
                                  alert(err.response?.data?.message || 'Failed to update course');
                                }
                              }} 
                              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-slate-900 truncate mb-2 text-sm">{c.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4">{(c as any).description || 'No description'}</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingCourseId(c.id); setEditCourseTitle(c.title); setEditCourseDesc((c as any).description || ''); }} 
                              className="flex-1 px-2 py-1.5 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded font-medium transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(c.id)} 
                              className="flex-1 px-2 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Chapter Form */}
              <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 ${!selectedCourseId ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-slate-900 mb-5 text-lg">📖 Add Chapter</h3>
                <form onSubmit={handleAddChapter} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Chapter Title</label>
                    <input 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-medium focus:border-green-500 focus:outline-none transition-colors" 
                      placeholder="e.g. Introduction to State" 
                      value={chapterTitle} 
                      onChange={e => setChapterTitle(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Description</label>
                    <textarea 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm h-20 font-medium focus:border-green-500 focus:outline-none transition-colors" 
                      placeholder="What will students learn in this chapter?" 
                      value={chapterDesc} 
                      onChange={e => setChapterDesc(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Image URL (Optional)</label>
                    <input 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-medium focus:border-green-500 focus:outline-none transition-colors" 
                      placeholder="https://example.com/image.jpg" 
                      value={imageUrl} 
                      onChange={e => setImageUrl(e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Video URL</label>
                    <input 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-medium focus:border-green-500 focus:outline-none transition-colors" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={contentUrl} 
                      onChange={e => setContentUrl(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Sequence Number</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-medium focus:border-green-500 focus:outline-none transition-colors" 
                      placeholder="1, 2, 3..." 
                      value={sequence} 
                      onChange={e => setSequence(Number(e.target.value))} 
                      required 
                    />
                  </div>
                  
                  <button 
                    disabled={loading} 
                    className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    ✨ Add Chapter
                  </button>
                </form>
              </div>

              {/* Assign Student Form */}
              <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 ${!selectedCourseId ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-slate-900 mb-5 text-lg">👤 Enroll Student</h3>
                <form onSubmit={handleAssignStudent} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Student Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none transition-colors" 
                      placeholder="student@example.com" 
                      value={assignEmail} 
                      onChange={e => setAssignEmail(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-sm">
                    <p className="text-blue-900 font-medium">💡 Tip</p>
                    <p className="text-blue-700 text-xs mt-1">Student will receive access to this course automatically</p>
                  </div>

                  <button 
                    disabled={loading} 
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    ➕ Assign Access
                  </button>
                </form>
              </div>
            </div>

            {/* Chapters List */}
            {selectedCourseId && (
              <div className="mt-8 bg-white rounded-xl border-2 border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-5 text-lg">📚 Course Chapters</h3>
                <div className="space-y-3">
                  {chapters.length === 0 && (
                    <div className="bg-slate-50 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
                      <div className="text-3xl mb-2 opacity-30">📖</div>
                      <p className="text-sm text-slate-600 font-medium">No chapters added yet</p>
                    </div>
                  )}
                  {chapters.map(ch => (
                    <div key={ch.id} className="border-2 border-slate-200 rounded-lg p-4 hover:shadow-md transition-all group">
                      {editingChapterId === String(ch.id) ? (
                        <div className="w-full space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Title</label>
                            <input 
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                              value={editChapterFields.title} 
                              onChange={e => setEditChapterFields({ ...editChapterFields, title: e.target.value })} 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Description</label>
                            <input 
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                              value={editChapterFields.description} 
                              onChange={e => setEditChapterFields({ ...editChapterFields, description: e.target.value })} 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Image URL</label>
                            <input 
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                              value={editChapterFields.image_url} 
                              onChange={e => setEditChapterFields({ ...editChapterFields, image_url: e.target.value })} 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Video URL</label>
                            <input 
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                              value={editChapterFields.content_url} 
                              onChange={e => setEditChapterFields({ ...editChapterFields, content_url: e.target.value })} 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase block mb-1">Sequence</label>
                            <input 
                              type="number" 
                              className="w-24 px-3 py-2 border-2 border-slate-200 rounded text-sm font-medium focus:border-purple-500 focus:outline-none" 
                              value={editChapterFields.sequence_order} 
                              onChange={e => setEditChapterFields({ ...editChapterFields, sequence_order: Number(e.target.value) })} 
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => setEditingChapterId(null)} 
                              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={async () => {
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
                              }} 
                              className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-full">CH {ch.sequence_order}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">{ch.title}</h4>
                              {ch.description && <p className="text-xs text-slate-600 mt-1">{ch.description}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingChapterId(String(ch.id)); setEditChapterFields({ title: ch.title, description: ch.description || '', image_url: ch.image_url || '', content_url: ch.content_url || '', sequence_order: ch.sequence_order || 1 }); }} 
                              className="flex-1 px-2 py-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-medium transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteChapter(ch.id)} 
                              className="flex-1 px-2 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors"
                            >
                              🗑️ Delete
                            </button>
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