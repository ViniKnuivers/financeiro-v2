import { useContext } from 'react';
import { TransactionModalContext } from '../contexts/transaction-modal-context';

/** Abre o formulário (nova/editar) e a confirmação de exclusão de qualquer lugar da tela. */
export function useTransactionModal() {
  const context = useContext(TransactionModalContext);
  if (!context) throw new Error('useTransactionModal precisa estar dentro do <Layout>');
  return context;
}
