import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FacilityHub from './pages/FacilityHub';
import PublicKiosk from './pages/PublicKiosk';
import StudentPortal from './pages/StudentPortal';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import DemoToolbar from './components/DemoToolbar';
import LiveAlertBanner from './components/LiveAlertBanner';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <nav className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center z-30">
          <div className="text-xl font-black flex items-center gap-2 tracking-tight">
            <span className="text-emerald-400">⚡ TEJAS</span> GRID
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full ml-1">
              VPP 2.0
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link to="/" className="hover:text-emerald-400 transition-colors">
              Facility Hub
            </Link>
            <Link to="/kiosk" className="hover:text-emerald-400 transition-colors">
              Public Kiosk
            </Link>
            <Link to="/student" className="hover:text-emerald-400 transition-colors">
              Student Portal
            </Link>
            <Link to="/executive" className="hover:text-emerald-400 transition-colors">
              Executive
            </Link>
          </div>
        </nav>

        {/* Global Live Power Deficit Alert Banner & Notification Drawer */}
        <LiveAlertBanner />

        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<FacilityHub />} />
            <Route path="/kiosk" element={<PublicKiosk />} />
            <Route path="/student" element={<StudentPortal />} />
            <Route path="/executive" element={<ExecutiveDashboard />} />
          </Routes>
        </main>

        <DemoToolbar />
      </div>
    </Router>
  );
}

export default App;
