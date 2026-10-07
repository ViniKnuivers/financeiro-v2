import { createContext } from 'react';
import type { Transaction } from '../domain/transaction';

export interface TransactionModalContextValue {
  openCreate: () => void;
  openEdit: (transaction: Transaction) => void;
  /** Apaga na hora e mostra o aviso com "Desfazer". */
  removeWithUndo: (transaction: Transaction) => void;
}

export const TransactionModalContext = createContext<TransactionModalContextValue | null>(null);
