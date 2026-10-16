/**
 * PulsePOS — Register / Order Panel (Cart, Discounts, Configurable Tax & Hold/Recall Tabs)
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  PauseCircle,
  PlayCircle,
  Tag,
  Percent,
  DollarSign,
  User,
  CreditCard,
  X,
  SlidersHorizontal,
  FolderClock,
} from 'lucide-react';
import { usePOS } from '../hooks/usePOS';

interface CartProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Cart: React.FC<CartProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const {
    cart,
    customerLabel,
    setCustomerLabel,
    discount,
    setDiscount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    totalItemsCount,
    heldOrders,
    holdCurrentOrder,
    recallHeldOrder,
    deleteHeldOrder,
    settings,
    updateSettings,
    setIsPaymentModalOpen,
  } = usePOS();

  const [showHeldDrawer, setShowHeldDrawer] = useState(false);
  const [showDiscountEditor, setShowDiscountEditor] = useState(false);
  const [showTaxEditor, setShowTaxEditor] = useState(false);
  const [taxInput, setTaxInput] = useState(String(settings.taxRate));

  const handleApplyTaxRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(taxInput);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 50) {
      updateSettings({ taxRate: Number(parsed.toFixed(2)) });
      setShowTaxEditor(false);
    }
  };

  const panelContent = (
    <aside
      aria-label="Active Register Order"
      className="flex h-full w-full flex-col border-l border-slate-800/90 bg-slate-900/95 text-slate-100 lg:w-[410px] xl:w-[440px]"
    >
      {/* Top Register Header */}
      <div className="border-b border-slate-800 px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Current Register</h2>
              <p className="text-[11px] text-slate-400">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in active ticket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Hold Order Button */}
            <button
              type="button"
              onClick={() => holdCurrentOrder()}
              disabled={cart.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              title="Put active order on hold"
            >
              <PauseCircle className="h-3.5 w-3.5" />
              <span>Hold</span>
            </button>

            {/* Recall Held Orders Toggle */}
            <button
              type="button"
              onClick={() => setShowHeldDrawer(!showHeldDrawer)}
              className={`relative inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                showHeldDrawer
                  ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                  : heldOrders.length > 0
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                  : 'border-slate-800 bg-slate-800/70 text-slate-400 hover:text-slate-200'
              }`}
              title="View held tabs & orders"
            >
              <FolderClock className="h-3.5 w-3.5" />
              <span>Tabs</span>
              <span className="rounded bg-slate-950/60 px-1.5 py-0.2 font-mono text-[10px] font-bold">
                {heldOrders.length}
              </span>
            </button>

            {/* Clear Cart */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20"
                title="Clear current order"
                aria-label="Clear current order"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Mobile Close Drawer Button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 lg:hidden"
                aria-label="Close Order Drawer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Customer / Table Tag Input */}
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1.5">
          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={customerLabel}
            onChange={(e) => setCustomerLabel(e.target.value)}
            placeholder="Customer name or Table #..."
            aria-label="Customer or Table Label"
            className="w-full bg-transparent text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          {customerLabel !== 'Walk-in Guest' && (
            <button
              type="button"
              onClick={() => setCustomerLabel('Walk-in Guest')}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Held Orders / Recall Tray */}
      {showHeldDrawer && (
        <div className="border-b border-slate-800 bg-slate-950/90 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Held Orders / Open Tabs ({heldOrders.length})
            </span>
            <button
              type="button"
              onClick={() => setShowHeldDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {heldOrders.length === 0 ? (
            <p className="py-3 text-center text-xs text-slate-500">
              No held orders yet. Click "Hold" to park an active customer tab.
            </p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {heldOrders.map((held) => {
                const heldSum = held.items.reduce(
                  (acc, i) => acc + i.product.price * i.quantity,
                  0
                );
                const heldCount = held.items.reduce(
                  (acc, i) => acc + i.quantity,
                  0
                );
                return (
                  <div
                    key={held.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {held.customerLabel}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {heldCount} items •{' '}
                        <span className="font-mono text-emerald-400">
                          ${heldSum.toFixed(2)}
                        </span>{' '}
                        •{' '}
                        {new Date(held.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          recallHeldOrder(held.id);
                          setShowHeldDrawer(false);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1 font-bold text-slate-950 transition hover:bg-sky-400"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>Recall</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHeldOrder(held.id)}
                        className="rounded-lg border border-slate-700 p-1 text-slate-400 hover:border-rose-500/40 hover:text-rose-400"
                        title="Discard held tab"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Line Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-600">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-300">
              Register Ticket is Empty
            </h3>
            <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-slate-500">
              Tap any product card or click "Simulate Barcode Scan" to add items to this order.
            </p>
            {heldOrders.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHeldDrawer(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20"
              >
                <FolderClock className="h-3.5 w-3.5" />
                <span>Recall Held Order ({heldOrders.length})</span>
              </button>
            )}
          </div>
        ) : (
          cart.map((item) => {
            const lineSubtotal = item.product.price * item.quantity;
            return (
              <div
                key={item.product.id}
                className="group rounded-xl border border-slate-800/90 bg-slate-950/60 p-3 transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
                        {item.product.sku}
                      </span>
                      <h4 className="truncate text-xs font-bold text-slate-100">
                        {item.product.name}
                      </h4>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 font-mono">
                      ${item.product.price.toFixed(2)} / unit
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-extrabold text-white">
                      ${lineSubtotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper & Delete Controls */}
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/60 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 active:scale-95"
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-emerald-500 hover:bg-slate-800 active:scale-95 disabled:opacity-40"
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="ml-1.5 text-[10px] text-slate-500">
                      ({item.product.stock} max)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
                    aria-label={`Remove ${item.product.name} from order`}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Discount & Tax Configurator Drawer */}
      <div className="border-t border-slate-800 bg-slate-950/90 px-4 py-3">
        {/* Quick Toggle Buttons for Discount & Tax Rate */}
        <div className="mb-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowDiscountEditor(!showDiscountEditor);
              setShowTaxEditor(false);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition ${
              discount.value > 0
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>
              {discount.value > 0
                ? `Discount (${
                    discount.type === 'percentage'
                      ? `${discount.value}%`
                      : `$${discount.value.toFixed(2)}`
                  })`
                : 'Add Discount'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTaxInput(String(settings.taxRate));
              setShowTaxEditor(!showTaxEditor);
              setShowDiscountEditor(false);
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
            title="Configure local sales tax rate"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>Tax: {settings.taxRate}%</span>
          </button>
        </div>

        {/* Expandable Discount Editor */}
        {showDiscountEditor && (
          <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">
                Order Discount
              </span>
              <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950 p-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setDiscount({ type: 'percentage', value: discount.value })
                  }
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    discount.type === 'percentage'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400'
                  }`}
                >
                  <Percent className="h-3 w-3" /> %
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDiscount({ type: 'fixed', value: discount.value })
                  }
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    discount.type === 'fixed'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400'
                  }`}
                >
                  <DollarSign className="h-3 w-3" /> USD
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                value={discount.value || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setDiscount({
                    ...discount,
                    value: Number.isNaN(val) ? 0 : Math.max(0, val),
                  });
                }}
                placeholder={
                  discount.type === 'percentage' ? 'e.g. 10 (%)' : 'e.g. 5.00 ($)'
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setDiscount({ type: 'percentage', value: 0 })}
                className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: '5% Off', type: 'percentage' as const, value: 5 },
                { label: '10% VIP', type: 'percentage' as const, value: 10 },
                { label: '15% Staff', type: 'percentage' as const, value: 15 },
                { label: '$2 Off', type: 'fixed' as const, value: 2 },
                { label: '$5 Off', type: 'fixed' as const, value: 5 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setDiscount({
                      type: preset.type,
                      value: preset.value,
                      label: preset.label,
                    })
                  }
                  className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Tax Rate Editor */}
        {showTaxEditor && (
          <form
            onSubmit={handleApplyTaxRate}
            className="mb-3 rounded-xl border border-slate-800 bg-slate-900 p-3"
          >
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Sales Tax Rate (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                step="0.05"
                value={taxInput}
                onChange={(e) => setTaxInput(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setTaxInput('8.25');
                  updateSettings({ taxRate: 8.25 });
                  setShowTaxEditor(false);
                }}
                className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                8.25%
              </button>
            </div>
          </form>
        )}

        {/* Financial Breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono text-slate-200">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>
                Discount{' '}
                {discount.type === 'percentage'
                  ? `(${discount.value}%)`
                  : '(Fixed USD)'}
              </span>
              <span className="font-mono">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Estimated Tax ({settings.taxRate}%)</span>
            <span className="font-mono text-slate-200">
              ${taxAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-slate-800 pt-2.5">
            <span className="text-sm font-bold text-white">Total Due (USD)</span>
            <span className="font-mono text-2xl font-extrabold tracking-tight text-emerald-400">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Primary Checkout CTA Button */}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            setIsPaymentModalOpen(true);
          }}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CreditCard className="h-4 w-4 stroke-[2.5]" />
          <span>
            {cart.length === 0
              ? 'Add Items to Checkout'
              : `Charge $${total.toFixed(2)}`}
          </span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Split-Screen Register */}
      <div className="hidden lg:flex lg:h-full">{panelContent}</div>

      {/* Mobile / Tablet Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm lg:hidden">
          <div className="h-full w-full max-w-md">{panelContent}</div>
        </div>
      )}
    </>
  );
};

