import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { filterAndSort, NO_FILTERS, summarize, type ListFilters } from '../domain/summary';
import { recurringFrom } from '../domain/recurring';
import { installmentPlan, type Transaction, type TransactionInput } from '../domain/transaction';
import type { Repositories } from '../data/repositories';
import { addMonths, monthOf, monthRange, today } from '../lib/dates';
import { TransactionsContext, type CreateOptions, type LoadStatus } from './transactions-context';

interface Loaded {
  month: string;
  version: number;
  transactions: Transaction[];
  previous: Transaction[] | null;
  accumulated: number | null;
  failed: boolean;
}

interface Props {
  repositories: Repositories;
  children: ReactNode;
  /** Mês inicial (testes); padrão: o atual. */
  initialMonth?: string;
}

export function TransactionsProvider({ repositories, children, initialMonth }: Props) {
  const repository = repositories.transactions;
  // Os gastos fixos são lançados uma vez, ao abrir (e ao criar um fixo novo). Guarda a
  // promessa, e não um "já fiz": duas cargas ao mesmo tempo esperam a mesma chamada.
  const materializing = useRef<Promise<void> | null>(null);
  const [month, setMonthState] = useState(() => initialMonth ?? monthOf(today()));
  const [filters, setFiltersState] = useState<ListFilters>(NO_FILTERS);
  // Muda a cada criação/edição/exclusão, para recarregar o mês.
  const [version, setVersion] = useState(0);
  // O último resultado carregado e de qual pedido (mês + versão) ele é.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    materializing.current ??= repositories.recurring
      .materialize(today())
      .catch(() => 0)
      .then(() => undefined);
    const prepare = materializing.current;
    // O mês da tela, o anterior (para a comparação) e o saldo acumulado, juntos.
    prepare
      .then(() =>
        Promise.all([
          repository.list(monthRange(month)),
          repository.list(monthRange(addMonths(month, -1))).catch(() => null),
          repository.balanceUntil(monthRange(month).end).catch(() => null),
        ]),
      )
      .then(
        ([list, previous, accumulated]) => {
          if (!cancelled) {
            setLoaded({ month, version, transactions: list, previous, accumulated, failed: false });
          }
        },
        () => {
          if (!cancelled) {
            setLoaded({
              month,
              version,
              transactions: [],
              previous: null,
              accumulated: null,
              failed: true,
            });
          }
        },
      );
    return () => {
      cancelled = true;
    };
  }, [repository, repositories.recurring, month, version]);

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
    async (input: TransactionInput, options: CreateOptions = {}) => {
      const installments = options.installments ?? 1;
      if (options.repeat) {
        await repositories.recurring.create(recurringFrom(input));
        await repositories.recurring.materialize(today());
      } else if (installments > 1) {
        await repository.createMany(installmentPlan(input, installments, crypto.randomUUID()));
      } else {
        await repository.create(input);
      }
      // Lançou em outro mês? Vai para ele, para a transação aparecer.
      if (monthOf(input.date) !== month) setMonth(monthOf(input.date));
      setVersion((v) => v + 1);
    },
    [repository, repositories.recurring, month, setMonth],
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

  const removeInstallments = useCallback(
    async (group: string) => {
      const removed = await repository.removeInstallments(group);
      setVersion((v) => v + 1);
      return removed;
    },
    [repository],
  );

  const restore = useCallback(
    async (...transactions: Transaction[]) => {
      for (const transaction of transactions) await repository.restore(transaction);
      setVersion((v) => v + 1);
    },
    [repository],
  );

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      month,
      setMonth,
      transactions,
      visible: filterAndSort(transactions, filters),
      summary: summarize(transactions),
      previousSummary: previous ? summarize(previous) : null,
      previousHasData: (previous?.length ?? 0) > 0,
      accumulatedCents: sameMonth?.accumulated ?? null,
      filters,
      setFilters,
      status,
      create,
      update,
      remove,
      removeInstallments,
      restore,
      refresh,
      repositories,
    }),
    [
      month,
      setMonth,
      transactions,
      previous,
      sameMonth,
      filters,
      setFilters,
      status,
      create,
      update,
      remove,
      removeInstallments,
      restore,
      refresh,
      repositories,
    ],
  );

  return <TransactionsContext value={value}>{children}</TransactionsContext>;
}
