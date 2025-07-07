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

  // Handle blog publish
  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishError('');
    setPublishSuccess('');
    if (!blogTitle || !blogContent) {
      setPublishError('Title and content are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:5050/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: blogTitle, content: blogContent })
      });
      const data = await res.json();
      if (res.ok) {
        setPublishSuccess('Blog published!');
        setBlogTitle('');
        setBlogContent('');
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

  // Handle logout
  const handleLogout = () => {
    setIsAdmin(false);
    setToken('');
  };

  return (
    <div className={`w-screen flex items-center justify-start transition-colors relative ${dark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Top right: Admin controls */}
      <div className="absolute top-6 right-8 flex items-center space-x-2 z-50">
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
                  <input
                    type="password"
                    className="w-full p-2 rounded border border-gray-600 bg-black text-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                  />
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
            <span className="font-semibold text-base">Sprite Nestorial Sisodia</span>
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
      <div className="flex flex-col items-center space-y-8 w-full mt-6">
        <div className="flex space-x-6 items-center">
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
        <div className="max-w-xl w-full bg-opacity-60 rounded-lg p-6 mb-2 text-center border border-gray-700" style={{background: dark ? 'rgba(30,30,30,0.7)' : 'rgba(240,240,240,0.7)'}}>
          <span className="text-2xl">📚☕</span>
          <p className="text-base mt-2">
            Hi, I’m Sprite Nestorial Sisodia, a passionate Full Stack Developer who loves building clean, modern UIs and crafting intuitive user experiences across the stack. Whether it’s frontend design or backend logic, I enjoy turning complex problems into simple, elegant solutions.<br/><br/>
            When I'm not coding, you'll probably find me with a cup of coffee, exploring new tech, or just enjoying the perfect blend of Code and Coffee.
          </p>
        </div>
        {/* Blog Publishing Form (admin only) */}
        {isAdmin && (
          <form className="w-2/3 flex flex-col space-y-2" onSubmit={handlePublish}>
            <input
              className="p-2 rounded border border-gray-700 bg-black text-white text-lg placeholder-gray-400 mb-2"
              placeholder="Blog Title"
              value={blogTitle}
              onChange={e => setBlogTitle(e.target.value)}
            />
            <textarea
              className="h-40 p-4 rounded border border-gray-700 bg-black text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg placeholder-gray-400 mb-2"
              placeholder="Write your blog content..."
              value={blogContent}
              onChange={e => setBlogContent(e.target.value)}
            />
            {publishError && <div className="text-red-500 text-sm mb-2">{publishError}</div>}
            {publishSuccess && <div className="text-green-500 text-sm mb-2">{publishSuccess}</div>}
            <button
              type="submit"
              className="px-8 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors"
            >
              Publish
            </button>
          </form>
        )}
        {/* Blog List (public) or Blog Detail */}
        <div className="w-full max-w-xl mt-20">
          {selectedBlog ? (
            <div className={`p-8 rounded ${dark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} border shadow`}>
              <button
                onClick={() => setSelectedBlog(null)}
                className="mb-6 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow"
              >
                ← Back to all blogs
              </button>
              <div className={`text-3xl font-bold mb-4 ${dark ? 'text-white' : 'text-black'}`}>{selectedBlog.title}</div>
              <div className={`mb-6 whitespace-pre-line text-lg ${dark ? 'text-gray-300' : 'text-gray-800'}`}>{selectedBlog.content}</div>
              <div className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-600'}`}>{new Date(selectedBlog.createdAt).toLocaleString()}</div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-gray-400 text-center text-lg">No blogs available</div>
          ) : (
            blogs.map(blog => (
              <div
                key={blog._id}
                className={`mb-8 p-6 rounded cursor-pointer transition hover:scale-[1.01] ${dark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'} border shadow`}
                onClick={() => setSelectedBlog(blog)}
                title="Click to read more"
              >
                <div className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-black'}`}>{blog.title}</div>
                <div className={`truncate mb-2 ${dark ? 'text-gray-300' : 'text-gray-800'}`}>{blog.content.length > 200 ? blog.content.slice(0, 200) + '...' : blog.content}</div>
                <div className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-600'}`}>{new Date(blog.createdAt).toLocaleString()}</div>
                {isAdmin && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteBlog(blog._id); }}
                      className={`px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow border border-red-700`}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;