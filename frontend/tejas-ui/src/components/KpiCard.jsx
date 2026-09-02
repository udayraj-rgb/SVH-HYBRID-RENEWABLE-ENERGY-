import React from 'react';

export default function KpiCard({ title, value, unit, icon: Icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          <span className="text-sm font-semibold text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
        <Icon size={24} />
      </div>
    </div>
  );
}
