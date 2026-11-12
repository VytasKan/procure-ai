'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Activity, ExternalLink, Lock, RotateCcw } from 'lucide-react';

interface SandboxDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThreshold?: number;
}

export const SandboxDiagnosticsModal: React.FC<SandboxDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  currentThreshold = 75
}) => {
  const [healthData, setHealthData] = useState<any>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>PayPal Escrow & Diagnostics Engine</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  healthData?.sandboxPing?.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {healthData?.sandboxPing?.ok ? 'Live Sandbox Connected' : 'Simulated Sandbox Mode'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">POST /v2/checkout/orders [intent: AUTHORIZE/CAPTURE]</p>
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
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Connection Status Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${healthData?.sandboxPing?.ok ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'} shadow-xs`} />
              <div>
                <span className="text-slate-900 font-bold text-xs">
                  {healthData?.sandboxPing?.ok ? 'Sandbox REST Gateway' : 'Deterministic Sandbox Engine'}
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  {healthData?.sandboxPing?.ok ? 'https://api-m.sandbox.paypal.com' : 'Local Deterministic Provider'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[11px] font-semibold font-mono ${healthData?.sandboxPing?.ok ? 'text-emerald-700' : 'text-blue-700'}`}>
                {healthData?.sandboxPing?.ok ? '200 OK' : 'ACTIVE'}
              </span>
              <p className="text-[10px] text-slate-400">
                {healthData?.sandboxPing?.ok ? `Latency: ~${healthData?.sandboxPing?.latencyMs || 42}ms` : 'Simulated Response'}
              </p>
            </div>
          </div>

          {/* Active Endpoints Grid */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Load-Bearing A2A Escrow Endpoints
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-800 font-bold text-[10px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">AUTHORIZE</span>
                  <span className="text-slate-800">POST /v2/checkout/orders</span>
                </div>
                <span className="text-amber-700 font-semibold text-[10px]">Conditional Escrow</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-bold text-[10px] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">CAPTURE</span>
                  <span className="text-slate-800">POST /v2/payments/authorizations/&#123;id&#125;/capture</span>
                </div>
                <span className="text-blue-700 font-semibold text-[10px]">Release Funds</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-rose-700 font-bold text-[10px] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">REFUND</span>
                  <span className="text-slate-800">POST /v2/payments/captures/&#123;id&#125;/refund</span>
                </div>
                <span className="text-rose-700 font-semibold text-[10px]">Dispute Restitution</span>
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Environment Mode:</span>
              <span className="font-mono text-blue-700 font-bold">{healthData?.environment || 'SANDBOX'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Trust Score Gate:</span>
              <span className="font-mono text-emerald-700 font-bold">Score &ge; {currentThreshold}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Buyer Agent Handle:</span>
              <span className="font-mono font-medium text-slate-900">{healthData?.buyerAgentId || 'agent://treasury-prime.eth'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">OAuth Credentials:</span>
              <span className={`font-semibold flex items-center gap-1 ${healthData?.hasPayPalCredentials ? 'text-emerald-700' : 'text-blue-700'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{healthData?.hasPayPalCredentials ? 'Sandbox Verified' : 'Simulated Sandbox Mode'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://developer.paypal.com/dashboard/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Open PayPal Developer Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
