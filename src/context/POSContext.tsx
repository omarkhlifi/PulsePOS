/**
 * PulsePOS — Central Point-of-Sale State & Business Logic Context
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { createContext, useMemo, useState, useCallback } from 'react';
import {
  Product,
  ProductCategory,
  CartItem,
  Discount,
  Transaction,
  HeldOrder,
  StoreSettings,
  PaymentDetails,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  DEFAULT_STORE_SETTINGS,
} from '../data/mockProducts';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface ToastNotice {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface POSContextValue {
  // Catalog & Filtering
  products: Product[];
  selectedCategory: ProductCategory;
  setSelectedCategory: (category: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showLowStockOnly: boolean;
  setShowLowStockOnly: (val: boolean) => void;
  filteredProducts: Product[];

  // Cart & Active Order
  cart: CartItem[];
  customerLabel: string;
  setCustomerLabel: (label: string) => void;
  discount: Discount;
  setDiscount: (discount: Discount) => void;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, delta: number) => void;
  setCartItemQuantity: (productId: string, quantity: number) => void;
  updateCartItemNote: (productId: string, note: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartQuantity: (productId: string) => number;

  // Calculations
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  totalItemsCount: number;

  // Hold / Recall Orders
  heldOrders: HeldOrder[];
  holdCurrentOrder: (customLabel?: string) => boolean;
  recallHeldOrder: (heldOrderId: string) => void;
  deleteHeldOrder: (heldOrderId: string) => void;

  // Barcode / SKU Simulation
  simulateBarcodeScan: (codeOrSku?: string) => Product | null;

  // Checkout & Receipts
  transactions: Transaction[];
  activeReceipt: Transaction | null;
  setActiveReceipt: (transaction: Transaction | null) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isAnalyticsOpen: boolean;
  setIsAnalyticsOpen: (open: boolean) => void;
  completeCheckout: (payment: PaymentDetails) => Transaction | null;

  // Inventory & Settings Management
  settings: StoreSettings;
  updateSettings: (partial: Partial<StoreSettings>) => void;
  restockProduct: (productId: string, addedUnits: number) => void;
  setProductStock: (productId: string, newStock: number) => void;
  resetAllDemoData: () => void;

  // Feedback Toasts
  toasts: ToastNotice[];
  pushToast: (message: string, type?: ToastNotice['type']) => void;
  dismissToast: (id: string) => void;
}

export const POSContext = createContext<POSContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'pulsepos_products_v1',
  CART: 'pulsepos_active_cart_v1',
  HELD_ORDERS: 'pulsepos_held_orders_v1',
  TRANSACTIONS: 'pulsepos_transactions_v1',
  SETTINGS: 'pulsepos_settings_v1',
  CUSTOMER_LABEL: 'pulsepos_customer_label_v1',
  DISCOUNT: 'pulsepos_discount_v1',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts, resetProducts] = useLocalStorage<Product[]>(
    STORAGE_KEYS.PRODUCTS,
    INITIAL_PRODUCTS
  );
  const [cart, setCart, resetCart] = useLocalStorage<CartItem[]>(
    STORAGE_KEYS.CART,
    []
  );
  const [heldOrders, setHeldOrders, resetHeldOrders] = useLocalStorage<HeldOrder[]>(
    STORAGE_KEYS.HELD_ORDERS,
    []
  );
  const [transactions, setTransactions, resetTransactions] = useLocalStorage<Transaction[]>(
    STORAGE_KEYS.TRANSACTIONS,
    INITIAL_TRANSACTIONS
  );
  const [settings, setSettings, resetSettings] = useLocalStorage<StoreSettings>(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_STORE_SETTINGS
  );
  const [customerLabel, setCustomerLabel] = useLocalStorage<string>(
    STORAGE_KEYS.CUSTOMER_LABEL,
    'Walk-in Guest'
  );
  const [discount, setDiscount] = useLocalStorage<Discount>(
    STORAGE_KEYS.DISCOUNT,
    { type: 'percentage', value: 0 }
  );

  // Ephemeral UI State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, type: ToastNotice['type'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 3200);
    },
    [dismissToast]
  );

  const getCartQuantity = useCallback(
    (productId: string): number => {
      const found = cart.find((item) => item.product.id === productId);
      return found ? found.quantity : 0;
    },
    [cart]
  );

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesLowStock =
        !showLowStockOnly || product.stock < settings.lowStockThreshold;
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.barcode.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      return matchesCategory && matchesLowStock && matchesSearch;
    });
  }, [products, selectedCategory, showLowStockOnly, searchQuery, settings.lowStockThreshold]);

  // Add to Cart with Stock Enforcement
  const addToCart = useCallback(
    (product: Product, quantity = 1): boolean => {
      const liveProduct = products.find((p) => p.id === product.id) ?? product;
      if (liveProduct.stock <= 0) {
        pushToast(`"${liveProduct.name}" is out of stock.`, 'error');
        return false;
      }

      const existingItem = cart.find((item) => item.product.id === liveProduct.id);
      const currentQty = existingItem ? existingItem.quantity : 0;

      if (currentQty + quantity > liveProduct.stock) {
        pushToast(
          `Only ${liveProduct.stock} units of "${liveProduct.name}" available in stock.`,
          'warning'
        );
        return false;
      }

      setCart((prev) => {
        const index = prev.findIndex((item) => item.product.id === liveProduct.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            product: liveProduct,
            quantity: updated[index].quantity + quantity,
          };
          return updated;
        }
        return [...prev, { product: liveProduct, quantity }];
      });

      return true;
    },
    [products, cart, setCart, pushToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, delta: number) => {
      const liveProduct = products.find((p) => p.id === productId);
      setCart((prev) => {
        return prev
          .map((item) => {
            if (item.product.id !== productId) return item;
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            const maxStock = liveProduct ? liveProduct.stock : item.product.stock;
            if (nextQty > maxStock) {
              pushToast(`Max available stock (${maxStock}) reached.`, 'warning');
              return item;
            }
            return {
              ...item,
              product: liveProduct ?? item.product,
              quantity: nextQty,
            };
          })
          .filter((item): item is CartItem => item !== null);
      });
    },
    [products, setCart, pushToast]
  );

  const setCartItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        return;
      }
      const liveProduct = products.find((p) => p.id === productId);
      const maxStock = liveProduct ? liveProduct.stock : 999;
      const clampedQty = Math.min(quantity, maxStock);
      if (quantity > maxStock) {
        pushToast(`Adjusted to max stock (${maxStock}).`, 'warning');
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, product: liveProduct ?? item.product, quantity: clampedQty }
            : item
        )
      );
    },
    [products, setCart, pushToast]
  );

  const updateCartItemNote = useCallback(
    (productId: string, note: string) => {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, note } : item
        )
      );
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    },
    [setCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount({ type: 'percentage', value: 0 });
    setCustomerLabel('Walk-in Guest');
  }, [setCart, setDiscount, setCustomerLabel]);

  // Financial Calculations (USD)
  const { subtotal, discountAmount, taxAmount, total, totalItemsCount } = useMemo(() => {
    const rawSubtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    let calcDiscount = 0;
    if (discount.value > 0) {
      if (discount.type === 'percentage') {
        const clampedPct = Math.min(Math.max(discount.value, 0), 100);
        calcDiscount = rawSubtotal * (clampedPct / 100);
      } else {
        calcDiscount = Math.min(Math.max(discount.value, 0), rawSubtotal);
      }
    }

    const taxableAmount = Math.max(0, rawSubtotal - calcDiscount);
    const calcTax = taxableAmount * (Math.max(0, settings.taxRate) / 100);
    const calcTotal = taxableAmount + calcTax;

    return {
      subtotal: Number(rawSubtotal.toFixed(2)),
      discountAmount: Number(calcDiscount.toFixed(2)),
      taxAmount: Number(calcTax.toFixed(2)),
      total: Number(calcTotal.toFixed(2)),
      totalItemsCount: itemsCount,
    };
  }, [cart, discount, settings.taxRate]);

  // Hold / Recall Orders
  const holdCurrentOrder = useCallback(
    (customLabel?: string): boolean => {
      if (cart.length === 0) {
        pushToast('Cannot hold an empty order.', 'warning');
        return false;
      }
      const labelToUse =
        (customLabel && customLabel.trim()) ||
        (customerLabel && customerLabel !== 'Walk-in Guest'
          ? customerLabel
          : `Tab #${heldOrders.length + 1}`);

      const newHeldOrder: HeldOrder = {
        id: `hold-${Date.now()}`,
        customerLabel: labelToUse,
        createdAt: new Date().toISOString(),
        items: cart,
        discount,
      };

      setHeldOrders((prev) => [newHeldOrder, ...prev]);
      setCart([]);
      setDiscount({ type: 'percentage', value: 0 });
      setCustomerLabel('Walk-in Guest');
      pushToast(`Order held under "${labelToUse}".`, 'success');
      return true;
    },
    [cart, customerLabel, heldOrders.length, discount, setHeldOrders, setCart, setDiscount, setCustomerLabel, pushToast]
  );

  const recallHeldOrder = useCallback(
    (heldOrderId: string) => {
      const target = heldOrders.find((h) => h.id === heldOrderId);
      if (!target) return;

      // If there's an active cart, automatically hold it first so no work is lost
      if (cart.length > 0) {
        const autoHeld: HeldOrder = {
          id: `hold-${Date.now()}-swap`,
          customerLabel:
            customerLabel !== 'Walk-in Guest'
              ? `${customerLabel} (Swapped)`
              : `Auto-Held Tab`,
          createdAt: new Date().toISOString(),
          items: cart,
          discount,
        };
        setHeldOrders((prev) => [
          autoHeld,
          ...prev.filter((h) => h.id !== heldOrderId),
        ]);
      } else {
        setHeldOrders((prev) => prev.filter((h) => h.id !== heldOrderId));
      }

      // Sync recalled items with latest live product stock
      const syncedItems: CartItem[] = [];
      for (const item of target.items) {
        const liveProd = products.find((p) => p.id === item.product.id) ?? item.product;
        if (liveProd.stock > 0) {
          syncedItems.push({
            ...item,
            product: liveProd,
            quantity: Math.min(item.quantity, liveProd.stock),
          });
        }
      }

      setCart(syncedItems);
      setCustomerLabel(target.customerLabel);
      setDiscount(target.discount);
      pushToast(`Recalled order "${target.customerLabel}".`, 'info');
    },
    [heldOrders, cart, customerLabel, discount, products, setHeldOrders, setCart, setCustomerLabel, setDiscount, pushToast]
  );

  const deleteHeldOrder = useCallback(
    (heldOrderId: string) => {
      setHeldOrders((prev) => prev.filter((h) => h.id !== heldOrderId));
      pushToast('Held order removed.', 'info');
    },
    [setHeldOrders, pushToast]
  );

  // Barcode / SKU Scanner Simulation
  const simulateBarcodeScan = useCallback(
    (codeOrSku?: string): Product | null => {
      let matchedProduct: Product | undefined;

      if (codeOrSku && codeOrSku.trim()) {
        const q = codeOrSku.trim().toLowerCase();
        matchedProduct =
          products.find(
            (p) =>
              p.sku.toLowerCase() === q ||
              p.barcode.toLowerCase() === q
          ) ??
          products.find(
            (p) =>
              p.sku.toLowerCase().includes(q) ||
              p.barcode.toLowerCase().includes(q) ||
              p.name.toLowerCase().includes(q)
          );
      } else {
        // Pick a random in-stock product for instant 1-click barcode simulation
        const inStockProducts = products.filter((p) => p.stock > 0);
        if (inStockProducts.length > 0) {
          matchedProduct =
            inStockProducts[Math.floor(Math.random() * inStockProducts.length)];
        }
      }

      if (!matchedProduct) {
        pushToast(`No product matched barcode/SKU "${codeOrSku}".`, 'error');
        return null;
      }

      const added = addToCart(matchedProduct, 1);
      if (added) {
        pushToast(
          `Scanned [${matchedProduct.sku}] ${matchedProduct.name} — $${matchedProduct.price.toFixed(2)}`,
          'success'
        );
      }
      return matchedProduct;
    },
    [products, addToCart, pushToast]
  );

  // Complete Checkout & Decrement Inventory
  const completeCheckout = useCallback(
    (payment: PaymentDetails): Transaction | null => {
      if (cart.length === 0) return null;

      const receiptSeq = 8400 + transactions.length + 1;
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        receiptNumber: `PLS-${receiptSeq}`,
        timestamp: new Date().toISOString(),
        cashierName: settings.cashierName,
        customerLabel: customerLabel.trim() || 'Walk-in Guest',
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          unitPrice: item.product.price,
          quantity: item.quantity,
          subtotal: Number((item.product.price * item.quantity).toFixed(2)),
        })),
        subtotal,
        discount,
        discountAmount,
        taxRate: settings.taxRate,
        taxAmount,
        total,
        payment,
      };

      // Decrement product stock
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const soldItem = cart.find((c) => c.product.id === prod.id);
          if (!soldItem) return prod;
          return {
            ...prod,
            stock: Math.max(0, prod.stock - soldItem.quantity),
          };
        })
      );

      // Save transaction
      setTransactions((prev) => [newTransaction, ...prev]);

      // Reset current order
      setCart([]);
      setDiscount({ type: 'percentage', value: 0 });
      setCustomerLabel('Walk-in Guest');
      setIsPaymentModalOpen(false);
      setActiveReceipt(newTransaction);
      pushToast(`Order ${newTransaction.receiptNumber} completed!`, 'success');

      return newTransaction;
    },
    [
      cart,
      transactions.length,
      settings.cashierName,
      settings.taxRate,
      customerLabel,
      subtotal,
      discount,
      discountAmount,
      taxAmount,
      total,
      setProducts,
      setTransactions,
      setCart,
      setDiscount,
      setCustomerLabel,
      pushToast,
    ]
  );

  const updateSettings = useCallback(
    (partial: Partial<StoreSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
      pushToast('Register settings updated.', 'info');
    },
    [setSettings, pushToast]
  );

  const restockProduct = useCallback(
    (productId: string, addedUnits: number) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: Math.max(0, p.stock + addedUnits) }
            : p
        )
      );
      const target = products.find((p) => p.id === productId);
      if (target) {
        pushToast(`Restocked +${addedUnits} units for ${target.sku}.`, 'success');
      }
    },
    [setProducts, products, pushToast]
  );

  const setProductStock = useCallback(
    (productId: string, newStock: number) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
        )
      );
    },
    [setProducts]
  );

  const resetAllDemoData = useCallback(() => {
    resetProducts();
    resetCart();
    resetHeldOrders();
    resetTransactions();
    resetSettings();
    setCustomerLabel('Walk-in Guest');
    setDiscount({ type: 'percentage', value: 0 });
    pushToast('Demo catalog, stock & transactions restored to defaults.', 'info');
  }, [
    resetProducts,
    resetCart,
    resetHeldOrders,
    resetTransactions,
    resetSettings,
    setCustomerLabel,
    setDiscount,
    pushToast,
  ]);

  const value: POSContextValue = {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    showLowStockOnly,
    setShowLowStockOnly,
    filteredProducts,

    cart,
    customerLabel,
    setCustomerLabel,
    discount,
    setDiscount,
    addToCart,
    updateCartQuantity,
    setCartItemQuantity,
    updateCartItemNote,
    removeFromCart,
    clearCart,
    getCartQuantity,

    subtotal,
    discountAmount,
    taxAmount,
    total,
    totalItemsCount,

    heldOrders,
    holdCurrentOrder,
    recallHeldOrder,
    deleteHeldOrder,

    simulateBarcodeScan,

    transactions,
    activeReceipt,
    setActiveReceipt,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isAnalyticsOpen,
    setIsAnalyticsOpen,
    completeCheckout,

    settings,
    updateSettings,
    restockProduct,
    setProductStock,
    resetAllDemoData,

    toasts,
    pushToast,
    dismissToast,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

