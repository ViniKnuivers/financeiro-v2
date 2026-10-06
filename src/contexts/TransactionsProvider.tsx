import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { matchesSearch, summarize } from '../domain/summary';
import type { Transaction, TransactionInput } from '../domain/transaction';
import type { TransactionsRepository } from '../data/transactions-repository';
import { monthOf, monthRange, today } from '../lib/dates';
import { TransactionsContext, type LoadStatus } from './transactions-context';

interface Loaded {
  month: string;
  version: number;
  transactions: Transaction[];
  failed: boolean;
}

interface Props {
  repository: TransactionsRepository;
  children: ReactNode;
  /** Mês inicial (testes); padrão: o atual. */
  initialMonth?: string;
}

export function TransactionsProvider({ repository, children, initialMonth }: Props) {
  const [month, setMonth] = useState(() => initialMonth ?? monthOf(today()));
  const [query, setQuery] = useState('');
  // Muda a cada criação/edição/exclusão, para recarregar o mês.
  const [version, setVersion] = useState(0);
  // O último resultado carregado e de qual pedido (mês + versão) ele é.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    repository.list(monthRange(month)).then(
      (list) => {
        if (!cancelled) setLoaded({ month, version, transactions: list, failed: false });
      },
      () => {
        if (!cancelled) setLoaded({ month, version, transactions: [], failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [repository, month, version]);

  const current = loaded?.month === month && loaded.version === version;
  const status: LoadStatus = !current ? 'loading' : loaded.failed ? 'error' : 'ready';
  // Recarregando o mesmo mês (depois de lançar algo), mostra a lista anterior até chegar a nova.
  const transactions = useMemo(
    () => (loaded?.month === month ? loaded.transactions : []),
    [loaded, month],
  );

  const create = useCallback(
    async (input: TransactionInput) => {
      await repository.create(input);
      // Lançou em outro mês? Vai para ele, para a transação aparecer.
      setMonth(monthOf(input.date));
      setVersion((v) => v + 1);
    },
    [repository],
  );

  const update = useCallback(
    async (id: string, input: TransactionInput) => {
      await repository.update(id, input);
      setVersion((v) => v + 1);
    },
    [repository],
  );

  const remove = useCallback(
    async (id: string) => {
      await repository.remove(id);
      setVersion((v) => v + 1);
    },
    [repository],
  );

  const value = useMemo(
    () => ({
      month,
      setMonth,
      transactions,
      visible: transactions.filter((t) => matchesSearch(t, query)),
      summary: summarize(transactions),
      query,
      setQuery,
      status,
      create,
      update,
      remove,
      repository,
    }),
    [month, transactions, query, status, create, update, remove, repository],
  );

  return <TransactionsContext value={value}>{children}</TransactionsContext>;
}
