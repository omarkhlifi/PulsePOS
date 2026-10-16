/**
 * PulsePOS — Printable & Downloadable Thermal Receipt Modal
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  X,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { usePOS } from '../hooks/usePOS';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, settings } = usePOS();

  if (!activeReceipt) return null;

  const formattedDate = new Date(activeReceipt.timestamp).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }
  );
  const formattedTime = new Date(activeReceipt.timestamp).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const divider = '================================================';
    const thinDivider = '------------------------------------------------';
    const lines: string[] = [
      divider,
      `           ${settings.storeName.toUpperCase()}`,
      `     ${settings.storeAddress}`,
      `               Tel: ${settings.storePhone}`,
      divider,
      `Receipt #:      ${activeReceipt.receiptNumber}`,
      `Transaction ID: ${activeReceipt.id}`,
      `Date / Time:    ${formattedDate} ${formattedTime}`,
      `Cashier:        ${activeReceipt.cashierName}`,
      `Customer:       ${activeReceipt.customerLabel}`,
      thinDivider,
      'ITEM                          QTY    SUBTOTAL',
      thinDivider,
      ...activeReceipt.items.map((item) => {
        const title = `${item.sku} ${item.name}`.slice(0, 28).padEnd(29, ' ');
        const qty = `${item.quantity}x`.padEnd(6, ' ');
        const sub = `$${item.subtotal.toFixed(2)}`.padStart(10, ' ');
        return `${title}${qty}${sub}\n  @ $${item.unitPrice.toFixed(2)} each`;
      }),
      thinDivider,
      `Subtotal:                          $${activeReceipt.subtotal.toFixed(2)}`,
      ...(activeReceipt.discountAmount > 0
        ? [
            `Discount:                         -$${activeReceipt.discountAmount.toFixed(
              2
            )}`,
          ]
        : []),
      `Tax (${activeReceipt.taxRate}%):                       $${activeReceipt.taxAmount.toFixed(
        2
      )}`,
      divider,
      `TOTAL (USD):                       $${activeReceipt.total.toFixed(2)}`,
      divider,
      `Payment Method: ${activeReceipt.payment.method.toUpperCase()}`,
      `Amount Tendered:                   $${activeReceipt.payment.amountTendered.toFixed(
        2
      )}`,
      `Change Due:                        $${activeReceipt.payment.changeDue.toFixed(
        2
      )}`,
      `Auth Code:      ${activeReceipt.payment.authCode}`,
      thinDivider,
      '       Thank you for visiting PulsePOS!',
      '    Built by Omar Khlifi • MIT Open Source',
      divider,
    ];

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReceipt.receiptNumber}-receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="animate-pop-in flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span id="receipt-modal-title" className="text-sm font-bold text-white">
              Payment Complete
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close receipt modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="flex-1 overflow-y-auto p-5">
          <div
            id="printable-receipt"
            className="mx-auto w-full rounded-2xl bg-white p-6 font-mono text-xs text-slate-900 shadow-inner"
          >
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
                <Zap className="h-5 w-5 fill-emerald-400" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-950">
                {settings.storeName}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-600">
                {settings.storeAddress}
              </p>
              <p className="text-[11px] text-slate-600">
                Tel: {settings.storePhone}
              </p>
            </div>

            {/* Metadata */}
            <div className="border-b border-dashed border-slate-300 py-3 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">RECEIPT #:</span>
                <span className="font-bold text-slate-900">
                  {activeReceipt.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TXN ID:</span>
                <span className="text-slate-700">{activeReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DATE / TIME:</span>
                <span className="text-slate-800">
                  {formattedDate} {formattedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CASHIER:</span>
                <span className="text-slate-800">{activeReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CUSTOMER:</span>
                <span className="font-semibold text-slate-900">
                  {activeReceipt.customerLabel}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-b border-dashed border-slate-300 py-3">
              <div className="mb-2 flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Item / SKU</span>
                <span>Total (USD)</span>
              </div>
              <div className="space-y-2.5">
                {activeReceipt.items.map((item) => (
                  <div key={item.productId} className="text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="pr-2">
                        {item.name}{' '}
                        <span className="font-normal text-slate-500">
                          [{item.sku}]
                        </span>
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="border-b border-dashed border-slate-300 py-3 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>SUBTOTAL</span>
                <span>${activeReceipt.subtotal.toFixed(2)}</span>
              </div>
              {activeReceipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>
                    DISCOUNT (
                    {activeReceipt.discount.type === 'percentage'
                      ? `${activeReceipt.discount.value}%`
                      : 'FIXED'}
                    )
                  </span>
                  <span>-${activeReceipt.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>TAX ({activeReceipt.taxRate}%)</span>
                <span>${activeReceipt.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-extrabold text-slate-950">
                <span>TOTAL PAID</span>
                <span>${activeReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-b border-dashed border-slate-300 py-3 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">PAYMENT METHOD:</span>
                <span className="font-bold uppercase text-slate-900">
                  {activeReceipt.payment.method === 'card'
                    ? `${activeReceipt.payment.cardBrand ?? 'Card'} (•••• ${
                        activeReceipt.payment.cardLastFour ?? '4242'
                      })`
                    : activeReceipt.payment.method === 'wallet'
                    ? activeReceipt.payment.walletProvider ?? 'Digital Wallet'
                    : 'CASH USD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AMOUNT TENDERED:</span>
                <span>${activeReceipt.payment.amountTendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CHANGE DUE:</span>
                <span className="font-bold">
                  ${activeReceipt.payment.changeDue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AUTH CODE:</span>
                <span>{activeReceipt.payment.authCode}</span>
              </div>
            </div>

            {/* Barcode Graphic & Footer */}
            <div className="pt-4 text-center">
              <svg
                viewBox="0 0 240 46"
                className="mx-auto h-11 w-48"
                aria-hidden="true"
              >
                {[
                  4, 10, 14, 22, 26, 34, 42, 46, 52, 60, 66, 72, 78, 86, 90, 96,
                  104, 112, 118, 124, 132, 138, 144, 152, 156, 164, 170, 178,
                  184, 190, 198, 204, 212, 218, 226, 232,
                ].map((x, idx) => (
                  <rect
                    key={x}
                    x={x}
                    y="2"
                    width={idx % 3 === 0 ? '4' : idx % 2 === 0 ? '2' : '3'}
                    height="36"
                    fill="#0f172a"
                  />
                ))}
              </svg>
              <p className="mt-1 text-[10px] tracking-widest text-slate-500">
                *{activeReceipt.receiptNumber}*
              </p>
              <p className="mt-2 text-[10px] font-semibold text-slate-700">
                Thank you for shopping at PulsePOS!
              </p>
              <p className="text-[9px] text-slate-400">
                Designed & Engineered by Omar Khlifi • MIT License
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions (Hidden in Print) */}
        <div className="no-print flex flex-wrap items-center gap-2 border-t border-slate-800 bg-slate-950 p-4">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4 text-sky-400" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-slate-800"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Download (.TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveReceipt(null)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start Next Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

