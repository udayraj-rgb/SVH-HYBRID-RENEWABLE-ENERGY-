import React from 'react';

export default function KpiCard({ title, value, unit, icon: Icon, trend }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{unit}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50">
        <Icon size={24} />
      </div>
    </div>
  );
}
