/**
 * PulsePOS — Product Catalog Grid, Instant Search, Barcode Simulator & Fallback SVG Artwork
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ScanBarcode,
  Plus,
  AlertTriangle,
  PackageCheck,
  X,
  Coffee,
  CupSoda,
  Croissant,
  Cookie,
  ShoppingBag,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../data/mockProducts';
import { usePOS } from '../hooks/usePOS';

const CATEGORY_ICONS: Record<ProductCategory, React.ReactNode> = {
  All: <Sparkles className="h-3.5 w-3.5" />,
  'Hot Beverages': <Coffee className="h-3.5 w-3.5" />,
  'Cold Drinks': <CupSoda className="h-3.5 w-3.5" />,
  Bakery: <Croissant className="h-3.5 w-3.5" />,
  Snacks: <Cookie className="h-3.5 w-3.5" />,
  Merch: <ShoppingBag className="h-3.5 w-3.5" />,
  Combos: <PackageCheck className="h-3.5 w-3.5" />,
};

const CATEGORY_BADGE_STYLES: Record<Exclude<ProductCategory, 'All'>, string> = {
  'Hot Beverages': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Cold Drinks': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Bakery: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Snacks: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Merch: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Combos: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

/**
 * Reliable SVG Fallback Skeleton if an Unsplash image fails to load or user is offline
 */
const ProductFallbackSVG: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <svg
      viewBox="0 0 320 220"
      className="h-full w-full bg-slate-900"
      role="img"
      aria-label={product.name}
    >
      <defs>
        <linearGradient id={`grad-${product.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill={`url(#grad-${product.id})`} />
      <circle cx="260" cy="40" r="65" fill="#10b981" fillOpacity="0.08" />
      <circle cx="60" cy="180" r="80" fill="#38bdf8" fillOpacity="0.06" />
      <g transform="translate(132, 56)" stroke="#34d399" strokeWidth="2.2" fill="none">
        <rect x="6" y="14" width="36" height="36" rx="8" fill="#065f46" fillOpacity="0.35" />
        <path d="M42 22h5a7 7 0 0 1 0 14h-5" />
        <path d="M16 6v4M24 4v6M32 6v4" strokeLinecap="round" />
      </g>
      <text
        x="160"
        y="138"
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize="13"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {product.sku} • {product.category}
      </text>
      <text
        x="160"
        y="160"
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        PulsePOS Vector Preview
      </text>
    </svg>
  );
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, getCartQuantity, settings, restockProduct } = usePOS();
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const inCartQty = getCartQuantity(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock =
    product.stock > 0 && product.stock < settings.lowStockThreshold;

  const handleCardTap = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, 1);
    if (added) {
      setIsTapped(true);
      window.setTimeout(() => setIsTapped(false), 220);
    }
  };

  return (
    <div
      onClick={handleCardTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardTap();
        }
      }}
      role="button"
      tabIndex={0}
      aria-disabled={isOutOfStock}
      aria-label={`Add ${product.name} (${product.sku}) for $${product.price.toFixed(2)} to order`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/70 ${
        isOutOfStock
          ? 'cursor-not-allowed border-slate-800/80 bg-slate-900/40 opacity-75'
          : isTapped
          ? 'scale-[0.97] border-emerald-400 bg-slate-900 shadow-lg shadow-emerald-500/20'
          : inCartQty > 0
          ? 'cursor-pointer border-emerald-500/60 bg-slate-900/90 shadow-md shadow-emerald-950/50 hover:border-emerald-400'
          : 'cursor-pointer border-slate-800/90 bg-slate-900/70 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/40'
      }`}
    >
      {/* Image Container */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-950">
        {!imgLoaded && !imgFailed && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        )}

        {!imgFailed ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <ProductFallbackSVG product={product} />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Left: Category Badge */}
        <span
          className={`absolute left-2.5 top-2.5 rounded-lg border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
            CATEGORY_BADGE_STYLES[product.category]
          }`}
        >
          {product.category}
        </span>

        {/* Top Right: Active Cart Quantity Badge */}
        {inCartQty > 0 && (
          <span
            key={inCartQty}
            className="animate-pop-in absolute right-2.5 top-2.5 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-emerald-500 px-2 font-mono text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/40 ring-2 ring-slate-950"
          >
            {inCartQty}×
          </span>
        )}

        {/* Bottom Left: SKU Pill */}
        <span className="absolute bottom-2 left-2.5 rounded bg-slate-950/85 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-300 backdrop-blur-sm">
          {product.sku}
        </span>

        {/* Bottom Right: Stock Indicator */}
        <div className="absolute bottom-2 right-2.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-950/90 px-2 py-0.5 text-[10px] font-bold text-rose-300">
              OUT OF STOCK
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/50 bg-amber-950/90 px-2 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm">
              <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
              {product.stock} left
            </span>
          ) : (
            <span className="rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-300 backdrop-blur-sm">
              {product.stock} in stock
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          <h3 className="line-clamp-1 text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {product.description}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
              Unit Price
            </span>
            <span className="font-mono text-base font-extrabold text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {isOutOfStock ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                restockProduct(product.id, 10);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
              title="Quick restock +10 units"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Restock +10</span>
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                inCartQty > 0
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-200 group-hover:bg-emerald-500 group-hover:text-slate-950'
              }`}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductGrid: React.FC = () => {
  const {
    products,
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    showLowStockOnly,
    setShowLowStockOnly,
    simulateBarcodeScan,
    settings,
  } = usePOS();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [scanFlash, setScanFlash] = useState(false);

  // Keyboard shortcut: press '/' to focus search/scanner bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const scanned = simulateBarcodeScan(searchQuery.trim());
      if (scanned) {
        setScanFlash(true);
        window.setTimeout(() => setScanFlash(false), 350);
        setSearchQuery('');
      }
    }
  };

  const handleRandomBarcodeScan = () => {
    const scanned = simulateBarcodeScan();
    if (scanned) {
      setScanFlash(true);
      window.setTimeout(() => setScanFlash(false), 350);
    }
  };

  const getCategoryCount = (cat: ProductCategory) => {
    if (cat === 'All') return products.length;
    return products.filter((p) => p.category === cat).length;
  };

  return (
    <section
      aria-label="Product Catalog"
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6"
    >
      {/* Search & Barcode Scanner Controls */}
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search products, SKU (e.g. HB-101), or barcode... [Press '/' to focus, Enter to scan]"
            aria-label="Search products or scan SKU"
            className={`w-full rounded-xl border bg-slate-900/90 py-2.5 pl-10 pr-20 text-sm text-slate-100 placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
              scanFlash
                ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/30'
            }`}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline-block">
              /
            </kbd>
          )}
        </div>

        {/* Simulate Hardware Barcode Scanner Button */}
        <button
          type="button"
          onClick={handleRandomBarcodeScan}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:border-emerald-500/60 hover:bg-emerald-500/20 active:scale-95"
          title="Simulate scanning a barcode with a laser reader"
        >
          <ScanBarcode className="h-4 w-4 text-emerald-400" />
          <span>Simulate Barcode Scan</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
        {PRODUCT_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          const count = getCategoryCount(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              {CATEGORY_ICONS[category]}
              <span>{category}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                  isActive
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Low-Stock Filter Banner */}
      {showLowStockOnly && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>
              Showing only low-stock items (fewer than{' '}
              <strong>{settings.lowStockThreshold} units</strong> remaining).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLowStockOnly(false)}
            className="font-semibold text-amber-300 underline hover:text-white"
          >
            Show All Items
          </button>
        </div>
      )}

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <Search className="h-10 w-10 text-slate-600" />
          <h3 className="mt-3 text-base font-bold text-slate-300">
            No matching products found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Try clearing your search query, switching categories, or turning off the low-stock filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setShowLowStockOnly(false);
            }}
            className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Reset Catalog Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

