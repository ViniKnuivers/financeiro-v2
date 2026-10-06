import { z } from 'zod';
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
}

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
  })
  .refine((form) => CATEGORIES[form.type].includes(form.category), {
    path: ['category'],
    message: 'Escolha uma categoria',
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
