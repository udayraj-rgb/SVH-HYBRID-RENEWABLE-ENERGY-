import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-amber-500/40 rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Access Restricted: Operator Only</h2>
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          You are currently logged in as <strong className="text-emerald-400">{user.name}</strong> ({user.role === 'STUDENT' ? `Student ${user.registrationNumber}` : user.role}).
        </p>
        <p className="text-slate-400 text-xs mb-8 max-w-md mx-auto">
          Executive analytics, predictive solar forecasting, battery dispatch parameters, and grid safety controls are restricted to certified Campus Facility Engineers and Energy Operators.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/student"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Return to Student Portal</span>
          </Link>
          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Switch to Facility Operator Login</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
