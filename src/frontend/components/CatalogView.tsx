'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  RowClickedEvent,
  GridApi,
  GridReadyEvent
} from 'ag-grid-community';
import { ProductItem, SellerAgentProfile, ProductVariant, SupplierOfferComparison } from '@/backend/types';
import { formatCurrency, getTrustScoreBadge } from '../utils/formatters';
import {
  Search,
  Bot,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Check,
  Building,
  Info,
  X,
  Package,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Store
} from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

interface CatalogViewProps {
  onOrderProduct: (productPrompt: string) => void;
  agents?: SellerAgentProfile[];
  currentThreshold: number;
  enforceCollateral?: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onOrderProduct,
  agents: initialAgents,
  currentThreshold,
  enforceCollateral = true
}) => {
  const [search, setSearch] = useState('pens');
  const [quantity, setQuantity] = useState<number>(100);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const gridRef = useRef<AgGridReact<ProductItem>>(null);

  const fetchProducts = useCallback(async (query: string, qty: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      params.set('quantity', qty.toString());

      const res = await fetch(`/api/catalog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setIsLiveApi(Boolean(data.isLive));
      }
    } catch (err) {
      console.error('Failed to query catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(search, quantity);
    }, search ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [search, quantity, fetchProducts]);

  // Step 2 Enrichment: Open details drawer and fetch /api/catalog?id=...
  const handleInspectRow = async (item: ProductItem) => {
    setSelectedProduct(item);
    setActiveVariant(item.variants?.[0] || null);
    setLoadingDetails(true);

    try {
      const res = await fetch(`/api/catalog?id=${item.id}&quantity=${quantity}`);
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setSelectedProduct(data.product);
          setActiveVariant(data.product.variants?.[0] || null);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch rich product details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // AG Grid Column Definitions for Catalog Grid
  const columnDefs = useMemo<ColDef<ProductItem>[]>(() => [
    {
      field: 'imageUrl',
      headerName: '',
      width: 60,
      pinned: 'left',
      resizable: false,
      cellRenderer: (params: ICellRendererParams<ProductItem>) => {
        const src = params.value || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=100&auto=format&fit=crop&q=80';
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={src}
              alt={params.data?.title || 'Product'}
              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
              onError={(e) => {
                // Fallback to high-reliability office pen photo if an external image fails to load
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=100&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        );
      }
    },
    {
      field: 'retailer',
      headerName: 'Merchant',
      width: 155,
      pinned: 'left',
      cellRenderer: (params: ICellRendererParams<ProductItem>) => {
        const domain = params.value || '';
        const isBlocked = params.data?.trustVerdict === 'UNVERIFIED';
        return (
          <div className="flex flex-col justify-center h-full py-1 leading-tight">
            <span className={`font-mono text-xs font-bold ${isBlocked ? 'text-rose-700' : 'text-slate-900'}`}>
              {domain}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {domain.includes('staples') ? 'Staples Advantage B2B' :
                domain.includes('newegg') ? 'Newegg Business Inc.' :
                  domain.includes('michaels') ? 'Michaels Wholesale' :
                    domain.includes('dell') ? 'Dell Technologies Direct' :
                      domain.includes('borntostandout') ? 'Overseas Shell Entity' : 'Verified Vendor'}
            </span>
          </div>
        );
      }
    },
    {
      field: 'title',
      headerName: 'Product & Channel3 SKU',
      flex: 2,
      minWidth: 260,
      cellRenderer: (params: ICellRendererParams<ProductItem>) => {
        const item = params.data;
        if (!item) return null;
        return (
          <div className="flex flex-col justify-center h-full py-1 leading-normal overflow-hidden cursor-pointer" title="Click to view full specs & variants">
            <span className="font-semibold text-slate-900 truncate text-xs hover:text-blue-700 transition">
              {item.title}
            </span>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>SKU: {item.sku}</span>
              <span>•</span>
              <span className={item.inStock ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                {item.inStock ? 'In Stock' : 'Low Stock'}
              </span>
              <span>•</span>
              <span>{item.leadTimeDays}d Delivery</span>
            </div>
          </div>
        );
      }
    },
    {
      field: 'price',
      headerName: 'Unit Price',
      width: 105,
      type: 'numericColumn',
      cellRenderer: (params: ICellRendererParams<ProductItem>) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {formatCurrency(params.value || 0)}
          <span className="text-[10px] text-slate-400 font-normal"> /ea</span>
        </span>
      )
    },
    {
      field: 'totalPrice',
      headerName: 'Total (For Qty)',
      width: 125,
      type: 'numericColumn',
      cellRenderer: (params: ICellRendererParams<ProductItem>) => {
        const total = params.value || (params.data?.price || 0) * (params.data?.requestedQuantity || quantity);
        return (
          <div className="flex flex-col justify-center items-end h-full py-1 leading-tight font-mono">
            <span className="text-xs font-bold text-blue-700">{formatCurrency(total)}</span>
            <span className="text-[10px] text-slate-400">({(params.data?.requestedQuantity || quantity).toLocaleString()} units)</span>
          </div>
        );
      }
    },
    {
      field: 'trustVerdict',
      headerName: 'ProcureAI Verdict',
      width: 185,
      cellRenderer: (params: ICellRendererParams<ProductItem>) => {
        const verdict = params.value;
        const score = params.data?.merchantTrustScore || 50;

        if (verdict === 'APPROVED') {
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✅ Approved ({score}/100)
              </span>
            </div>
          );
        }
        if (verdict === 'ESCROW_REVIEW') {
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                🟡 Escrow Review ({score}/100)
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1.5 h-full">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              ❌ Blocked (Dropship)
            </span>
          </div>
        );
      }
    },
    {
      headerName: 'Details & Action',
      width: 155,
      pinned: 'right',
      cellRenderer: (params: ICellRendererParams<ProductItem>) => {
        const item = params.data;
        if (!item) return null;
        const isBlocked = item.trustVerdict === 'UNVERIFIED';

        return (
          <div className="flex items-center gap-1.5 h-full">
            <button
              onClick={() => handleInspectRow(item)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
              title="Inspect specs, high-res photos, and packaging variants"
            >
              Specs
            </button>

            {isBlocked ? (
              <span
                className="px-2 py-1 rounded bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-not-allowed flex items-center gap-1"
                title="ProcureAI blocked this unverified dropshipper"
              >
                <AlertOctagon className="w-3 h-3 text-rose-500" />
                <span>Blocked</span>
              </span>
            ) : (
              <button
                onClick={() => onOrderProduct(`Procure ${item.requestedQuantity || quantity} units of ${item.title} from ${item.retailer}`)}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
              >
                <span>Select</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      }
    }
  ], [quantity, onOrderProduct]);

  return (
    <div className="space-y-5">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold text-blue-200 mb-2 font-mono">
            <Globe className="w-3 h-3 text-blue-300" />
            <span>Channel3 Discovery & Sourcing Engine (/search + /products)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Channel3 Multi-Merchant Catalog Grid</h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            Lightweight discovery queries (<code className="font-mono text-blue-200">/search</code>) populate the grid with candidate merchant offers. Clicking any row triggers Step 2 (<code className="font-mono text-blue-200">/products</code>) to fetch high-res photos, packaging variants, and verified B2B specifications.
          </p>
        </div>
      </div>

      {/* Grid Controls: Quantity Selector + Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Search Catalog:</span>
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products (e.g. 'pens', '4k monitors', 'headsets')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Quantity:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {[50, 100, 500, 1000, 5000].map(qty => (
              <button
                key={qty}
                onClick={() => setQuantity(qty)}
                className={`px-2.5 py-1 rounded font-mono font-semibold transition cursor-pointer ${quantity === qty
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {qty.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AG Grid: Offer & Qualification Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Merchant Sourcing Candidates ({products.length} offers)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Direct Pay Gate: Score &ge; {currentThreshold}/100
          </span>
        </div>

        <div
          className="ag-theme-quartz w-full rounded-xl overflow-hidden border border-slate-200"
          style={{ height: '420px', width: '100%' }}
        >
          <AgGridReact<ProductItem>
            ref={gridRef}
            rowData={products}
            columnDefs={columnDefs}
            rowHeight={54}
            headerHeight={38}
            animateRows={true}
            onRowClicked={(e: RowClickedEvent<ProductItem>) => {
              if (e.data) handleInspectRow(e.data);
            }}
          />
        </div>
      </div>

      {/* Step 2 Rich Product Detail & Packaging Variant Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm font-mono">{selectedProduct.retailer}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${selectedProduct.trustVerdict === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    selectedProduct.trustVerdict === 'ESCROW_REVIEW' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                  {selectedProduct.trustVerdict} ({selectedProduct.merchantTrustScore}/100)
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Rich Images, Full Description, Specs, Variants, Multi-Merchant Comparison */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Product Top Section: High-Res Photo + Title + Pricing */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                  <img
                    src={selectedProduct.imageUrl || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    Channel3 Live Asset
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[10px] uppercase font-bold text-blue-600 font-mono tracking-wider block">
                    Canonical SKU: {selectedProduct.sku}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {selectedProduct.description || 'Full canonical product details fetched from Channel3 /products endpoint.'}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="font-mono text-base font-black text-blue-700">
                      {formatCurrency(selectedProduct.price)} <span className="text-xs text-slate-400 font-normal">/ unit</span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Total: <strong className="font-mono text-slate-900">{formatCurrency(selectedProduct.price * quantity)}</strong> ({quantity.toLocaleString()} units)
                    </span>
                  </div>
                </div>
              </div>

              {/* Packaging Variants Selection (Crucial for B2B procurement: Box of 12 vs Box of 144) */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>Packaging & Wholesale Tier Variants (/products)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedProduct.variants.map((v) => {
                      const isSelected = activeVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setActiveVariant(v)}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer ${isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <span className="font-bold text-xs block">{v.name}</span>
                          <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">
                            ${v.unitPrice.toFixed(2)}/unit • {formatCurrency(v.packPrice)}/pack
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Verified Product Specifications */}
              {selectedProduct.specs && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Verified B2B Product Specifications:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    {Object.entries(selectedProduct.specs).map(([key, val], idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-400 text-[10px] block capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-slate-800 truncate block mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Merchant Cross-Offer Comparison (Staples vs. Newegg vs. Michaels) */}
              {selectedProduct.alternativeOffers && selectedProduct.alternativeOffers.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    Multi-Merchant Offer Comparison for this SKU:
                  </span>
                  <div className="divide-y divide-slate-200 text-[11px]">
                    {selectedProduct.alternativeOffers.map((alt, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{alt.merchantName}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${alt.verdict === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                            {alt.verdict} ({alt.trustScore}/100)
                          </span>
                        </div>
                        <div className="font-mono text-right">
                          <span className="font-bold text-slate-900">${alt.unitPrice.toFixed(2)}/ea</span>
                          <span className="text-slate-400 text-[10px] block">{alt.deliveryDays}d delivery</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              {selectedProduct.trustVerdict !== 'UNVERIFIED' ? (
                <button
                  onClick={() => {
                    const prompt = `Procure ${quantity} units of ${selectedProduct.title} from ${selectedProduct.retailer}`;
                    setSelectedProduct(null);
                    onOrderProduct(prompt);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Select Offer & Engage Broker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  Blocked: Unverified Dropshipper
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
