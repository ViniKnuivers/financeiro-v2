import { createContext } from 'react';
import type { Transaction } from '../domain/transaction';

export interface TransactionModalContextValue {
  openCreate: () => void;
  openEdit: (transaction: Transaction) => void;
  confirmRemove: (transaction: Transaction) => void;
}

export const TransactionModalContext = createContext<TransactionModalContextValue | null>(null);
