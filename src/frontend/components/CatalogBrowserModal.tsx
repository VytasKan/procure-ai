'use client';

import React, { useState } from 'react';
import { X, Search, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { ProductItem } from '@/backend/types';
import { formatCurrency } from '../utils/formatters';

interface CatalogBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productTitle: string) => void;
}

const CATALOG_ITEMS: ProductItem[] = [
  {
    id: 'prod-mon-01',
    sku: 'DELL-U2723QE',
    title: 'Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)',
    category: 'hardware',
    retailer: 'Dell Technologies',
    price: 489.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.8,
    specs: {
      resolution: '3840 x 2160 (4K)',
      panel: 'IPS Black',
      ports: 'USB-C 90W PD, RJ45 Ethernet',
      warranty: '3-Year Advanced Exchange'
    }
  },
  {
    id: 'prod-desk-01',
    sku: 'AUTO-SMARTDESK-CORE',
    title: 'Autonomous SmartDesk Core - Dual Motor Electric Standing Desk (53x29")',
    category: 'furniture',
    retailer: 'Autonomous',
    price: 499.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 3,
    rating: 4.7,
    specs: {
      heightRange: '29.4" to 48"',
      weightCapacity: '270 lbs',
      motors: 'Dual Motor (<50dB)',
      warranty: '5-Year Frame & Motor'
    }
  },
  {
    id: 'prod-dock-01',
    sku: 'CALDIGIT-TS4',
    title: 'CalDigit TS4 Thunderbolt 4 Dock (18 Ports, 98W Charging)',
    category: 'peripherals',
    retailer: 'CalDigit Store',
    price: 399.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.9,
    specs: {
      ports: '18 ports (3x TB4, 5x USB-A, 3x USB-C, 2.5GbE)',
      powerDelivery: '98W host charging',
      compatibility: 'macOS, Windows, Linux'
    }
  },
  {
    id: 'prod-chair-01',
    sku: 'HERMAN-MILLER-AERON-REM',
    title: 'Herman Miller Aeron Ergonomic Office Chair (Size B)',
    category: 'furniture',
    retailer: 'Design Within Reach Pro',
    price: 1195.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 5,
    rating: 4.9,
    specs: {
      lumbarSupport: 'PostureFit SL',
      material: '8Z Pellicle Mesh',
      warranty: '12-Year Warranty'
    }
  },
  {
    id: 'prod-periph-01',
    sku: 'LOGI-MX-KEYS-COMBO',
    title: 'Logitech MX Master 3S Mouse & MX Mechanical Keyboard Combo',
    category: 'peripherals',
    retailer: 'Logitech Business',
    price: 269.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.9,
    specs: {
      connectivity: 'Logi Bolt + Bluetooth LE',
      battery: 'Rechargeable USB-C',
      sensor: '8000 DPI Darkfield'
    }
  },
  {
    id: 'prod-periph-02',
    sku: 'JABRA-EVOLVE2-65',
    title: 'Jabra Evolve2 65 Wireless Noise-Isolating Office Headset',
    category: 'peripherals',
    retailer: 'CDW Logistics',
    price: 219.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.7,
    specs: {
      noiseCancellation: 'Noise-isolating foam',
      batteryLife: '37 hours',
      certification: 'Certified Teams/Zoom'
    }
  }
];

export const CatalogBrowserModal: React.FC<CatalogBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = CATALOG_ITEMS.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Multi-Vendor Catalog Intelligence</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Channel3 MCP Integrated
                </span>
              </h3>
              <p className="text-xs text-slate-400">Search 100M+ normalized retailer SKUs with live stock & B2B volume pricing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter items, brands, or SKUs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] w-full sm:w-auto">
            {['ALL', 'hardware', 'furniture', 'peripherals'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filtered.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    {item.sku}
                  </span>
                  <span className="text-xs font-semibold text-purple-400">
                    {item.retailer}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white">{item.title}</h4>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 pt-1">
                  {Object.entries(item.specs).map(([k, v]) => (
                    <span key={k}>
                      <strong className="text-slate-300">{k}:</strong> {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-black text-white font-mono">{formatCurrency(item.price)}</span>
                  <p className="text-[10px] text-emerald-400 font-medium">In Stock • Ships in {item.leadTimeDays}d</p>
                </div>

                <button
                  onClick={() => {
                    onSelectProduct(`Procure 2x ${item.title}`);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Order via Agent</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
