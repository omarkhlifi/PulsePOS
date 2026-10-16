/**
 * PulsePOS — Top Navigation & Terminal Status Bar
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  BarChart3,
  AlertTriangle,
  Clock,
  RotateCcw,
  Github,
  UserCheck,
  Receipt,
} from 'lucide-react';
import { usePOS } from '../hooks/usePOS';

interface HeaderProps {
  onOpenMobileCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileCart }) => {
  const {
    products,
    settings,
    showLowStockOnly,
    setShowLowStockOnly,
    setIsAnalyticsOpen,
    transactions,
    setActiveReceipt,
    resetAllDemoData,
    totalItemsCount,
    total,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const lowStockCount = products.filter(
    (p) => p.stock < settings.lowStockThreshold
  ).length;

  const todayRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand Identity & Author Attribution */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Pulse<span className="text-emerald-400">POS</span>
              </span>
              <span className="hidden rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:inline-block">
                v1.0 Terminal
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate max-w-[180px] sm:max-w-none">
                {settings.storeName}
              </span>
              <span className="text-slate-700">•</span>
              <a
                href="https://github.com/omarkhlifi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-slate-300 transition hover:text-emerald-400"
                title="Built by Omar Khlifi — MIT License"
              >
                <Github className="h-3 w-3" />
                <span>Omar Khlifi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Center Status Pills (Desktop) */}
        <div className="hidden items-center gap-2 xl:flex">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Cashier:</span>
            <span className="font-semibold text-white">{settings.cashierName}</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {transactions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveReceipt(transactions[0])}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
              title="View most recent receipt"
            >
              <Receipt className="h-3.5 w-3.5 text-indigo-400" />
              <span>Last Receipt:</span>
              <span className="font-mono font-semibold text-indigo-300">
                {transactions[0].receiptNumber}
              </span>
            </button>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Low Stock Filter Button */}
          <button
            type="button"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              showLowStockOnly
                ? 'border-amber-500/60 bg-amber-500/20 text-amber-200 shadow-sm shadow-amber-500/10'
                : lowStockCount > 0
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
            title="Filter items with low stock (< 5 remaining)"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Low Stock</span>
            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">
              {lowStockCount}
            </span>
          </button>

          {/* Analytics & Day-End Report Trigger */}
          <button
            type="button"
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/20"
          >
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span className="hidden md:inline">Day-End Report</span>
            <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-300">
              ${todayRevenue.toFixed(2)}
            </span>
          </button>

          {/* Reset Demo State */}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Reset PulsePOS demo data? This will restore default stock counts and sample transactions.'
                )
              ) {
                resetAllDemoData();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
            title="Reset Demo Inventory & Transactions"
            aria-label="Reset Demo Data"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Mobile Register Trigger */}
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 lg:hidden"
          >
            <span>Order ({totalItemsCount})</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

