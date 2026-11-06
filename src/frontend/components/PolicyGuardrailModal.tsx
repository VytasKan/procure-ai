'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';

interface PolicyGuardrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThreshold: number;
  onUpdateThreshold: (newThreshold: number) => void;
}

export const PolicyGuardrailModal: React.FC<PolicyGuardrailModalProps> = ({
  isOpen,
  onClose,
  currentThreshold,
  onUpdateThreshold
}) => {
  const [threshold, setThreshold] = useState(currentThreshold);
  const [requireTwoPerson, setRequireTwoPerson] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateThreshold(threshold);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Corporate Spending Policy & Guardrails</span>
              </h3>
              <p className="text-xs text-slate-500">Configure financial safety boundaries for autonomous agent actions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Threshold Preset Cards */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Auto-Approval Spend Cap per PO
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Any order exceeding this amount will automatically halt autonomous execution and generate an interactive Human-in-the-Loop approval card.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[250, 350, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => setThreshold(val)}
                  className={`py-2 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                    threshold === val
                      ? 'bg-[#0070ba] text-white border-[#0070ba] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-sm font-mono font-bold text-slate-900 w-full focus:outline-none"
                placeholder="Custom limit"
              />
              <span className="text-[11px] text-slate-400 font-medium">USD</span>
            </div>
          </div>

          {/* Additional Rules */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Require Two-Person Review</span>
                <p className="text-[11px] text-slate-500">Escalate orders &gt; $5,000 to CFO approval</p>
              </div>
              <input
                type="checkbox"
                checked={requireTwoPerson}
                onChange={(e) => setRequireTwoPerson(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Payment Authorization Engine</span>
                <p className="text-[11px] text-slate-500">PayPal Sandbox OAuth2 Scoped Token</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-600 font-medium">
            Active Limit: <strong className="text-emerald-700 font-mono">${threshold.toFixed(2)} USD</strong>
          </span>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-xs font-bold text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Apply Policy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
