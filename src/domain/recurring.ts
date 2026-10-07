import type { TransactionInput, TransactionType } from './transaction';

/** Gasto (ou receita) fixo: lançado sozinho todo mês, no mesmo dia. */
export interface Recurring {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amountCents: number;
  /** 1 a 31; em mês mais curto, vira o último dia. */
  dayOfMonth: number;
  /** Primeiro mês, "YYYY-MM". */
  startMonth: string;
  active: boolean;
}

export type RecurringInput = Omit<Recurring, 'id' | 'active'>;

/** Um lançamento novo marcado como "repete todo mês" vira um fixo a partir daquele mês. */
export function recurringFrom(input: TransactionInput): RecurringInput {
  return {
    type: input.type,
    description: input.description,
    category: input.category,
    amountCents: input.amountCents,
    dayOfMonth: Number(input.date.slice(8, 10)),
    startMonth: input.date.slice(0, 7),
  };
}
