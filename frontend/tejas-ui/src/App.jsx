import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import FacilityHub from './pages/FacilityHub';
import PublicKiosk from './pages/PublicKiosk';
import StudentPortal from './pages/StudentPortal';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import LoginPage from './pages/LoginPage';
import DemoToolbar from './components/DemoToolbar';
import LiveAlertBanner from './components/LiveAlertBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { LogOut, Shield, GraduationCap, Zap, Activity, BarChart3, Users, Sun, Moon } from 'lucide-react';

function AppContent() {
  const { user, logout, isOperator, isStudent } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is not authenticated, display the login portal
  if (!user) {
    return <LoginPage onLoginSuccess={(role) => navigate(role === 'OPERATOR' ? '/' : '/student')} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Dynamic Role-Based Top Navigation */}
      <nav className="bg-slate-900 text-white px-6 py-3.5 shadow-md flex flex-wrap justify-between items-center z-30 gap-4 border-b border-slate-800">
        {/* Brand & VPP Tag */}
        <div className="flex items-center gap-3">
          <Link to={isOperator() ? '/' : '/student'} className="text-xl font-black flex items-center gap-2 tracking-tight">
            <span className="text-emerald-400">⚡ TEJAS</span> GRID
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              VPP 2.0
            </span>
          </Link>

          {/* Role Status Pill */}
          <div
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
              isOperator()
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isOperator() ? <Shield size={13} /> : <GraduationCap size={13} />}
            <span>{isOperator() ? 'OPERATOR CLEARANCE' : 'STUDENT RESIDENT'}</span>
          </div>
        </div>

        {/* Dynamic Navigation Links Tailored to Role */}
        <div className="flex items-center gap-2 md:gap-4 text-sm font-semibold">
          {/* OPERATOR ONLY LINKS */}
          {isOperator() && (
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/'
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Activity size={15} />
                <span>Facility Hub</span>
              </Link>

              <Link
                to="/executive"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/executive'
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 size={15} />
                <span>Executive Analytics</span>
              </Link>

              <Link
                to="/student"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/student'
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users size={15} />
                <span>Student Directory</span>
              </Link>
            </>
          )}

          {/* STUDENT ONLY LINKS (Executive Analytics & Facility Hub are completely hidden!) */}
          {isStudent() && (
            <>
              <Link
                to="/student"
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/student'
                    ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <GraduationCap size={16} />
                <span>My Student Portal</span>
              </Link>

              <Link
                to="/kiosk"
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/kiosk'
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Activity size={16} />
                <span>Hostel Leaderboard</span>
              </Link>
            </>
          )}

          {/* Public Kiosk available for Operator */}
          {isOperator() && (
            <Link
              to="/kiosk"
              className={`px-3 py-1.5 rounded-xl transition-all ${
                location.pathname === '/kiosk' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Public Kiosk
            </Link>
          )}

          {/* THEME TOGGLE BUTTON (Light / Dark) */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-400" />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* User Profile Info & Logout */}
          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-700">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold text-white">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isStudent() ? `${user.registrationNumber} • ${user.hostel}` : user.operatorId}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout / Switch Role"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Global Real-Time Deficit Alert Banner */}
      <LiveAlertBanner />

      {/* Main Routed Content Area */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <Routes>
          {/* Facility Hub (Operator Only) */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['OPERATOR']}>
                <FacilityHub />
              </ProtectedRoute>
            }
          />

          {/* Executive Dashboard & Analytics (Operator Only) */}
          <Route
            path="/executive"
            element={
              <ProtectedRoute allowedRoles={['OPERATOR']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Portal (Accessible to both, personalized for student) */}
          <Route path="/student" element={<StudentPortal />} />

          {/* Public Energy Awareness Kiosk */}
          <Route path="/kiosk" element={<PublicKiosk />} />

          {/* Explicit Login Route */}
          <Route path="/login" element={<LoginPage onLoginSuccess={(role) => navigate(role === 'OPERATOR' ? '/' : '/student')} />} />
        </Routes>
      </main>

      {/* Demo Anomaly Toolbar: Only shown to Facility Operators */}
      {isOperator() && <DemoToolbar />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
