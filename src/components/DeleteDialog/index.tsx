import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import type { Transaction } from '../../domain/transaction';
import { formatDate } from '../../lib/dates';
import { formatCents } from '../../lib/money';
import { Actions, CancelButton, Content, DeleteButton, Overlay } from './styles';

interface Props {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (transaction: Transaction) => Promise<void>;
}

export function DeleteDialog({ transaction, onOpenChange, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function confirm() {
    if (!transaction) return;
    setBusy(true);
    setFailed(false);
    try {
      await onConfirm(transaction);
      onOpenChange(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={transaction !== null} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Dialog.Title>Apagar transação?</Dialog.Title>
          {transaction && (
            <Dialog.Description>
              <strong>{transaction.description}</strong>, {formatCents(transaction.amountCents)} em{' '}
              {formatDate(transaction.date)}. Não dá para desfazer.
            </Dialog.Description>
          )}
          {failed && <p role="alert">Não foi possível apagar. Tente de novo.</p>}
          <Actions>
            <Dialog.Close asChild>
              <CancelButton type="button">Cancelar</CancelButton>
            </Dialog.Close>
            <DeleteButton type="button" disabled={busy} onClick={() => void confirm()}>
              Apagar
            </DeleteButton>
          </Actions>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
