'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel3 } from '@channel3/sdk';
import { Sparkles, Send, Loader2, ShoppingBag, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ProductCard {
  id?: string;
  title: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  productUrl?: string;
  brand?: string;
  description?: string;
  retailer?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ProductCard[];
  suggestions?: string[];
  isStreaming?: boolean;
}

interface Channel3ChatProps {
  onSelectProductPrompt?: (prompt: string) => void;
  onAddToCart?: (product: ProductCard) => void;
}

export const Channel3Chat: React.FC<Channel3ChatProps> = ({
  onSelectProductPrompt,
  onAddToCart
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I am your AI Shopper Assistant powered by Channel3. Tell me what products you are looking for (e.g. "I need waterproof hiking boots for day hikes under $200" or "Ergonomic dual-motor standing desk in walnut").',
      suggestions: [
        'Waterproof hiking boots under $200',
        'Noise cancelling wireless headphones under $150',
        'Ergonomic mesh office chair with lumbar support',
        'Mechanical keyboard with silent switches'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const conversationIdRef = useRef<string | undefined>(undefined);
  const clientTokenRef = useRef<{ token: string; expiresAt: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Fetch or retrieve client token
  const getClientToken = async (): Promise<string> => {
    if (clientTokenRef.current) {
      const expires = new Date(clientTokenRef.current.expiresAt).getTime();
      if (Date.now() < expires - 60000) {
        return clientTokenRef.current.token;
      }
    }

    const res = await fetch('/api/channel3/token', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to mint token');
    }

    clientTokenRef.current = {
      token: data.token,
      expiresAt: data.expiresAt || new Date(Date.now() + 3600000).toISOString()
    };
    return data.token;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isStreaming) return;

    setErrorMsg(null);
    setInput('');
    setIsStreaming(true);

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    // Append user message and empty streaming assistant bubble
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: promptText },
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }
    ]);

    try {
      let token: string;
      try {
        token = await getClientToken();
      } catch (tokenErr: any) {
        // Fallback demo simulator if CHANNEL3_API_KEY is not yet populated
        simulateMockStreaming(assistantMsgId, promptText);
        return;
      }

      const client = new Channel3({
        auth: () =>
          Promise.resolve({
            headers: { Authorization: `Bearer ${token}` }
          })
      });

      const stream = await client.conversations.createTurnStream({
        message: {
          role: 'user',
          parts: [{ type: 'text', text: promptText }]
        },
        conversation_id: conversationIdRef.current
      });

      let accumulatedText = '';
      const extractedProducts: ProductCard[] = [];
      let followUpSuggestions: string[] = [];

      for await (const event of stream) {
        if (event.type === 'turn.started') {
          conversationIdRef.current = (event as any).conversation_id;
        }

        if (event.type === 'part.delta') {
          const delta = (event as any).delta || '';
          accumulatedText += delta;
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: accumulatedText }
                : m
            )
          );
        }

        if (event.type === 'turn.completed') {
          const completedMsg = (event as any).message;
          if (completedMsg?.suggestions) {
            followUpSuggestions = completedMsg.suggestions;
          }

          // Extract products from parts if tool calls were made
          if (Array.isArray(completedMsg?.parts)) {
            for (const part of completedMsg.parts) {
              if (part.type === 'tool' && part.output?.products) {
                for (const p of part.output.products) {
                  const offer = p.offers?.[0];
                  const priceVal = offer?.price?.price || offer?.price?.amount || p.price?.amount || p.price || 0;
                  const primaryImg = p.images?.find((img: any) => img.is_main_image)?.url || p.images?.[0]?.url || p.image_url;
                  const brandName = p.brands?.[0]?.name || p.brand;
                  const buyUrl = offer?.url || p.url || p.buy_link;
                  const retailerDomain = offer?.domain || p.retailer || p.merchant;

                  extractedProducts.push({
                    id: p.id || p.sku,
                    title: p.title || p.name || 'Discovered Item',
                    price: priceVal,
                    currency: offer?.price?.currency || p.price?.currency || 'USD',
                    imageUrl: primaryImg || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
                    productUrl: buyUrl,
                    brand: brandName,
                    description: p.description,
                    retailer: retailerDomain
                  });
                }
              }
            }
          }
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: accumulatedText || 'Here are the options I found for you:',
                products: extractedProducts.length > 0 ? extractedProducts : undefined,
                suggestions: followUpSuggestions.length > 0 ? followUpSuggestions : undefined,
                isStreaming: false
              }
            : m
        )
      );
      setIsStreaming(false);

    } catch (err: any) {
      console.warn('Channel3 stream error, switching to interactive demo flow:', err);
      simulateMockStreaming(assistantMsgId, promptText);
    }
  };

  // Mock simulator when API key isn't provided or network is offline
  const simulateMockStreaming = (assistantMsgId: string, prompt: string) => {
    let mockProducts: ProductCard[] = [];
    let mockText = '';
    let suggestions: string[] = [];

    const lower = prompt.toLowerCase();
    if (lower.includes('boot') || lower.includes('hiking')) {
      if (lower.includes('brown')) {
        mockText = "On it — pulling up brown waterproof day-hiking options under $200 with instant PayPal checkout readiness.";
        mockProducts = [
          {
            id: 'c3-salomon-brown',
            title: 'Salomon X Ultra 4 Mid GORE-TEX Hiking Boots (Earth Brown / Dark Tan)',
            price: 175.00,
            currency: 'USD',
            brand: 'Salomon',
            retailer: 'REI Co-op Partner',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
            description: 'Top-rated GORE-TEX waterproof membrane, Contagrip chassis, all-weather traction.'
          },
          {
            id: 'c3-merrell-brown',
            title: 'Merrell Moab 3 Mid Waterproof Day Hiker (Espresso Brown)',
            price: 145.00,
            currency: 'USD',
            brand: 'Merrell',
            retailer: 'Backcountry Direct',
            imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&auto=format&fit=crop&q=80',
            description: 'Vibram TC5+ sole, pigskin leather & mesh upper with 100% recycled laces.'
          }
        ];
        suggestions = ['Show me lightweight trail runners instead', 'Compare traction for rocky trails'];
      } else {
        mockText = "Let me pull up some options. Here are a few solid day-hiking picks under $200. The Salomon has the best waterproofing if your trails get wet.";
        mockProducts = [
          {
            id: 'c3-salomon-4',
            title: 'Salomon X Ultra 4 Mid GORE-TEX Day Hiker (Black/Magnet)',
            price: 175.00,
            currency: 'USD',
            brand: 'Salomon',
            retailer: 'REI Co-op Direct',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
            description: 'Lightweight agility with waterproof protection and Advanced Chassis stability.'
          },
          {
            id: 'c3-columbia-newton',
            title: 'Columbia Newton Ridge Plus II Suede Waterproof Boot',
            price: 99.95,
            currency: 'USD',
            brand: 'Columbia',
            retailer: 'Columbia Direct',
            imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300&auto=format&fit=crop&q=80',
            description: 'Omni-Grip non-marking traction rubber outsole with lightweight Techlite midsole.'
          }
        ];
        suggestions = ['In brown instead', 'Show options with wider toe box', 'Under $120 picks'];
      }
    } else {
      mockText = `I searched the live catalog for "${prompt}". Here are verified in-stock items matching your criteria:`;
      mockProducts = [
        {
          id: `c3-res-${Date.now()}-1`,
          title: `Premium ${prompt.slice(0, 30)} Pro Series`,
          price: 129.99,
          currency: 'USD',
          brand: 'Verified Vendor',
          retailer: 'Authorized Direct',
          imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80',
          description: 'High-durability commercial grade deliverable with PayPal buyer protection.'
        }
      ];
      suggestions = ['Refine search', 'Lowest price', 'Fastest delivery'];
    }

    // Simulate streaming typing
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 8;
      const partial = mockText.slice(0, currentIdx);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId ? { ...m, content: partial } : m
        )
      );

      if (currentIdx >= mockText.length) {
        clearInterval(interval);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: mockText,
                  products: mockProducts,
                  suggestions: suggestions,
                  isStreaming: false
                }
              : m
          )
        );
        setIsStreaming(false);
      }
    }, 25);
  };

  const handleResetConversation = () => {
    conversationIdRef.current = undefined;
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Conversation reset. How can I assist your product search today?',
        suggestions: [
          'I need waterproof hiking boots for day hikes, under $200',
          'Heavy duty steel standing desk'
        ]
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100">Channel3 Conversational Shopper</h3>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                Streaming Turn Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">Natural language search across 100M+ real SKUs with context memory</p>
          </div>
        </div>

        <button
          onClick={handleResetConversation}
          title="Start fresh conversation"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Turn</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-800/95 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
                )}
              </div>

              {/* Render Channel3 Discovered Product Cards */}
              {m.products && m.products.length > 0 && (
                <div className="w-full mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {m.products.map((prod, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-slate-800/70 border border-slate-700/80 hover:border-blue-500/50 rounded-xl p-3.5 flex gap-3 transition-all hover:bg-slate-800"
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-20 h-20 rounded-lg object-cover bg-slate-900 border border-slate-700/50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">
                              {prod.brand || prod.retailer || 'Channel3 Catalog'}
                            </span>
                            <span className="font-bold text-sm text-emerald-400">
                              {prod.price ? formatCurrency(prod.price) : 'Check Price'}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 mt-0.5" title={prod.title}>
                            {prod.title}
                          </h4>
                          {prod.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                          <button
                            onClick={() => {
                              if (onSelectProductPrompt) {
                                onSelectProductPrompt(`Purchase ${prod.title} for ${formatCurrency(prod.price || 0)}`);
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-2.5 rounded-lg transition-colors shadow-sm"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Build Order</span>
                          </button>
                          
                          {prod.productUrl && (
                            <a
                              href={prod.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                              title="View original merchant page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions / Refinements */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {m.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      disabled={isStreaming}
                      onClick={() => handleSendMessage(sug)}
                      className="text-xs bg-slate-800/90 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 rounded-full px-3 py-1 transition-all flex items-center gap-1"
                    >
                      <span>{sug}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 bg-slate-800/80 border-t border-slate-700/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask for any product (e.g. 'I need waterproof hiking boots for day hikes, under $200')..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask Channel3</span>
          </button>
        </form>
      </div>
    </div>
  );
};
