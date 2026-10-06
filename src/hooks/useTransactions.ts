import { useContext } from 'react';
import { TransactionsContext } from '../contexts/transactions-context';

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions precisa estar dentro de <TransactionsProvider>');
  return context;
}
