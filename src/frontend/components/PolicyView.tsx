'use client';

import React, { useState } from 'react';
import { ShieldAlert, DollarSign, CheckCircle2, Lock, Sliders, Users, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';

interface PolicyViewProps {
  currentThreshold: number;
  onUpdateThreshold: (newThreshold: number) => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({
  currentThreshold,
  onUpdateThreshold
}) => {
  const { showToast } = useToast();
  const [threshold, setThreshold] = useState(currentThreshold);
  const [requireExecutiveApproval, setRequireExecutiveApproval] = useState(true);
  const [restrictInternational, setRestrictInternational] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = () => {
    onUpdateThreshold(threshold);
    setIsSaved(true);
    showToast('Guardrails Updated', `Auto-approval cap set to $${threshold.toFixed(2)} USD`, 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Corporate Spending Policy & Financial Guardrails
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Active Protection
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforce spending limits and approval chains on autonomous AI purchasing agents before committing funds via PayPal.
          </p>
        </div>

        <button
          onClick={handleApply}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-amber-300" />}
          <span>{isSaved ? 'Changes Applied!' : 'Save Guardrails'}</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Spending Caps */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Per-Transaction Auto-Approval Cap</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Purchases below this amount are authorized autonomously by the agent. Purchases exceeding this cap automatically trigger a Human-in-the-Loop approval card.
          </p>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {[250, 350, 500, 1000].map(val => (
              <button
                key={val}
                onClick={() => setThreshold(val)}
                className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                  threshold === val
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-xs font-mono font-bold">$</span>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
              className="bg-transparent text-sm font-mono font-bold text-white w-full focus:outline-none"
              placeholder="Custom limit"
            />
            <span className="text-xs text-slate-500 font-semibold">USD</span>
          </div>
        </div>

        {/* Card 2: Department Governance */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Departmental Approval Chains</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure multi-tier authorization workflows and token scopes for company spending.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200">Two-Person Rule (&gt; $3,000)</span>
                <p className="text-[11px] text-slate-400">Requires VP Eng & Finance sign-off</p>
              </div>
              <input
                type="checkbox"
                checked={requireExecutiveApproval}
                onChange={(e) => setRequireExecutiveApproval(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200">Enforce Certified Suppliers</span>
                <p className="text-[11px] text-slate-400">Restrict orders to Channel3 verified retailers</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                LOCKED ON
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
