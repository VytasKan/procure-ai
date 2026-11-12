'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Lock, Scale, Bot } from 'lucide-react';
import { useToast } from './Toast';

interface PolicyViewProps {
  currentThreshold: number;
  enforceCollateral?: boolean;
  autoSlaSlashing?: boolean;
  onUpdatePolicy?: (newThreshold: number, enforceCollateral: boolean, autoSlaSlashing: boolean) => void;
  onUpdateThreshold?: (newThreshold: number) => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({
  currentThreshold,
  enforceCollateral = true,
  autoSlaSlashing: initialAutoSla = true,
  onUpdatePolicy,
  onUpdateThreshold
}) => {
  const { showToast } = useToast();
  const [threshold, setThreshold] = useState(currentThreshold);
  const [autoSlaSlashing, setAutoSlaSlashing] = useState(initialAutoSla);
  const [enforceCollateralRatio, setEnforceCollateralRatio] = useState(enforceCollateral);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if props change
  React.useEffect(() => {
    setThreshold(currentThreshold);
  }, [currentThreshold]);

  React.useEffect(() => {
    setEnforceCollateralRatio(enforceCollateral);
  }, [enforceCollateral]);

  React.useEffect(() => {
    setAutoSlaSlashing(initialAutoSla);
  }, [initialAutoSla]);

  const handleApply = () => {
    if (onUpdatePolicy) {
      onUpdatePolicy(threshold, enforceCollateralRatio, autoSlaSlashing);
    } else if (onUpdateThreshold) {
      onUpdateThreshold(threshold);
    }
    setIsSaved(true);
    showToast('Trust Policy Updated', `Direct gate: Score ≥ ${threshold}/100 • Collateral Check: ${enforceCollateralRatio ? 'Enforced' : 'Bypassed'}`, 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              ProcureAI Due Diligence & Counterparty Risk Gate
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Active Network Gate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated spending mandate for Buyer Agents: route payments through PayPal Direct Capture vs. Conditional Escrow Hold based on counterparty reputation.
          </p>
        </div>

        <button
          onClick={handleApply}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition cursor-pointer shadow-xs flex items-center gap-2"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4 text-white" />}
          <span>{isSaved ? 'Threshold Applied!' : 'Save Router Policy'}</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Reputation Threshold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Minimum Trust Score for Direct Settlement</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Seller agents with a reputation score equal to or above this gate receive instant PayPal direct payouts. Counterparties falling below this score are automatically routed to conditional escrow (`intent: AUTHORIZE`).
          </p>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {[60, 75, 85, 90].map(val => (
              <button
                key={val}
                onClick={() => setThreshold(val)}
                className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                  threshold === val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                &ge; {val}/100
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-xs font-mono font-bold">Score:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 50)}
              className="bg-transparent text-sm font-mono font-bold text-slate-900 w-full focus:outline-none"
              placeholder="Custom score threshold"
            />
            <span className="text-xs text-slate-400 font-semibold font-mono">/100</span>
          </div>
        </div>

        {/* Card 2: Automatic Escrow Safeguards */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Automated Escrow & Restitution Protocols</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deterministic cryptographic and financial safeguards executed autonomously by ProcureAI:
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900">Auto-Slashing on SLA Breach (-15 Score)</span>
                <p className="text-[11px] text-slate-500">Penalize counterparty reputation when artifacts fail validation</p>
              </div>
              <input
                type="checkbox"
                checked={autoSlaSlashing}
                onChange={(e) => setAutoSlaSlashing(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900">Enforce Collateral Stake Check ($200 USD)</span>
                <p className="text-[11px] text-slate-500">Force uncollateralized agents into conditional escrow</p>
              </div>
              <input
                type="checkbox"
                checked={enforceCollateralRatio}
                onChange={(e) => setEnforceCollateralRatio(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
