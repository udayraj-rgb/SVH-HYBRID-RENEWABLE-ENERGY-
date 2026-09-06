import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, logout, isGovt, isOperator, isStudent } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;

  let hasAccess = true;
  if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = allowedRoles.some((r) => {
      const normalized = r.startsWith('ROLE_') ? r : `ROLE_${r}`;
      return normalized === userRole;
    });
  }

  if (!hasAccess) {
    const returnPath = isGovt() ? '/executive' : (isOperator() ? '/' : '/student');

    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl text-center shadow-lg dark:shadow-2xl font-sans">
        <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Access Restricted by Directorate Policy</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
          You are currently logged in as <strong className="text-emerald-600 dark:text-emerald-400">{user.name}</strong> ({userRole}).
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-8 max-w-md mx-auto">
          The requested route requires higher institutional clearance ({allowedRoles?.join(', ')}). Your data session is strictly isolated to prevent cross-tenant exposure.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={returnPath}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-600/30"
          >
            <ArrowLeft size={14} />
            <span>Return to Authorized Dashboard</span>
          </Link>
          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Switch Role / Account</span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}
