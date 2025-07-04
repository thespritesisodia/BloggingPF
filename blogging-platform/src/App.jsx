import { useState } from 'react'
import './index.css'
import DarkModeIcon from './assets/darkmode.png';
import AdminIcon from './assets/admin.png'; // You need to add an admin icon image to assets

const PROFILE_IMG = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'; // Replace with your photo URL
const X_LINK = 'https://x.com/yourusername'; // Replace with your X (Twitter) profile link

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
  const [dark, setDark] = useState(true); // Default to dark mode
  const [blog, setBlog] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black text-white transition-colors relative">
      {/* Admin Login Button (top right) */}
      <button
        className="absolute top-6 right-8 flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded shadow border border-gray-700"
        onClick={() => setShowLogin((v) => !v)}
        aria-label="Admin Login"
      >
        <img src={AdminIcon} alt="Admin" className="w-5 h-5" />
        <span className="hidden sm:inline">Admin</span>
      </button>
      {/* Login Form Dropdown */}
      {showLogin && (
        <div className="absolute top-16 right-8 bg-gray-900 border border-gray-700 rounded shadow-lg p-4 z-50 w-64">
          <form onSubmit={e => { e.preventDefault(); /* handle login here */ }}>
            <label className="block mb-2 text-sm font-semibold">Admin Password</label>
            <input
              type="password"
              className="w-full p-2 rounded border border-gray-600 bg-black text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button
              type="submit"
              className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      )}
      {/* Main content */}
      <div className="flex flex-col items-center space-y-8 w-full">
        <div className="flex space-x-6 items-center">
          {/* Profile Button */}
          <a href={X_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80">
            <img src={PROFILE_IMG} alt="Profile" className="w-10 h-10 rounded-full border border-gray-700" />
          </a>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow hover:bg-gray-700 transition-colors border border-gray-700"
            aria-label="Toggle theme"
          >
            <img src={DarkModeIcon} alt="Toggle dark mode" className="w-6 h-6" />
          </button>
        </div>
        <textarea
          className="w-2/3 h-64 p-4 rounded border border-gray-700 bg-black text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg placeholder-gray-400"
          placeholder="Write your daily blog..."
          value={blog}
          onChange={e => setBlog(e.target.value)}
        />
        <button
          className="mt-2 px-8 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors"
        >
          Publish
        </button>
      </div>
    </div>
  )
}

export default App
