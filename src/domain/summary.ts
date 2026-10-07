import { addMonths, monthOf } from '../lib/dates';
import { byNewest, type Transaction, type TransactionType } from './transaction';

export interface Summary {
  incomeCents: number;
  outcomeCents: number;
  /** Entradas − saídas. */
  balanceCents: number;
}

export function summarize(transactions: readonly Transaction[]): Summary {
  let incomeCents = 0;
  let outcomeCents = 0;
  for (const t of transactions) {
    if (t.type === 'income') incomeCents += t.amountCents;
    else outcomeCents += t.amountCents;
  }
  return { incomeCents, outcomeCents, balanceCents: incomeCents - outcomeCents };
}

export interface CategoryTotal {
  category: string;
  cents: number;
  /** 0 a 100. */
  percent: number;
}

/** Saídas por categoria, da maior para a menor. */
export function outcomeByCategory(transactions: readonly Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === 'outcome') totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountCents);
  }
  const all = [...totals.values()].reduce((sum, cents) => sum + cents, 0);
  return [...totals]
    .map(([category, cents]) => ({
      category,
      cents,
      percent: all > 0 ? Math.round((cents / all) * 100) : 0,
    }))
    .sort((a, b) => b.cents - a.cents);
}

export interface MonthTotals extends Summary {
  month: string;
}

/** Os `count` meses que terminam em `lastMonth`, do mais antigo ao mais novo. */
export function monthlyTotals(
  transactions: readonly Transaction[],
  lastMonth: string,
  count: number,
): MonthTotals[] {
  const months = Array.from({ length: count }, (_, i) => addMonths(lastMonth, i - count + 1));
  return months.map((month) => ({
    month,
    ...summarize(transactions.filter((t) => monthOf(t.date) === month)),
  }));
}

/**
 * Tira os meses vazios do começo: o gráfico abre no primeiro mês com lançamentos e ganha
 * uma coluna por mês, até o limite. Sem nenhum lançamento, fica só o último mês.
 */
export function fromFirstActiveMonth(months: readonly MonthTotals[]): MonthTotals[] {
  const first = months.findIndex((m) => m.incomeCents > 0 || m.outcomeCents > 0);
  return months.slice(first === -1 ? Math.max(0, months.length - 1) : first);
}

/** Busca por descrição ou categoria, sem diferenciar acentos nem maiúsculas. */
export function matchesSearch(transaction: Transaction, query: string): boolean {
  const normalize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  const target = normalize(query.trim());
  if (!target) return true;
  return (
    normalize(transaction.description).includes(target) ||
    normalize(transaction.category).includes(target)
  );
}

export interface ListFilters {
  query: string;
  type: 'all' | TransactionType;
  /** '' = todas. */
  category: string;
  sort: 'date' | 'amount';
}

export const NO_FILTERS: ListFilters = { query: '', type: 'all', category: '', sort: 'date' };

export function hasFilters(filters: ListFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.type !== NO_FILTERS.type ||
    filters.category !== NO_FILTERS.category ||
    filters.sort !== NO_FILTERS.sort
  );
}

/** Busca + tipo + categoria, em ordem de data (mais recentes) ou de valor (maiores). */
export function filterAndSort(
  transactions: readonly Transaction[],
  filters: ListFilters,
): Transaction[] {
  const list = transactions.filter(
    (t) =>
      matchesSearch(t, filters.query) &&
      (filters.type === 'all' || t.type === filters.type) &&
      (filters.category === '' || t.category === filters.category),
  );
  return filters.sort === 'amount'
    ? list.sort((a, b) => b.amountCents - a.amountCents || byNewest(a, b))
    : list.sort(byNewest);
}

/** Categorias que aparecem no mês, em ordem alfabética (para o filtro). */
export function categoriesIn(transactions: readonly Transaction[]): string[] {
  return [...new Set(transactions.map((t) => t.category))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
}

export type Change =
  | { kind: 'up' | 'down'; percent: number }
  | { kind: 'same' }
  /** O mês anterior não tinha nada para comparar. */
  | { kind: 'new' };

/** Variação em relação ao mês anterior (funciona com saldo negativo também). */
export function changeFrom(previous: number, current: number): Change {
  if (current === previous) return { kind: 'same' };
  if (previous === 0) return { kind: 'new' };
  const percent = Math.round((Math.abs(current - previous) / Math.abs(previous)) * 100);
  if (percent === 0) return { kind: 'same' };
  return { kind: current > previous ? 'up' : 'down', percent };
}
