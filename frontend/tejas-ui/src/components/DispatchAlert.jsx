import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Zap, ShieldAlert, Check } from 'lucide-react';
import { executeDispatch } from '../api/api';

export default function DispatchAlert({ recommendation, onExecuted }) {
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!recommendation || recommendation.anomalyType === 'NORMAL') {
    return (
      <div className="bg-emerald-50 text-emerald-900 p-6 rounded-2xl border border-emerald-200 flex items-center gap-4 shadow-sm">
        <CheckCircle className="text-emerald-500 flex-shrink-0" size={32} />
        <div>
          <h3 className="font-bold text-lg text-emerald-900">Grid Nominal & Balanced</h3>
          <p className="text-emerald-700 text-sm mt-0.5">
            Renewable generation currently meets or exceeds academic campus load.
          </p>
        </div>
      </div>
    );
  }

  if (acknowledged) {
    return (
      <div className="bg-slate-100 text-slate-700 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
        <span>Deficit event acknowledged. Active monitoring in progress.</span>
        <button onClick={() => setAcknowledged(false)} className="text-slate-900 font-semibold underline text-xs">
          Show Details
        </button>
      </div>
    );
  }

  const isCritical = recommendation.criticalReserveLocked || recommendation.severity === 'CRITICAL';

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await executeDispatch();
      setExecuted(true);
      if (onExecuted) onExecuted();
      setTimeout(() => setExecuted(false), 5000);
    } catch (e) {
      console.error(e);
      alert('Dispatch failed: ' + e.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border flex flex-col gap-4 shadow-md transition-all ${
        isCritical
          ? 'bg-red-50/90 border-red-300 text-red-950'
          : 'bg-amber-50/90 border-amber-300 text-amber-950'
      }`}
    >
      <div className="flex items-start gap-4">
        {isCritical ? (
          <ShieldAlert className="text-red-600 flex-shrink-0 animate-pulse" size={36} />
        ) : (
          <AlertTriangle className="text-amber-600 flex-shrink-0" size={36} />
        )}
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                isCritical ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {isCritical ? 'CRITICAL RESERVE LOCKED' : 'DEFICIT ANOMALY DETECTED'}
            </span>
          </div>

          <p className="font-semibold text-sm mt-2 text-slate-800">{recommendation.notificationMessage}</p>

          <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl mt-3 border border-slate-200/60 shadow-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1.5">
              Deterministic Action Plan:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-medium">
              {recommendation.actions?.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-right flex-shrink-0 bg-white/70 p-3 rounded-xl border border-slate-200/50">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tariff Savings</div>
          <div className="text-xl font-black text-emerald-600">₹{recommendation.estimatedCostSavedInr}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Load Shift</div>
          <div className="text-base font-bold text-slate-800">-{recommendation.projectedPeakReductionKw} kW</div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 border-t border-black/10 pt-3">
        <button
          onClick={() => setAcknowledged(true)}
          className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded-lg transition"
        >
          Dismiss
        </button>

        <button
          disabled={executing || executed}
          onClick={handleExecute}
          className={`px-5 py-2 font-bold text-sm rounded-xl text-white shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${
            executed
              ? 'bg-emerald-600'
              : isCritical
              ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
          }`}
        >
          {executed ? (
            <>
              <Check size={16} /> Dispatched (+50 KP Distributed)
            </>
          ) : executing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Executing...
            </>
          ) : (
            <>
              <Zap size={16} /> Execute Dispatch & Award Karma
            </>
          )}
        </button>
      </div>
    </div>
  );
}
