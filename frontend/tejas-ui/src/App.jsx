import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import FacilityHub from './pages/FacilityHub';
import PublicKiosk from './pages/PublicKiosk';
import StudentPortal from './pages/StudentPortal';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import StudentDirectory from './pages/StudentDirectory';
import LoginPage from './pages/LoginPage';
import DemoToolbar from './components/DemoToolbar';
import LiveAlertBanner from './components/LiveAlertBanner';
import ProtectedRoute from './components/ProtectedRoute';
import {
  LogOut,
  Shield,
  GraduationCap,
  Zap,
  Activity,
  BarChart3,
  Users,
  Sun,
  Moon,
  Building2,
  Tv,
} from 'lucide-react';

function AppContent() {
  const { user, logout, isGovt, isOperator, isStudent } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is not authenticated, display the login portal
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          if (role === 'ROLE_GOVT' || role === 'GOVT') {
            navigate('/executive');
          } else if (role === 'ROLE_OPERATOR' || role === 'OPERATOR') {
            navigate('/');
          } else {
            navigate('/student');
          }
        }}
      />
    );
  }

  const defaultHome = isGovt() ? '/executive' : (isOperator() ? '/' : '/student');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Dynamic Role-Based Top Navigation (Enterprise Light & Dark Theme) */}
      <nav className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-6 py-3 shadow-xs dark:shadow-md flex flex-wrap justify-between items-center z-30 gap-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors">
        {/* Brand & VPP Tag (Strictly NO EMOJIS) */}
        <div className="flex items-center gap-3">
          <Link to={defaultHome} className="text-xl font-black flex items-center gap-2 tracking-tight">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Zap size={18} className="fill-emerald-500" />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400">TEJAS</span>
            <span className="text-slate-900 dark:text-white">GRID</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">
              VPP 2.0
            </span>
          </Link>

          {/* Role Status Clearance Badge */}
          <div
            className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border transition-colors ${
              isGovt()
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : isOperator()
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {isGovt() && <Building2 size={13} />}
            {isOperator() && <Shield size={13} />}
            {isStudent() && <GraduationCap size={13} />}
            <span>
              {isGovt() && 'STATEWIDE CLEARANCE (Govt)'}
              {isOperator() && 'FACILITY OPERATOR (Campus Locked)'}
              {isStudent() && 'STUDENT RESIDENT'}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links Tailored to Role */}
        <div className="flex items-center gap-2 md:gap-3 text-sm font-semibold">
          {/* ROLE_GOVT ONLY LINKS */}
          {isGovt() && (
            <>
              <Link
                to="/executive"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/executive'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 size={15} />
                <span>Statewide Command</span>
              </Link>

              <Link
                to="/facility"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/facility'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Activity size={15} />
                <span>Campus SCADA Hub</span>
              </Link>
            </>
          )}

          {/* ROLE_OPERATOR ONLY LINKS */}
          {isOperator() && (
            <>
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Activity size={15} />
                <span>Campus SCADA Hub</span>
              </Link>

              <Link
                to="/directory"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/directory'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Users size={15} />
                <span>Student Directory</span>
              </Link>

              <Link
                to="/kiosk"
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/kiosk'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Tv size={15} />
                <span>Public Kiosk</span>
              </Link>
            </>
          )}

          {/* ROLE_STUDENT ONLY LINKS (Executive and Facility Hub are completely hidden) */}
          {isStudent() && (
            <>
              <Link
                to="/student"
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/student'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap size={16} />
                <span>My Student Portal</span>
              </Link>

              <Link
                to="/kiosk"
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  location.pathname === '/kiosk'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Tv size={16} />
                <span>Public Kiosk</span>
              </Link>
            </>
          )}

          {/* THEME TOGGLE BUTTON (Light / Dark) */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {isDark ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-blue-600" />}
            <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User Profile Info & Logout */}
          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {isStudent() && `${user.registrationNumber || '24BCE1082'} • ${user.hostel || 'Hostel'}`}
                {isOperator() && (user.operatorId || 'OP-7701')}
                {isGovt() && 'DTE Rajasthan • Head of Grid Operations'}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout / Switch Role"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
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
          {/* Facility Hub (Operator Default) */}
          <Route
            path="/"
            element={
              isGovt() ? (
                <Navigate to="/executive" replace />
              ) : (
                <ProtectedRoute allowedRoles={['ROLE_OPERATOR', 'OPERATOR', 'ROLE_GOVT', 'GOVT']}>
                  <FacilityHub />
                </ProtectedRoute>
              )
            }
          />

          {/* Dedicated Campus SCADA Hub Route (Accessible to Operator and DTE Admin) */}
          <Route
            path="/facility"
            element={
              <ProtectedRoute allowedRoles={['ROLE_OPERATOR', 'OPERATOR', 'ROLE_GOVT', 'GOVT']}>
                <FacilityHub />
              </ProtectedRoute>
            }
          />

          {/* Executive Dashboard & Analytics (Govt Only) */}
          <Route
            path="/executive"
            element={
              <ProtectedRoute allowedRoles={['ROLE_GOVT', 'GOVT']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            }
          />

          {/* Campus Student Directory (Operator & Govt) */}
          <Route
            path="/directory"
            element={
              <ProtectedRoute allowedRoles={['ROLE_OPERATOR', 'OPERATOR', 'ROLE_GOVT', 'GOVT']}>
                <StudentDirectory />
              </ProtectedRoute>
            }
          />

          {/* Student Portal (Accessible to Student; Operator redirect to /directory, Govt to /executive) */}
          <Route
            path="/student"
            element={
              isGovt() ? (
                <Navigate to="/executive" replace />
              ) : isOperator() ? (
                <Navigate to="/directory" replace />
              ) : (
                <StudentPortal />
              )
            }
          />

          {/* Public Energy Awareness Kiosk (Accessible to Operator & Student, redirect Govt to /executive) */}
          <Route
            path="/kiosk"
            element={
              isGovt() ? (
                <Navigate to="/executive" replace />
              ) : (
                <PublicKiosk />
              )
            }
          />

          {/* Explicit Login Route */}
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={(role) => {
                  if (role === 'ROLE_GOVT' || role === 'GOVT') {
                    navigate('/executive');
                  } else if (role === 'ROLE_OPERATOR' || role === 'OPERATOR') {
                    navigate('/');
                  } else {
                    navigate('/student');
                  }
                }}
              />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={defaultHome} replace />} />
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
