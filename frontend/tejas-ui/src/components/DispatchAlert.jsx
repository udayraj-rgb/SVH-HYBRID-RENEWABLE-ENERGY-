import React from 'react';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { executeDispatch } from '../api/api';

export default function DispatchAlert({ recommendation, onExecuted }) {
  if (!recommendation || recommendation.anomalyType === 'NORMAL') {
    return (
      <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 flex items-center gap-4">
        <CheckCircle className="text-emerald-500" size={32} />
        <div>
          <h3 className="font-bold text-lg">System Normal</h3>
          <p className="text-emerald-600">All assets operating within optimal parameters.</p>
        </div>
      </div>
    );
  }

  const isCritical = recommendation.severity === 'CRITICAL';
  
  const handleExecute = async () => {
    try {
      if (recommendation.eventId) {
         await executeDispatch(recommendation.eventId);
         if(onExecuted) onExecuted();
      }
    } catch(e) { console.error(e); }
  }

  return (
    <div className={`p-6 rounded-xl border flex flex-col gap-4 ${isCritical ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className={isCritical ? 'text-red-500' : 'text-amber-500'} size={32} />
        <div className="flex-grow">
          <h3 className="font-bold text-lg uppercase tracking-wider">{recommendation.anomalyType.replace('_', ' ')}</h3>
          <p className="opacity-80 text-sm mb-2">{recommendation.notificationMessage}</p>
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Recommended Actions:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {recommendation.actions?.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold opacity-70 uppercase tracking-wider">Projected Savings</div>
          <div className="text-xl font-bold">₹{recommendation.estimatedCostSavedInr}</div>
          <div className="text-sm opacity-70 mt-2">Peak Reduction</div>
          <div className="text-lg font-bold">{recommendation.projectedPeakReductionKw} kW</div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
        <button className="px-4 py-2 font-medium hover:bg-black/5 rounded-lg transition">Acknowledge</button>
        <button onClick={handleExecute} className={`px-6 py-2 font-bold rounded-lg text-white shadow-md flex items-center gap-2 ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
          <Zap size={18} /> Execute Dispatch
        </button>
      </div>
    </div>
  );
}
