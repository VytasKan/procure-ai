'use client';

import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { ProductItem } from '@/backend/types';
import { formatCurrency } from '../utils/formatters';

interface CatalogViewProps {
  onOrderProduct: (productPrompt: string) => void;
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
      panel: 'IPS Black (2000:1 contrast)',
      ports: 'USB-C 90W PD, HDMI, DP, RJ45 Ethernet',
      warranty: '3-Year Advanced Exchange'
    }
  },
  {
    id: 'prod-mon-02',
    sku: 'LG-27UK850',
    title: 'LG 27" UHD IPS HDR10 Monitor with AMD FreeSync',
    category: 'hardware',
    retailer: 'B&H Photo Video',
    price: 329.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 3,
    rating: 4.6,
    specs: {
      resolution: '4K UHD (3840 x 2160)',
      panel: 'IPS HDR10',
      ports: 'USB-C 60W, 2x HDMI, DisplayPort',
      warranty: '1-Year Limited'
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
      motors: 'Quiet Dual Motor (<50dB)',
      warranty: '5-Year Frame & Motor'
    }
  },
  {
    id: 'prod-desk-02',
    sku: 'FEZIBO-DUAL-55',
    title: 'FEZIBO Electric Height Adjustable Standing Desk (55x24")',
    category: 'furniture',
    retailer: 'Amazon Business',
    price: 249.99,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.5,
    specs: {
      heightRange: '27.7" to 46.6"',
      presetMemory: '3 programmable buttons',
      material: 'Solid Steel Frame'
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
      ports: '18 ports (3x TB4, 5x USB-A, 3x USB-C, 2.5GbE LAN)',
      powerDelivery: '98W host charging',
      compatibility: 'macOS, Windows, Linux'
    }
  },
  {
    id: 'prod-chair-01',
    sku: 'HERMAN-MILLER-AERON-REM',
    title: 'Herman Miller Aeron Ergonomic Office Chair (Size B, Fully Loaded)',
    category: 'furniture',
    retailer: 'Design Within Reach Pro',
    price: 1195.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 5,
    rating: 4.9,
    specs: {
      lumbarSupport: 'PostureFit SL Dual Pads',
      material: '8Z Pellicle Mesh Suspension',
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
      connectivity: 'Logi Bolt USB Receiver + Bluetooth LE',
      battery: 'Rechargeable USB-C (up to 70 days)',
      sensor: '8000 DPI Darkfield sensor'
    }
  },
  {
    id: 'prod-periph-02',
    sku: 'JABRA-EVOLVE2-65',
    title: 'Jabra Evolve2 65 Wireless Noise-Isolating Headset with Boom Mic',
    category: 'peripherals',
    retailer: 'CDW Logistics',
    price: 219.00,
    currency: 'USD',
    inStock: true,
    leadTimeDays: 2,
    rating: 4.7,
    specs: {
      noiseCancellation: 'Passive noise-isolating memory foam',
      batteryLife: '37 hours continuous',
      certification: 'Certified for Zoom, Teams, Google Meet'
    }
  }
];

export const CatalogView: React.FC<CatalogViewProps> = ({ onOrderProduct }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = CATALOG_ITEMS.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.retailer.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCat === 'ALL' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Channel3 Multi-Merchant Catalog Intelligence
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              100M+ SKUs Simulated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Normalized product feeds across certified enterprise suppliers with real-time stock, warranty, and lead-time analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or SKUs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
            {['ALL', 'hardware', 'furniture', 'peripherals'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedCat === cat 
                    ? 'bg-purple-600 text-white shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
                  {item.sku}
                </span>
                <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                  <span>{item.retailer}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{item.title}</h4>

              {/* Specs Pills */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600 mb-4">
                {Object.entries(item.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{k}:</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-slate-900 font-mono">{formatCurrency(item.price)}</span>
                <p className="text-[10px] text-emerald-700 font-medium">In Stock • Ships in {item.leadTimeDays}d</p>
              </div>

              <button
                onClick={() => onOrderProduct(`Procure 2x ${item.title}`)}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>Procure via Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
