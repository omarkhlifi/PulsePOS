/**
 * PulsePOS — Day-End Analytics Report, Payment Split, Top Sellers & Inventory Manager
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { useMemo, useState } from 'react';
import {
  X,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  Download,
  Package,
  AlertTriangle,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { usePOS } from '../hooks/usePOS';

export const Analytics: React.FC = () => {
  const {
    isAnalyticsOpen,
    setIsAnalyticsOpen,
    transactions,
    products,
    settings,
    setActiveReceipt,
    restockProduct,
    resetAllDemoData,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'inventory'>('overview');

  const metrics = useMemo(() => {
    const grossRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const netSubtotal = transactions.reduce(
      (sum, t) => sum + (t.subtotal - t.discountAmount),
      0
    );
    const totalTax = transactions.reduce((sum, t) => sum + t.taxAmount, 0);
    const totalDiscounts = transactions.reduce(
      (sum, t) => sum + t.discountAmount,
      0
    );
    const totalOrders = transactions.length;
    const avgOrderValue = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    // Payment method split
    const split = {
      cash: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      wallet: { count: 0, amount: 0 },
    };

    // Top selling products map
    const itemStatsMap = new Map<
      string,
      { name: string; sku: string; qty: number; revenue: number }
    >();

    for (const txn of transactions) {
      const m = txn.payment.method;
      split[m].count += 1;
      split[m].amount += txn.total;

      for (const item of txn.items) {
        const current = itemStatsMap.get(item.productId) ?? {
          name: item.name,
          sku: item.sku,
          qty: 0,
          revenue: 0,
        };
        current.qty += item.quantity;
        current.revenue += item.subtotal;
        itemStatsMap.set(item.productId, current);
      }
    }

    const topSellingItems = Array.from(itemStatsMap.values()).sort(
      (a, b) => b.qty - a.qty || b.revenue - a.revenue
    );

    return {
      grossRevenue,
      netSubtotal,
      totalTax,
      totalDiscounts,
      totalOrders,
      avgOrderValue,
      split,
      topSellingItems,
    };
  }, [transactions]);

  if (!isAnalyticsOpen) return null;

  const lowStockProducts = products.filter(
    (p) => p.stock < settings.lowStockThreshold
  );

  const handleExportCSV = () => {
    const headers = [
      'ReceiptNumber',
      'Timestamp',
      'Customer',
      'Cashier',
      'PaymentMethod',
      'SubtotalUSD',
      'DiscountUSD',
      'TaxUSD',
      'TotalUSD',
      'AuthCode',
    ];
    const rows = transactions.map((t) => [
      t.receiptNumber,
      t.timestamp,
      `"${t.customerLabel.replace(/"/g, '""')}"`,
      `"${t.cashierName}"`,
      t.payment.method.toUpperCase(),
      t.subtotal.toFixed(2),
      t.discountAmount.toFixed(2),
      t.taxAmount.toFixed(2),
      t.total.toFixed(2),
      t.payment.authCode,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PulsePOS-DayEnd-Report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-modal-title"
    >
      <div className="animate-pop-in flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="analytics-modal-title" className="text-lg font-extrabold text-white">
                Day-End Shift Report & Inventory Analytics
              </h2>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                LIVE SHIFT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {settings.storeName} • Cashier: {settings.cashierName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAnalyticsOpen(false)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close Analytics Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-6 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Shift Overview & Top Sellers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'transactions'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Transactions Log ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Stock & Restock</span>
            {lowStockProducts.length > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] text-amber-300">
                {lowStockProducts.length} low
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Daily Gross Revenue</span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-extrabold text-emerald-400">
                    ${metrics.grossRevenue.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Net Subtotal: ${metrics.netSubtotal.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Transactions</span>
                    <ShoppingBag className="h-4 w-4 text-sky-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-extrabold text-white">
                    {metrics.totalOrders}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Completed shift tickets
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Average Ticket (AOV)</span>
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-extrabold text-indigo-300">
                    ${metrics.avgOrderValue.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Discounts given: ${metrics.totalDiscounts.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Tax Collected ({settings.taxRate}%)</span>
                    <Award className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-extrabold text-amber-300">
                    ${metrics.totalTax.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Accrued sales tax liability
                  </div>
                </div>
              </div>

              {/* Two-Column Breakdown: Payment Split + Top Selling Items */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Payment Method Split */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <h3 className="text-sm font-bold text-white">
                    Payment Method Split
                  </h3>
                  <p className="text-xs text-slate-400">
                    Revenue distribution by tender type
                  </p>

                  <div className="mt-4 space-y-4">
                    {[
                      {
                        key: 'card' as const,
                        label: 'Card Terminal (Tap / Chip)',
                        icon: <CreditCard className="h-4 w-4 text-sky-400" />,
                        barColor: 'bg-sky-500',
                        data: metrics.split.card,
                      },
                      {
                        key: 'cash' as const,
                        label: 'Cash Register (USD)',
                        icon: <Banknote className="h-4 w-4 text-emerald-400" />,
                        barColor: 'bg-emerald-500',
                        data: metrics.split.cash,
                      },
                      {
                        key: 'wallet' as const,
                        label: 'Digital Wallet (QR)',
                        icon: <QrCode className="h-4 w-4 text-purple-400" />,
                        barColor: 'bg-purple-500',
                        data: metrics.split.wallet,
                      },
                    ].map((row) => {
                      const pct =
                        metrics.grossRevenue > 0
                          ? (row.data.amount / metrics.grossRevenue) * 100
                          : 0;
                      return (
                        <div key={row.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-semibold text-slate-200">
                              {row.icon}
                              <span>{row.label}</span>
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                                {row.data.count} txns
                              </span>
                            </div>
                            <div className="font-mono font-bold text-white">
                              ${row.data.amount.toFixed(2)}{' '}
                              <span className="text-[11px] font-normal text-slate-400">
                                ({pct.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${row.barColor}`}
                              style={{ width: `${Math.max(pct, row.data.count > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top-Selling Items */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <h3 className="text-sm font-bold text-white">
                    Top-Selling Items
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ranked by units sold and gross item revenue
                  </p>

                  {metrics.topSellingItems.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500">
                      No item sales recorded yet in this shift.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {metrics.topSellingItems.slice(0, 6).map((item, idx) => {
                        const maxQty = metrics.topSellingItems[0].qty || 1;
                        const barPct = (item.qty / maxQty) * 100;
                        return (
                          <div key={item.sku} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-800 font-mono text-[10px] font-bold text-emerald-400">
                                  #{idx + 1}
                                </span>
                                <span className="truncate font-semibold text-slate-200">
                                  {item.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  [{item.sku}]
                                </span>
                              </div>
                              <div className="shrink-0 font-mono text-xs">
                                <span className="font-bold text-emerald-400">
                                  {item.qty} sold
                                </span>{' '}
                                <span className="text-slate-400">
                                  • ${item.revenue.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS HISTORY TAB */}
          {activeTab === 'transactions' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No transactions completed yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-950 text-[11px] uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Receipt #</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3 text-right">Total (USD)</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {transactions.map((txn) => (
                        <tr
                          key={txn.id}
                          className="hover:bg-slate-900/60 transition"
                        >
                          <td className="px-4 py-3 font-mono font-bold text-indigo-300">
                            {txn.receiptNumber}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {new Date(txn.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-200">
                            {txn.customerLabel}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {txn.items.reduce((s, i) => s + i.quantity, 0)} units
                          </td>
                          <td className="px-4 py-3 uppercase font-mono text-[11px] text-slate-300">
                            {txn.payment.method}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-400">
                            ${txn.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAnalyticsOpen(false);
                                setActiveReceipt(txn);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:border-indigo-500/50 hover:text-indigo-300"
                            >
                              <Receipt className="h-3 w-3" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY & RESTOCK MANAGER TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2.5">
                  <Package className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Real-Time Inventory & Quick Restock
                    </h3>
                    <p className="text-xs text-slate-400">
                      Items below {settings.lowStockThreshold} units trigger a low-stock alert badge.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetAllDemoData}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                  <span>Reset All Demo Inventory</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((prod) => {
                  const isLow = prod.stock < settings.lowStockThreshold;
                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between rounded-xl border p-3 ${
                        prod.stock === 0
                          ? 'border-rose-500/50 bg-rose-950/20'
                          : isLow
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : 'border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-400">
                            {prod.sku}
                          </span>
                          {isLow && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="truncate text-xs font-bold text-white">
                          {prod.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                          Stock:{' '}
                          <strong
                            className={
                              prod.stock === 0
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-300'
                                : 'text-emerald-400'
                            }
                          >
                            {prod.stock} units
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => restockProduct(prod.id, 10)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>10</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

