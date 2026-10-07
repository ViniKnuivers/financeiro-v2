import { useCallback, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { TransactionModalContext } from '../../contexts/transaction-modal-context';
import type { Transaction } from '../../domain/transaction';
import { useTransactions } from '../../hooks/useTransactions';
import { Header } from '../Header';
import { Toast, type ToastMessage } from '../Toast';
import { TransactionModal } from '../TransactionModal';

/** Cabeçalho + página + o formulário de nova/editar transação e o aviso de "Desfazer". */
export function Layout() {
  const { create, update, remove, removeInstallments, restore } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  // Muda a cada abertura: o formulário é montado de novo, com os valores certos.
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    setToast((previous) => ({ ...message, id: (previous?.id ?? 0) + 1 }));
  }, []);
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

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
      removeWithUndo: (transaction: Transaction) => {
        const undo = (...removed: Transaction[]) => ({
          label: 'Desfazer',
          onClick: () => {
            restore(...removed).catch(() => {
              showToast({ text: 'Não foi possível desfazer. Lance de novo.' });
            });
          },
        });
        const installment = transaction.installment;
        remove(transaction.id).then(
          () => {
            showToast({
              text: `${transaction.description} apagado`,
              actions: installment
                ? [
                    undo(transaction),
                    {
                      label: 'Apagar as outras parcelas',
                      onClick: () => {
                        removeInstallments(installment.group).then(
                          (others) => {
                            showToast({
                              text: `${transaction.description}: todas as parcelas apagadas`,
                              actions: [undo(transaction, ...others)],
                            });
                          },
                          () => {
                            showToast({ text: 'Não foi possível apagar as outras parcelas.' });
                          },
                        );
                      },
                    },
                  ]
                : [undo(transaction)],
            });
          },
          () => {
            showToast({ text: 'Não foi possível apagar. Tente de novo.' });
          },
        );
      },
    }),
    [remove, removeInstallments, restore, showToast],
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
        onSubmit={(input, options) =>
          editing ? update(editing.id, input) : create(input, options)
        }
      />
      <Toast message={toast} onClose={closeToast} />
    </TransactionModalContext>
  );
}
