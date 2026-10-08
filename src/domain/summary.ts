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

export interface CategoryMonth {
  month: string;
  cents: number;
}

/**
 * Quanto foi numa categoria em cada um dos `count` meses até `lastMonth`, a partir do
 * primeiro mês em que ela aparece (sem uma fila de zeros no começo).
 */
export function categoryByMonth(
  transactions: readonly Transaction[],
  type: TransactionType,
  category: string,
  lastMonth: string,
  count: number,
): CategoryMonth[] {
  const months = Array.from({ length: count }, (_, i) => addMonths(lastMonth, i - count + 1));
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type || t.category !== category) continue;
    const month = monthOf(t.date);
    totals.set(month, (totals.get(month) ?? 0) + t.amountCents);
  }
  const all = months.map((month) => ({ month, cents: totals.get(month) ?? 0 }));
  const first = all.findIndex((m) => m.cents > 0);
  return all.slice(first === -1 ? all.length - 1 : first);
}

export interface CategoryStats {
  /** Média por mês, contando os meses sem gasto depois do primeiro. */
  averageCents: number;
  /** O mês de maior gasto; null se nunca teve. */
  peak: CategoryMonth | null;
}

export function categoryStats(months: readonly CategoryMonth[]): CategoryStats {
  const total = months.reduce((sum, m) => sum + m.cents, 0);
  const peak = months.reduce<CategoryMonth | null>(
    (best, m) => (m.cents > 0 && (!best || m.cents > best.cents) ? m : best),
    null,
  );
  return {
    averageCents: months.length > 0 ? Math.round(total / months.length) : 0,
    peak,
  };
}

export interface YearSummary extends Summary {
  /** Os 12 meses do ano, de janeiro a dezembro (os futuros mostram o que já está lançado). */
  months: MonthTotals[];
  /** Meses que entram na média: do primeiro com lançamento até o mês atual (ou dezembro). */
  activeMonths: number;
  averageIncomeCents: number;
  averageOutcomeCents: number;
  /** O mês com mais saídas. */
  priciestMonth: MonthTotals | null;
  /** O mês com o maior saldo. */
  bestMonth: MonthTotals | null;
  categories: CategoryTotal[];
  /** A maior saída do ano. */
  biggestOutcome: Transaction | null;
}

/**
 * O ano em números, até `currentMonth` ("YYYY-MM"): parcelas e fixos de meses que ainda
 * não chegaram aparecem no gráfico, mas não entram nos totais nem nas médias.
 */
export function yearSummary(
  transactions: readonly Transaction[],
  year: number,
  currentMonth: string,
): YearSummary {
  const inYear = transactions.filter((t) => t.date.startsWith(`${String(year)}-`));
  const counted = inYear.filter((t) => monthOf(t.date) <= currentMonth);
  const months = monthlyTotals(inYear, `${String(year)}-12`, 12);
  const past = months.filter(
    (m) => m.month <= currentMonth && (m.incomeCents > 0 || m.outcomeCents > 0),
  );
  const first = past[0];
  const last = currentMonth < `${String(year)}-12` ? currentMonth : `${String(year)}-12`;
  const activeMonths = first
    ? months.filter((m) => m.month >= first.month && m.month <= last).length
    : 0;
  const totals = summarize(counted);
  const pick = (score: (m: MonthTotals) => number) =>
    past.reduce<MonthTotals | null>(
      (best, m) => (!best || score(m) > score(best) ? m : best),
      null,
    );

  return {
    ...totals,
    months,
    activeMonths,
    averageIncomeCents: activeMonths > 0 ? Math.round(totals.incomeCents / activeMonths) : 0,
    averageOutcomeCents: activeMonths > 0 ? Math.round(totals.outcomeCents / activeMonths) : 0,
    priciestMonth: past.some((m) => m.outcomeCents > 0) ? pick((m) => m.outcomeCents) : null,
    bestMonth: pick((m) => m.balanceCents),
    categories: outcomeByCategory(counted),
    biggestOutcome: counted
      .filter((t) => t.type === 'outcome')
      .reduce<Transaction | null>(
        (best, t) => (!best || t.amountCents > best.amountCents ? t : best),
        null,
      ),
  };
}
