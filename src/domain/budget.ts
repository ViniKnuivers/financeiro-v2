import type { CategoryTotal } from './summary';

export interface Budget {
  category: string;
  limitCents: number;
}

/** A partir de quanto do limite a barra fica âmbar. */
export const WARN_PERCENT = 80;

export interface BudgetStatus extends Budget {
  spentCents: number;
  /** Inteiro; pode passar de 100. */
  percent: number;
  level: 'ok' | 'warn' | 'over';
}

/** Cada limite com o quanto já foi gasto no mês, do mais apertado para o mais folgado. */
export function budgetStatus(
  budgets: readonly Budget[],
  spent: readonly CategoryTotal[],
): BudgetStatus[] {
  const byCategory = new Map(spent.map((c) => [c.category, c.cents]));
  return budgets
    .map((budget) => {
      const spentCents = byCategory.get(budget.category) ?? 0;
      const percent = Math.round((spentCents / budget.limitCents) * 100);
      const level: BudgetStatus['level'] =
        spentCents > budget.limitCents ? 'over' : percent >= WARN_PERCENT ? 'warn' : 'ok';
      return { ...budget, spentCents, percent, level };
    })
    .sort((a, b) => b.percent - a.percent || a.category.localeCompare(b.category, 'pt-BR'));
}
