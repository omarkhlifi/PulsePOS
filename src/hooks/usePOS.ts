/**
 * PulsePOS — Custom Hook to access POS Context
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import { useContext } from 'react';
import { POSContext, POSContextValue } from '../context/POSContext';

export function usePOS(): POSContextValue {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}

