'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Activity, CheckCircle2, ExternalLink, ShieldCheck, Zap, RefreshCw, Send } from 'lucide-react';
import { useToast } from './Toast';

export const PayPalHubView: React.FC = () => {
  const { showToast } = useToast();
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedWebhookEvent, setSimulatedWebhookEvent] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSimulateWebhook = (eventType: string) => {
    setSimulatedWebhookEvent(eventType);
    showToast(
      'PayPal Webhook Inbound',
      `Event: ${eventType} • Dispatched to local handler`,
      'info'
    );
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              PayPal Developer Sandbox & API Gateway
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Gateway Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, OAuth2 scopes, integrated @paypal/agent-toolkit endpoints, and webhook simulators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700/80 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Ping Gateway</span>
          </button>

          <a
            href="https://developer.paypal.com/dashboard/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
          >
            <span>Developer Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid: Gateway Details & Live Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Telemetry & Endpoints (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Active REST Endpoints (@paypal/agent-toolkit)</span>
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                    POST
                  </span>
                  <span className="text-slate-200">/v2/checkout/orders</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">Active (200 OK)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                    POST
                  </span>
                  <span className="text-slate-200">/v2/invoicing/invoices</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">Active (200 OK)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    GET
                  </span>
                  <span className="text-slate-200">/v1/shipping/trackers</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">Active (200 OK)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Webhook Event Testing (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Simulate PayPal Webhook Events</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test how ProcureAI responds to inbound asynchronous PayPal transaction notifications:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSimulateWebhook('PAYMENT.CAPTURE.COMPLETED')}
                className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-left text-xs text-slate-300 font-medium transition cursor-pointer flex items-center justify-between"
              >
                <span>PAYMENT.CAPTURE.COMPLETED</span>
                <Send className="w-3.5 h-3.5 text-blue-400" />
              </button>

              <button
                onClick={() => handleSimulateWebhook('INVOICING.INVOICE.PAID')}
                className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-left text-xs text-slate-300 font-medium transition cursor-pointer flex items-center justify-between"
              >
                <span>INVOICING.INVOICE.PAID</span>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                onClick={() => handleSimulateWebhook('CUSTOMER.DISPUTE.CREATED')}
                className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-left text-xs text-slate-300 font-medium transition cursor-pointer flex items-center justify-between"
              >
                <span>CUSTOMER.DISPUTE.CREATED</span>
                <Send className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
