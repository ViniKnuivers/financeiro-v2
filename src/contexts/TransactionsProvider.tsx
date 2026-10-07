import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { filterAndSort, NO_FILTERS, summarize, type ListFilters } from '../domain/summary';
import type { Transaction, TransactionInput } from '../domain/transaction';
import type { TransactionsRepository } from '../data/transactions-repository';
import { addMonths, monthOf, monthRange, today } from '../lib/dates';
import { TransactionsContext, type LoadStatus } from './transactions-context';

interface Loaded {
  month: string;
  version: number;
  transactions: Transaction[];
  previous: Transaction[] | null;
  failed: boolean;
}

interface Props {
  repository: TransactionsRepository;
  children: ReactNode;
  /** Mês inicial (testes); padrão: o atual. */
  initialMonth?: string;
}

export function TransactionsProvider({ repository, children, initialMonth }: Props) {
  const [month, setMonthState] = useState(() => initialMonth ?? monthOf(today()));
  const [filters, setFiltersState] = useState<ListFilters>(NO_FILTERS);
  // Muda a cada criação/edição/exclusão, para recarregar o mês.
  const [version, setVersion] = useState(0);
  // O último resultado carregado e de qual pedido (mês + versão) ele é.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    // O mês da tela e o anterior (para a comparação nos cartões), juntos.
    Promise.all([
      repository.list(monthRange(month)),
      repository.list(monthRange(addMonths(month, -1))).catch(() => null),
    ]).then(
      ([list, previous]) => {
        if (!cancelled) {
          setLoaded({ month, version, transactions: list, previous, failed: false });
        }
      },
      () => {
        if (!cancelled) {
          setLoaded({ month, version, transactions: [], previous: null, failed: true });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [repository, month, version]);

  const current = loaded?.month === month && loaded.version === version;
  const status: LoadStatus = !current ? 'loading' : loaded.failed ? 'error' : 'ready';
  // Recarregando o mesmo mês (depois de lançar algo), mostra a lista anterior até chegar a nova.
  const sameMonth = loaded?.month === month ? loaded : null;
  const transactions = useMemo(() => sameMonth?.transactions ?? [], [sameMonth]);
  const previous = sameMonth?.previous ?? null;

  // Trocou de mês: a categoria escolhida pode nem existir no outro; o resto continua.
  const setMonth = useCallback((next: string) => {
    setMonthState(next);
    setFiltersState((f) => ({ ...f, category: '' }));
  }, []);

  const setFilters = useCallback((change: Partial<ListFilters>) => {
    setFiltersState((f) => ({ ...f, ...change }));
  }, []);

  const create = useCallback(
    async (input: TransactionInput) => {
      await repository.create(input);
      // Lançou em outro mês? Vai para ele, para a transação aparecer.
      if (monthOf(input.date) !== month) setMonth(monthOf(input.date));
      setVersion((v) => v + 1);
    },
    [repository, month, setMonth],
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

  const restore = useCallback(
    async (transaction: Transaction) => {
      await repository.restore(transaction);
      setVersion((v) => v + 1);
    },
    [repository],
  );

  const value = useMemo(
    () => ({
      month,
      setMonth,
      transactions,
      visible: filterAndSort(transactions, filters),
      summary: summarize(transactions),
      previousSummary: previous ? summarize(previous) : null,
      previousHasData: (previous?.length ?? 0) > 0,
      filters,
      setFilters,
      status,
      create,
      update,
      remove,
      restore,
      repository,
    }),
    [
      month,
      setMonth,
      transactions,
      previous,
      filters,
      setFilters,
      status,
      create,
      update,
      remove,
      restore,
      repository,
    ],
  );

  return <TransactionsContext value={value}>{children}</TransactionsContext>;
}
