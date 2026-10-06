import { useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { TransactionModalContext } from '../../contexts/transaction-modal-context';
import type { Transaction } from '../../domain/transaction';
import { useTransactions } from '../../hooks/useTransactions';
import { DeleteDialog } from '../DeleteDialog';
import { Header } from '../Header';
import { TransactionModal } from '../TransactionModal';

/** Cabeçalho + página + os modais de nova/editar transação e de exclusão. */
export function Layout() {
  const { create, update, remove } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  // Muda a cada abertura: o formulário é montado de novo, com os valores certos.
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [removing, setRemoving] = useState<Transaction | null>(null);

  const modal = useMemo(
    () => ({
      openCreate: () => {
        setEditing(null);
        setFormKey((key) => key + 1);
        setFormOpen(true);
      },
      openEdit: (transaction: Transaction) => {
        setEditing(transaction);
        setFormKey((key) => key + 1);
        setFormOpen(true);
      },
      confirmRemove: (transaction: Transaction) => {
        setRemoving(transaction);
      },
    }),
    [],
  );

  return (
    <TransactionModalContext value={modal}>
      <Header />
      <Outlet />

      <TransactionModal
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={(input) => (editing ? update(editing.id, input) : create(input))}
      />
      <DeleteDialog
        transaction={removing}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        onConfirm={(transaction) => remove(transaction.id)}
      />
    </TransactionModalContext>
  );
}
