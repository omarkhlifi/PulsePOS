/**
 * PulsePOS — Main Application Shell
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React, { useState } from 'react';
import { POSProvider } from './context/POSContext';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Analytics } from './components/Analytics';
import { Footer, ToastContainer } from './components/Footer';

export const App: React.FC = () => {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  return (
    <POSProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
        {/* Top Terminal Bar */}
        <Header onOpenMobileCart={() => setIsMobileCartOpen(true)} />

        {/* Main Split-Screen Workspace */}
        <main className="mx-auto flex w-full max-w-[1600px] flex-1 overflow-hidden">
          <ProductGrid />
          <Cart
            isMobileOpen={isMobileCartOpen}
            onCloseMobile={() => setIsMobileCartOpen(false)}
          />
        </main>

        {/* Bottom Attribution & Status Footer */}
        <Footer />

        {/* Interactive Modals & Toast Feedback */}
        <PaymentModal />
        <ReceiptModal />
        <Analytics />
        <ToastContainer />
      </div>
    </POSProvider>
  );
};

export default App;

