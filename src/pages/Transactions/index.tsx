import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { MonthPicker } from '../../components/MonthPicker';
import { Summary } from '../../components/Summary';
import { useTransactionModal } from '../../hooks/useTransactionModal';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDate, formatMonthLong } from '../../lib/dates';
import { formatCents } from '../../lib/money';
import { SearchForm } from './components/SearchForm';
import {
  ActionButton,
  EmptyState,
  PriceHighlight,
  Toolbar,
  TransactionContainer,
  TransactionTable,
} from './styles';

export function Transactions() {
  const { visible, transactions, month, status, query } = useTransactions();
  const { openCreate, openEdit, confirmRemove } = useTransactionModal();

  return (
    <>
      <Summary />

      <TransactionContainer>
        <Toolbar>
          <MonthPicker />
          <SearchForm />
        </Toolbar>

        {status === 'error' && (
          <EmptyState role="alert">
            Não foi possível carregar as transações. Recarregue a página.
          </EmptyState>
        )}

        {status === 'ready' && transactions.length === 0 && (
          <EmptyState>
            <p>Nenhuma transação em {formatMonthLong(month)}.</p>
            <button type="button" onClick={openCreate}>
              <PlusIcon size={18} weight="bold" />
              Lançar a primeira
            </button>
          </EmptyState>
        )}

        {status === 'ready' && transactions.length > 0 && visible.length === 0 && (
          <EmptyState>
            <p>Nada encontrado para “{query}” neste mês.</p>
          </EmptyState>
        )}

        {visible.length > 0 && (
          <TransactionTable>
            <tbody>
              {visible.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="description">{transaction.description}</td>
                  <td className="amount">
                    <PriceHighlight $variant={transaction.type}>
                      {transaction.type === 'outcome' && '- '}
                      {formatCents(transaction.amountCents)}
                    </PriceHighlight>
                  </td>
                  <td className="category">{transaction.category}</td>
                  <td className="date">{formatDate(transaction.date)}</td>
                  <td className="actions">
                    <ActionButton
                      type="button"
                      aria-label={`Editar ${transaction.description}`}
                      onClick={() => {
                        openEdit(transaction);
                      }}
                    >
                      <PencilSimpleIcon size={20} />
                    </ActionButton>
                    <ActionButton
                      type="button"
                      $danger
                      aria-label={`Apagar ${transaction.description}`}
                      onClick={() => {
                        confirmRemove(transaction);
                      }}
                    >
                      <TrashIcon size={20} />
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </TransactionTable>
        )}
      </TransactionContainer>
    </>
  );
}
