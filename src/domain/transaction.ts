import { z } from 'zod';
import { addMonthsToDate } from '../lib/dates';
import { parseAmountToCents } from '../lib/money';

export type TransactionType = 'income' | 'outcome';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  /** Sempre positivo; o tipo diz se entrou ou saiu. */
  amountCents: number;
  /** "YYYY-MM-DD" */
  date: string;
  /** ISO 8601: desempata a ordem de lançamentos do mesmo dia. */
  createdAt: string;
  /** Parcela de uma compra parcelada (as N parcelas compartilham o grupo). */
  installment?: Installment | null;
  /** Lançado por um gasto fixo. */
  recurringId?: string | null;
}

export interface Installment {
  group: string;
  number: number;
  total: number;
}

export const MAX_INSTALLMENTS = 24;

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

export const CATEGORIES: Record<TransactionType, readonly string[]> = {
  income: ['Salário', 'Freela', 'Vendas', 'Investimentos', 'Presente', 'Outros'],
  outcome: [
    'Alimentação',
    'Mercado',
    'Transporte',
    'Moradia',
    'Contas',
    'Saúde',
    'Educação',
    'Lazer',
    'Assinaturas',
    'Compras',
    'Outros',
  ],
};

export const MAX_DESCRIPTION = 80;

/** O formulário de nova transação / edição: o valor chega como texto ("1.234,56"). */
export const transactionFormSchema = z
  .object({
    type: z.enum(['income', 'outcome']),
    description: z
      .string()
      .trim()
      .min(1, 'Descreva a transação')
      .max(MAX_DESCRIPTION, `Até ${MAX_DESCRIPTION} letras`),
    amount: z
      .string()
      .refine((value) => (parseAmountToCents(value) ?? 0) > 0, 'Digite um valor, ex.: 32,50'),
    category: z.string().min(1, 'Escolha uma categoria'),
    date: z.iso.date('Escolha a data'),
    /** Só em saídas novas: 1 = à vista. */
    installments: z.number().int().min(1).max(MAX_INSTALLMENTS),
    /** Só em lançamentos novos: vira um gasto fixo, lançado todo mês. */
    repeat: z.boolean(),
  })
  .refine((form) => CATEGORIES[form.type].includes(form.category), {
    path: ['category'],
    message: 'Escolha uma categoria',
  })
  .refine((form) => !(form.repeat && form.installments > 1), {
    path: ['repeat'],
    message: 'Parcelado ou fixo: escolha um dos dois',
  });

export type TransactionForm = z.infer<typeof transactionFormSchema>;

export function formToInput(form: TransactionForm): TransactionInput {
  return {
    type: form.type,
    description: form.description.trim(),
    category: form.category,
    amountCents: parseAmountToCents(form.amount) ?? 0,
    date: form.date,
  };
}

/** Mais recentes primeiro; no mesmo dia, o último lançado primeiro. */
export function byNewest(a: Transaction, b: Transaction): number {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

/** Divide em parcelas inteiras; a primeira fica com o resto (100,00 em 3x = 33,34 + 33,33 + 33,33). */
export function splitInstallments(totalCents: number, count: number): number[] {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base));
}

/** As N parcelas de uma compra, uma por mês a partir da data da compra. */
export function installmentPlan(
  input: TransactionInput,
  count: number,
  group: string,
): TransactionInput[] {
  return splitInstallments(input.amountCents, count).map((amountCents, index) => ({
    ...input,
    amountCents,
    date: addMonthsToDate(input.date, index),
    installment: { group, number: index + 1, total: count },
  }));
}
