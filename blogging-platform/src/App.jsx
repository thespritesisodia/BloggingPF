import { useState, useEffect } from 'react'
import './index.css'
import DarkModeIcon from './assets/darkmode.png';
import AdminIcon from './assets/admin.png';
import MyXIcon from './assets/myxicon.png';

const PROFILE_IMG = MyXIcon;
const X_LINK = 'https://x.com/basbhaisprite';

function SunIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
  );
}

function MoonIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
  );
}

function App() {
  // Classic black look: no light mode
  const [blog, setBlog] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [loginError, setLoginError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [dark, setDark] = useState(true); // Default to dark mode
  const [showPassword, setShowPassword] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [sections, setSections] = useState([
    { type: 'text', content: '' }
  ]);

  // Fetch blogs from backend
  useEffect(() => {
    fetch('http://localhost:5050/api/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(() => setBlogs([]));
  }, [publishSuccess]);

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setIsAdmin(true);
        setToken(data.token);
        setShowLogin(false);
        setAdminPassword('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Login failed');
    }
  };

  // Add section
  const addSection = (type, idx) => {
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, { type, content: '' });
    setSections(newSections);
  };
  // Remove section
  const removeSection = (idx) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, i) => i !== idx));
  };
  // Update section content
  const updateSection = (idx, value) => {
    const newSections = [...sections];
    newSections[idx].content = value;
    setSections(newSections);
  };

  // Handle blog publish (section-based)
  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishError('');
    setPublishSuccess('');
    if (!blogTitle || !sections.length || sections.some(s => !s.content.trim())) {
      setPublishError('Title and all sections are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:5050/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: blogTitle, sections })
      });
      const data = await res.json();
      if (res.ok) {
        setPublishSuccess('Blog published!');
        setBlogTitle('');
        setSections([{ type: 'text', content: '' }]);
      } else {
        setPublishError(data.error || 'Failed to publish');
      }
    } catch (err) {
      setPublishError('Failed to publish');
    }
  };

  // Handle blog delete (admin only)
  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const res = await fetch(`http://localhost:5050/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPublishSuccess('Blog deleted!');
        setBlogs(blogs.filter(blog => blog._id !== id));
      } else {
        const data = await res.json();
        setPublishError(data.error || 'Failed to delete');
      }
    } catch (err) {
      setPublishError('Failed to delete');
    }
  };

  // Handle blog update (admin only)
  const handleEditBlog = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!editTitle || !editContent) {
      setEditError('Title and content are required');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5050/api/blogs/${editingBlog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      const data = await res.json();
      if (res.ok) {
        setEditSuccess('Blog updated!');
        setEditingBlog(null);
        setEditTitle('');
        setEditContent('');
        // Update blogs in state
        setBlogs(blogs.map(b => b._id === data._id ? data : b));
      } else {
        setEditError(data.error || 'Failed to update');
      }
    } catch (err) {
      setEditError('Failed to update');
    }
  };

  // Check if user has liked a blog
  const hasUserLiked = (blogId) => {
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
    return likedBlogs.includes(blogId);
  };

  // Handle blog like
  const handleLike = async (blogId) => {
    // Check if user has already liked this blog
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
    if (likedBlogs.includes(blogId)) {
      alert('You have already liked this blog!');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5050/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        // Add blog to liked blogs in localStorage
        likedBlogs.push(blogId);
        localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
        
        // Update the blog's likes count in real-time
        setBlogs(blogs.map(blog => 
          blog._id === blogId ? { ...blog, likes: data.likes } : blog
        ));
        // Also update selectedBlog if it's the same blog
        if (selectedBlog && selectedBlog._id === blogId) {
          setSelectedBlog({ ...selectedBlog, likes: data.likes });
        }
      }
    } catch (err) {
      console.error('Failed to like blog:', err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAdmin(false);
    setToken('');
  };

  // Upload image handler
  const handleImageUpload = async (file, idx) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:5050/api/blogs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        updateSection(idx, data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors relative ${dark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Top right: Admin controls */}
      <div className="fixed top-4 right-4 flex items-center space-x-2 z-50 sm:absolute sm:top-6 sm:right-8">
        {!isAdmin ? (
          <>
            <button
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded shadow border border-gray-700"
              onClick={() => setShowLogin((v) => !v)}
              aria-label="Admin Login"
            >
              <img src={AdminIcon} alt="Admin" className="w-5 h-5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
            {/* Login Form Dropdown */}
            {showLogin && (
              <div className="absolute top-12 right-0 bg-gray-900 border border-gray-700 rounded shadow-lg p-4 w-64">
                <form onSubmit={handleAdminLogin}>
                  <label className="block mb-2 text-sm font-semibold">Admin Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-2 rounded border border-gray-600 bg-black text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.642 1.624-1.09 2.354M15.54 15.54A5.978 5.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.828.162-1.618.458-2.354" /></svg>
                      )}
                    </button>
                  </div>
                  {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
                  <button
                    type="submit"
                    className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors"
                  >
                    Login
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <strong className="bold-important">Sprite Nestorial Sisodia</strong>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded shadow border border-gray-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center space-y-8 w-full mt-4 sm:mt-6 px-2 sm:px-0">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            {/* Profile Button */}
            <a href={X_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80">
              <img src={PROFILE_IMG} alt="Profile" className="w-10 h-10 rounded-full border border-gray-700" />
            </a>
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDark((d) => !d)}
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow transition-colors border ${dark ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300 border-gray-300'}`}
              aria-label="Toggle theme"
            >
              <span className="text-2xl font-bold">{dark ? 'L' : 'D'}</span>
            </button>
          </div>
          {/* About Me Section */}
          {!isAdmin && (
            <div className="max-w-xl w-full bg-opacity-60 rounded-lg p-4 sm:p-6 mb-2 text-center border border-gray-700 mx-auto text-sm sm:text-base" style={{background: dark ? 'rgba(30,30,30,0.7)' : 'rgba(240,240,240,0.7)'}}>
              <span className="text-2xl">📚☕</span>
              <p className="text-base mt-2">
                Hi, I’m Sprite Nestorial Sisodia, a passionate Full Stack Developer who loves building clean, modern UIs and crafting intuitive user experiences across the stack. Whether it’s frontend design or backend logic, I enjoy turning complex problems into simple, elegant solutions.<br/><br/>
                When I'm not coding, you'll probably find me with a cup of coffee, exploring new tech, or just enjoying the perfect blend of Code and Coffee.
              </p>
            </div>
          )}
          {/* Blog Publishing Form (admin only) */}
          {isAdmin && (
            <form className="w-full sm:w-2/3 flex flex-col space-y-2 mx-auto" onSubmit={handlePublish}>
              <input
                className="p-2 rounded border border-gray-700 bg-black text-white text-lg placeholder-gray-400 mb-2 w-full"
                placeholder="Blog Title"
                value={blogTitle}
                onChange={e => setBlogTitle(e.target.value)}
              />
              {sections.map((section, idx) => (
                <div key={idx} className="relative mb-2">
                  {section.type === 'text' ? (
                    <textarea
                      className="w-full h-24 p-2 rounded border border-gray-700 bg-black text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg placeholder-gray-400"
                      placeholder="Write your blog text..."
                      value={section.content}
                      onChange={e => updateSection(idx, e.target.value)}
                    />
                  ) : section.type === 'code' ? (
                    <textarea
                      className="w-full h-24 p-2 rounded border border-blue-700 bg-gray-900 text-blue-200 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-blue-400"
                      placeholder="Write your code snippet..."
                      value={section.content}
                      onChange={e => updateSection(idx, e.target.value)}
                      spellCheck={false}
                    />
                  ) : section.type === 'heading' ? (
                    <input
                      className="w-full p-2 rounded border border-green-700 bg-black text-green-300 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                      placeholder="Heading..."
                      value={section.content}
                      onChange={e => updateSection(idx, e.target.value)}
                    />
                  ) : section.type === 'image' ? (
                    <div className="flex flex-col gap-2">
                      <input
                        className="w-full p-2 rounded border border-purple-700 bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
                        placeholder="Image URL..."
                        value={section.content}
                        onChange={e => updateSection(idx, e.target.value)}
                        type="url"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-800"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0], idx);
                          }
                        }}
                      />
                      {section.content && (
                        <img src={section.content} alt="Preview" className="max-h-40 rounded border border-purple-700 mt-2 mx-auto" />
                      )}
                    </div>
                  ) : null}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button type="button" onClick={() => addSection('code', idx)} title="Add code block" className="px-2 py-1 bg-blue-700 text-white rounded text-xs">{'</>'}</button>
                    <button type="button" onClick={() => addSection('text', idx)} title="Add text block" className="px-2 py-1 bg-gray-700 text-white rounded text-xs">T</button>
                    <button type="button" onClick={() => addSection('heading', idx)} title="Add heading" className="px-2 py-1 bg-green-700 text-white rounded text-xs font-bold">H</button>
                    <button type="button" onClick={() => addSection('image', idx)} title="Add image" className="px-2 py-1 bg-purple-700 text-white rounded text-xs">🖼️</button>
                    <button type="button" onClick={() => removeSection(idx)} title="Remove section" className="px-2 py-1 bg-red-700 text-white rounded text-xs">✕</button>
                  </div>
                </div>
              ))}
              {publishError && <div className="text-red-500 text-sm mb-2">{publishError}</div>}
              {publishSuccess && <div className="text-green-500 text-sm mb-2">{publishSuccess}</div>}
              <button
                type="submit"
                className="px-6 py-2 sm:px-8 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors w-full sm:w-auto"
              >
                Publish
              </button>
            </form>
          )}
          {/* Blog List (public) or Blog Detail */}
          <div className="w-full max-w-5xl mt-8 sm:mt-20">
            {selectedBlog ? (
              <div className={`p-4 sm:p-8 rounded ${dark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} border shadow`}>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="mb-4 sm:mb-6 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow w-full sm:w-auto"
                >
                  ← Back to all blogs
                </button>
                <div className={`text-2xl sm:text-3xl font-bold mb-4 uppercase ${dark ? 'text-white' : 'text-black'}`}>{selectedBlog.title}</div>
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => handleLike(selectedBlog._id)}
                    className={`flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors ${hasUserLiked(selectedBlog._id) ? 'opacity-70' : ''}`}
                  >
                    <svg
                      className="w-6 h-6 drop-shadow"
                      fill={hasUserLiked(selectedBlog._id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 20 20"
                      style={{ filter: !hasUserLiked(selectedBlog._id) ? 'drop-shadow(0 0 2px #f87171)' : '' }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-lg font-semibold">{selectedBlog.likes || 0}</span>
                  </button>
                </div>
                <div className={`mb-6 ${dark ? 'text-gray-300' : 'text-gray-800'} text-base sm:text-lg`}>
                  {selectedBlog.sections && selectedBlog.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      {section.type === 'text' && (
                        <div className="text-lg whitespace-pre-line">{section.content}</div>
                      )}
                      {section.type === 'heading' && (
                        <div className="text-2xl font-bold mb-2">{section.content}</div>
                      )}
                      {section.type === 'code' && (
                        <pre className="bg-gray-800 text-blue-200 p-4 rounded font-mono text-sm overflow-x-auto">{section.content}</pre>
                      )}
                      {section.type === 'image' && (
                        <div className="text-center">
                          <img src={section.content} alt="Blog image" className="max-w-full h-auto rounded" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-600'}`}>{new Date(selectedBlog.createdAt).toLocaleString()}</div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-gray-400 text-center text-lg">No blogs available</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {blogs.map(blog => (
                  <div
                    key={blog._id}
                    className={`flex flex-col justify-between h-full rounded-lg shadow-md border transition hover:scale-[1.02] cursor-pointer overflow-hidden ${dark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                  >
                    {/* Placeholder image */}
                    <div className="h-28 sm:h-36 w-full bg-gradient-to-br from-blue-400 to-blue-200 flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl text-white opacity-60">📝</span>
                    </div>
                    <div className="flex-1 flex flex-col p-3 sm:p-5">
                      <div className={`text-lg sm:text-xl font-bold mb-2 uppercase ${dark ? 'text-white' : 'text-black'}`}>{blog.title}</div>
                      <div className={`truncate mb-4 ${dark ? 'text-gray-300' : 'text-gray-800'} text-sm sm:text-base`}>
                        {blog.sections && blog.sections.length > 0 ? (
                          (() => {
                            const firstTextSection = blog.sections.find(s => s.type === 'text');
                            if (firstTextSection && firstTextSection.content) {
                              return firstTextSection.content.length > 120
                                ? firstTextSection.content.slice(0, 120) + '...'
                                : firstTextSection.content;
                            }
                            return 'No content available';
                          })()
                        ) : 'No content available'}
                      </div>
                      <div className={`text-xs mb-4 ${dark ? 'text-gray-500' : 'text-gray-600'}`}>{new Date(blog.createdAt).toLocaleString()}</div>
                      <div className="flex flex-col sm:flex-row items-center justify-between mt-auto space-y-2 sm:space-y-0">
                        <button
                          onClick={() => setSelectedBlog(blog)}
                          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow w-full sm:w-auto"
                        >
                          Read More
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLike(blog._id); }}
                          className={`flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors ${hasUserLiked(blog._id) ? 'opacity-70' : ''}`}
                        >
                          <svg
                            className="w-5 h-5 drop-shadow"
                            fill={hasUserLiked(blog._id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 20 20"
                            style={{ filter: !hasUserLiked(blog._id) ? 'drop-shadow(0 0 2px #f87171)' : '' }}
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-semibold">{blog.likes || 0}</span>
                        </button>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                          <button
                            onClick={e => { e.stopPropagation(); setEditingBlog(blog); setEditTitle(blog.title); setEditContent(blog.content); setEditError(''); setEditSuccess(''); }}
                            className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold shadow border border-yellow-600 self-start w-full sm:w-auto"
                          >
                            Edit
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteBlog(blog._id); }}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow border border-red-700 self-start w-full sm:w-auto"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Edit form modal */}
                    {editingBlog && editingBlog._id === blog._id && (
                      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-2">
                        <div className={`w-full max-w-md p-4 sm:p-6 rounded-lg shadow-lg border ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}` }>
                          <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Blog</h2>
                          <form onSubmit={handleEditBlog} className="flex flex-col space-y-2">
                            <input
                              className="p-2 rounded border border-gray-700 bg-black text-white text-lg placeholder-gray-400 mb-2 w-full"
                              placeholder="Blog Title"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                            />
                            <textarea
                              className="h-24 sm:h-32 p-4 rounded border border-gray-700 bg-black text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg placeholder-gray-400 mb-2 w-full"
                              placeholder="Write your blog content..."
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                            />
                            {editError && <div className="text-red-500 text-sm mb-2">{editError}</div>}
                            {editSuccess && <div className="text-green-500 text-sm mb-2">{editSuccess}</div>}
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <button
                                type="submit"
                                className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors w-full sm:w-auto"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBlog(null)}
                                className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow transition-colors w-full sm:w-auto"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;