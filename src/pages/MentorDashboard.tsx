import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
}

const MentorDashboard = () => {
  const { user, logout } = useAuth();
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Course Form States (Create / Edit)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState('');

  // Chapter Form States
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // NEW: Image Support
  const [sequence, setSequence] = useState(1);

  // Assign Student State
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

  // --- COURSE MANAGEMENT (CREATE / UPDATE / DELETE) ---

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // UPDATE Existing Course
        await api.put(`/courses/${editCourseId}`, { title, description });
        alert('✅ Course Updated!');
        setIsEditing(false);
        setEditCourseId('');
      } else {
        // CREATE New Course
        await api.post('/courses', { title, description });
        alert('✅ Course Created!');
      }
      // Reset Form
      setTitle(''); setDescription('');
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    if (!selectedCourseId) return;
    const courseToEdit = courses.find(c => c.id === selectedCourseId);
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setDescription(courseToEdit.description || '');
      setEditCourseId(selectedCourseId);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;
    if (!window.confirm("⚠️ Are you sure? This will delete the course, all chapters, and student progress.")) return;

    try {
      await api.delete(`/courses/${selectedCourseId}`);
      alert('🗑️ Course Deleted');
      setSelectedCourseId(''); 
      fetchMyCourses(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // --- CONTENT MANAGEMENT (CHAPTERS) ---

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Select a course first!');
    setLoading(true);
    try {
      await api.post(`/courses/${selectedCourseId}/chapters`, {
        title: chapterTitle,
        sequenceOrder: sequence,
        contentUrl: contentUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        imageUrl: imageUrl || '' 
      });
      alert('✅ Chapter Added!');
      setChapterTitle(''); setContentUrl(''); setImageUrl(''); setSequence(prev => prev + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  // --- STUDENT ASSIGNMENT ---

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-800">👨‍🏫 Mentor Dashboard</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600">ID: {user?.userId.slice(0,8)}...</span>
          <button onClick={logout} className="text-red-500 font-medium hover:underline">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: CREATE / EDIT COURSE */}
        <div className={`bg-white p-6 rounded shadow border-l-4 ${isEditing ? 'border-yellow-500' : 'border-blue-500'}`}>
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? '✏️ Edit Course' : '1. Create Course'}
          </h2>
          
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <input 
              placeholder="Course Title" 
              className="w-full border p-2 rounded" 
              value={title} onChange={e => setTitle(e.target.value)} required 
            />
            <textarea 
              placeholder="Description" 
              className="w-full border p-2 rounded h-24" 
              value={description} onChange={e => setDescription(e.target.value)} required 
            />
            
            <div className="flex gap-2">
              <button disabled={loading} className={`flex-1 text-white p-2 rounded ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? 'Processing...' : (isEditing ? 'Update Course' : 'Create Course')}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setTitle(''); setDescription(''); setEditCourseId(''); }}
                  className="bg-gray-200 text-gray-700 px-4 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SECTION 2: MANAGE CONTENT */}
        <div className="space-y-8">
          
          {/* SELECTOR & ACTIONS */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Select Working Course</h2>
            <div className="flex gap-2">
                <select 
                  className="w-full border p-2 rounded"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                
                <button 
                    onClick={startEdit}
                    disabled={!selectedCourseId}
                    className="bg-yellow-100 text-yellow-700 px-3 rounded hover:bg-yellow-200 border border-yellow-300"
                    title="Edit Course Details"
                >
                    ✏️
                </button>
                
                <button 
                    onClick={handleDeleteCourse}
                    disabled={!selectedCourseId}
                    className="bg-red-50 text-red-600 px-3 rounded hover:bg-red-100 border border-red-200"
                    title="Delete Course"
                >
                    🗑️
                </button>
            </div>
          </div>

          {/* ADD CHAPTER FORM */}
          <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-4">2. Add Chapter</h2>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <input 
                placeholder="Chapter Title" 
                className="w-full border p-2 rounded" 
                value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} 
                disabled={!selectedCourseId} required 
              />
              <input 
                placeholder="Video Link (YouTube/Drive)" 
                className="w-full border p-2 rounded" 
                value={contentUrl} onChange={e => setContentUrl(e.target.value)} 
                disabled={!selectedCourseId} required 
              />
               <input 
                placeholder="Image URL (Optional Diagram/Thumbnail)" 
                className="w-full border p-2 rounded" 
                value={imageUrl} onChange={e => setImageUrl(e.target.value)} 
                disabled={!selectedCourseId} 
              />
              <div className="flex items-center gap-2">
                <label>Sequence:</label>
                <input 
                  type="number" 
                  className="w-20 border p-2 rounded" 
                  value={sequence} onChange={e => setSequence(Number(e.target.value))} 
                  disabled={!selectedCourseId} required 
                />
              </div>
              <button disabled={loading || !selectedCourseId} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-300">
                Add Chapter
              </button>
            </form>
          </div>

          {/* ASSIGN STUDENT FORM */}
          <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
            <h2 className="text-xl font-bold mb-4">3. Assign Student</h2>
            <form onSubmit={handleAssignStudent} className="flex gap-2">
              <input 
                type="email" 
                placeholder="student@example.com" 
                className="flex-1 border p-2 rounded" 
                value={assignEmail} onChange={e => setAssignEmail(e.target.value)} 
                disabled={!selectedCourseId} required 
              />
              <button disabled={loading || !selectedCourseId} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-300">
                Assign
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;