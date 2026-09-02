import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FacilityHub from './pages/FacilityHub';
import PublicKiosk from './pages/PublicKiosk';
import StudentPortal from './pages/StudentPortal';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import DemoToolbar from './components/DemoToolbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-2">
            <span className="text-emerald-400">⚡ TEJAS</span> GRID
          </div>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Facility Hub</Link>
            <Link to="/kiosk" className="hover:text-emerald-400 transition-colors">Public Kiosk</Link>
            <Link to="/student" className="hover:text-emerald-400 transition-colors">Student Portal</Link>
            <Link to="/executive" className="hover:text-emerald-400 transition-colors">Executive</Link>
          </div>
        </nav>
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
