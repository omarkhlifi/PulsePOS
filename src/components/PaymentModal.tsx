/**
 * PulsePOS — Checkout & Multi-Method Payment Simulator Modal (Cash, Card Terminal, Digital Wallet QR)
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  QrCode,
  CheckCircle2,
  Wifi,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Delete,
} from 'lucide-react';
import { PaymentMethod } from '../types';
import { usePOS } from '../hooks/usePOS';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    total,
    subtotal,
    discountAmount,
    taxAmount,
    settings,
    customerLabel,
    completeCheckout,
  } = usePOS();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashTenderedStr, setCashTenderedStr] = useState<string>('');
  const [cardBrand, setCardBrand] = useState<string>('Visa Contactless');
  const [cardStep, setCardStep] = useState<'idle' | 'processing' | 'approved'>('idle');
  const [walletProvider, setWalletProvider] = useState<string>('Apple Pay / PulseQR');
  const [walletStep, setWalletStep] = useState<'waiting' | 'verifying' | 'approved'>('waiting');

  useEffect(() => {
    if (isPaymentModalOpen) {
      setMethod('cash');
      setCashTenderedStr(total.toFixed(2));
      setCardStep('idle');
      setWalletStep('waiting');
    }
  }, [isPaymentModalOpen, total]);

  if (!isPaymentModalOpen) return null;

  const cashTendered = parseFloat(cashTenderedStr) || 0;
  const changeDue = Math.max(0, Number((cashTendered - total).toFixed(2)));
  const isCashSufficient = cashTendered >= total - 0.001;

  const handleNumpad = (key: string) => {
    if (key === 'CLR') {
      setCashTenderedStr('');
      return;
    }
    if (key === 'BACK') {
      setCashTenderedStr((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.' && cashTenderedStr.includes('.')) return;
    setCashTenderedStr((prev) => {
      const next = prev === total.toFixed(2) ? key : prev + key;
      return next;
    });
  };

  const handleCashConfirm = () => {
    if (!isCashSufficient) return;
    const authCode = `CSH-${Math.floor(100000 + Math.random() * 900000)}`;
    completeCheckout({
      method: 'cash',
      amountTendered: Number(cashTendered.toFixed(2)),
      changeDue,
      authCode,
    });
  };

  const handleSimulateCardTap = () => {
    if (cardStep !== 'idle') return;
    setCardStep('processing');
    window.setTimeout(() => {
      setCardStep('approved');
      window.setTimeout(() => {
        const lastFour = String(Math.floor(1000 + Math.random() * 9000));
        const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
        completeCheckout({
          method: 'card',
          amountTendered: total,
          changeDue: 0,
          cardLastFour: lastFour,
          cardBrand,
          authCode,
        });
      }, 650);
    }, 900);
  };

  const handleSimulateWalletScan = () => {
    if (walletStep !== 'waiting') return;
    setWalletStep('verifying');
    window.setTimeout(() => {
      setWalletStep('approved');
      window.setTimeout(() => {
        const authCode = `WLT-${Math.floor(100000 + Math.random() * 900000)}`;
        completeCheckout({
          method: 'wallet',
          amountTendered: total,
          changeDue: 0,
          walletProvider,
          authCode,
        });
      }, 600);
    }, 850);
  };

  // Quick bill denominations
  const quickBills = [
    { label: 'Exact', amount: total },
    { label: '$5', amount: 5 },
    { label: '$10', amount: 10 },
    { label: '$20', amount: 20 },
    { label: '$50', amount: 50 },
    { label: '$100', amount: 100 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="animate-pop-in relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div>
            <h2 id="payment-modal-title" className="text-lg font-extrabold text-white">
              Checkout & Payment Terminal
            </h2>
            <p className="text-xs text-slate-400">
              Customer: <span className="font-semibold text-slate-200">{customerLabel}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(false)}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close payment modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/60 px-6 py-3.5">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div>
              Subtotal: <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="text-emerald-400">
                Discount: <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div>
              Tax ({settings.taxRate}%):{' '}
              <span className="font-mono text-slate-200">${taxAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Amount Due:
            </span>
            <span className="font-mono text-2xl font-extrabold text-emerald-400">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-800 bg-slate-900/90 p-3">
          <button
            type="button"
            onClick={() => setMethod('cash')}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${
              method === 'cash'
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Banknote className="h-4 w-4" />
            <span>Cash Register</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${
              method === 'card'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300 shadow-sm'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Card (Tap / Chip)</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('wallet')}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${
              method === 'wallet'
                ? 'border-purple-500 bg-purple-500/15 text-purple-300 shadow-sm'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Digital Wallet QR</span>
          </button>
        </div>

        {/* Method Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. CASH PAYMENT */}
          {method === 'cash' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cash Tendered (USD)
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashTenderedStr}
                      onChange={(e) => setCashTenderedStr(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-8 pr-4 font-mono text-2xl font-extrabold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Quick Denominations */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Quick Denominations:
                    </span>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {quickBills.map((bill) => (
                        <button
                          key={bill.label}
                          type="button"
                          onClick={() => setCashTenderedStr(bill.amount.toFixed(2))}
                          className="rounded-xl border border-slate-700 bg-slate-950 py-2 font-mono text-xs font-bold text-slate-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
                        >
                          {bill.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Change Due Box */}
                <div
                  className={`rounded-2xl border p-4 ${
                    isCashSufficient
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-rose-500/40 bg-rose-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {isCashSufficient ? 'Change Due to Customer' : 'Remaining Balance'}
                    </span>
                    <span
                      className={`font-mono text-2xl font-extrabold ${
                        isCashSufficient ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      $
                      {isCashSufficient
                        ? changeDue.toFixed(2)
                        : (total - cashTendered).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isCashSufficient}
                  onClick={handleCashConfirm}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                  <span>Complete Cash Sale & Print Receipt</span>
                </button>
              </div>

              {/* Touch Keypad */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'BACK'].map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNumpad(key)}
                      className="flex h-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 font-mono text-base font-bold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800 active:scale-95"
                    >
                      {key === 'BACK' ? <Delete className="h-4 w-4" /> : key}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => handleNumpad('CLR')}
                  className="col-span-3 mt-1 rounded-xl border border-slate-800 bg-slate-900/60 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Clear Input
                </button>
              </div>
            </div>
          )}

          {/* 2. CARD TERMINAL SIMULATION */}
          {method === 'card' && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {['Visa Contactless', 'Mastercard Tap', 'Amex ExpressPay'].map(
                  (brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setCardBrand(brand)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        cardBrand === brand
                          ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {brand}
                    </button>
                  )
                )}
              </div>

              {/* Interactive Hardware Reader Visual */}
              <div
                onClick={handleSimulateCardTap}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSimulateCardTap();
                }}
                className={`group relative flex w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-3xl border-2 p-8 transition ${
                  cardStep === 'approved'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : cardStep === 'processing'
                    ? 'border-sky-400 bg-sky-500/10 animate-pulse'
                    : 'border-dashed border-sky-500/50 bg-slate-950/90 hover:border-sky-400 hover:bg-slate-950'
                }`}
              >
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                  {cardStep === 'approved' ? (
                    <CheckCircle2 className="h-11 w-11 text-emerald-400" />
                  ) : (
                    <>
                      <Wifi className="h-10 w-10 rotate-90" />
                      {cardStep === 'idle' && (
                        <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-sky-400" />
                      )}
                    </>
                  )}
                </div>

                <h3 className="mt-4 text-base font-extrabold text-white">
                  {cardStep === 'idle' && 'Tap, Insert, or Swipe Card on Terminal'}
                  {cardStep === 'processing' && 'Contacting Issuer & Authorizing...'}
                  {cardStep === 'approved' && 'Transaction Approved!'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {cardStep === 'idle' &&
                    `Click anywhere on this terminal pad to simulate ${cardBrand} payment of $${total.toFixed(
                      2
                    )}`}
                  {cardStep === 'processing' &&
                    'Verifying EMV cryptogram & zero-liability token...'}
                  {cardStep === 'approved' && 'Generating itemized thermal receipt...'}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 group-hover:bg-sky-400">
                  <span>
                    {cardStep === 'idle'
                      ? `Simulate Card Tap ($${total.toFixed(2)})`
                      : cardStep === 'processing'
                      ? 'Authorizing...'
                      : 'Approved'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>PCI-DSS End-to-End Encrypted Terminal Simulation</span>
              </div>
            </div>
          )}

          {/* 3. DIGITAL WALLET QR MOCKUP */}
          {method === 'wallet' && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {['Apple Pay / PulseQR', 'Google Pay QR', 'CashApp / Venmo QR'].map(
                  (provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setWalletProvider(provider)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        walletProvider === provider
                          ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {provider}
                    </button>
                  )
                )}
              </div>

              {/* Styled SVG QR Code Mockup */}
              <div className="relative rounded-3xl border border-purple-500/40 bg-white p-4 shadow-xl shadow-purple-950/30">
                <svg
                  viewBox="0 0 180 180"
                  className="h-44 w-44"
                  role="img"
                  aria-label="Digital Wallet Payment QR Code"
                >
                  <rect width="180" height="180" fill="#ffffff" rx="8" />
                  {/* Corner Finder Patterns */}
                  <g fill="#0f172a">
                    <rect x="14" y="14" width="42" height="42" rx="4" />
                    <rect x="20" y="20" width="30" height="30" fill="#ffffff" rx="2" />
                    <rect x="26" y="26" width="18" height="18" fill="#0f172a" rx="2" />

                    <rect x="124" y="14" width="42" height="42" rx="4" />
                    <rect x="130" y="20" width="30" height="30" fill="#ffffff" rx="2" />
                    <rect x="136" y="26" width="18" height="18" fill="#0f172a" rx="2" />

                    <rect x="14" y="124" width="42" height="42" rx="4" />
                    <rect x="20" y="130" width="30" height="30" fill="#ffffff" rx="2" />
                    <rect x="26" y="136" width="18" height="18" fill="#0f172a" rx="2" />
                  </g>
                  {/* Data Modules */}
                  <g fill="#0f172a">
                    <rect x="66" y="18" width="8" height="8" />
                    <rect x="82" y="18" width="16" height="8" />
                    <rect x="106" y="18" width="8" height="16" />
                    <rect x="66" y="34" width="16" height="8" />
                    <rect x="90" y="34" width="8" height="16" />
                    <rect x="66" y="50" width="8" height="8" />
                    <rect x="18" y="66" width="16" height="8" />
                    <rect x="42" y="66" width="8" height="16" />
                    <rect x="18" y="86" width="8" height="24" />
                    <rect x="34" y="94" width="16" height="8" />
                    <rect x="122" y="66" width="16" height="8" />
                    <rect x="146" y="66" width="16" height="16" />
                    <rect x="130" y="90" width="8" height="16" />
                    <rect x="150" y="98" width="12" height="8" />
                    <rect x="66" y="122" width="16" height="8" />
                    <rect x="90" y="114" width="8" height="16" />
                    <rect x="106" y="122" width="16" height="16" />
                    <rect x="130" y="126" width="24" height="8" />
                    <rect x="66" y="142" width="8" height="20" />
                    <rect x="82" y="150" width="24" height="8" />
                    <rect x="118" y="146" width="16" height="16" />
                    <rect x="142" y="142" width="20" height="20" rx="3" />
                  </g>
                  {/* Center PulsePOS Badge */}
                  <rect x="68" y="68" width="44" height="44" rx="10" fill="#10b981" />
                  <path
                    d="M93 76L81 92h9l-3 12 12-16h-9l3-12z"
                    fill="#022c22"
                  />
                </svg>

                {walletStep === 'approved' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-emerald-950/90 text-emerald-300">
                    <CheckCircle2 className="h-16 w-16" />
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-slate-300">
                Scan with <strong>{walletProvider}</strong> to pay{' '}
                <span className="font-mono font-bold text-emerald-400">
                  ${total.toFixed(2)}
                </span>
              </p>

              <button
                type="button"
                onClick={handleSimulateWalletScan}
                disabled={walletStep !== 'waiting'}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-purple-500/20 transition hover:bg-purple-400 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {walletStep === 'waiting'
                    ? 'Simulate Customer QR Scan'
                    : walletStep === 'verifying'
                    ? 'Confirming Wallet Token...'
                    : 'Payment Confirmed!'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

