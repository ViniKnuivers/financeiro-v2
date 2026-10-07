import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transaction, TransactionInput } from '../domain/transaction';
import type { DateRange, TransactionsRepository } from './transactions-repository';

/** Linha da tabela "transactions" (snake_case, como no banco). */
export interface TransactionRow {
  id: string;
  type: 'income' | 'outcome';
  description: string;
  category: string;
  amount_cents: number;
  date: string;
  created_at: string;
  installment_group: string | null;
  installment_number: number | null;
  installment_total: number | null;
  recurring_id: string | null;
}

const COLUMNS =
  'id, type, description, category, amount_cents, date, created_at, ' +
  'installment_group, installment_number, installment_total, recurring_id';

export function fromRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    category: row.category,
    amountCents: row.amount_cents,
    date: row.date,
    createdAt: row.created_at,
    installment:
      row.installment_group && row.installment_number && row.installment_total
        ? {
            group: row.installment_group,
            number: row.installment_number,
            total: row.installment_total,
          }
        : null,
    recurringId: row.recurring_id,
  };
}

/** Os campos que o formulário edita (parcela e fixo não mudam na edição). */
export function toRow(input: TransactionInput) {
  return {
    type: input.type,
    description: input.description,
    category: input.category,
    amount_cents: input.amountCents,
    date: input.date,
  };
}

/** Linha completa para criar ou devolver (inclui parcela e fixo). */
export function toNewRow(input: TransactionInput) {
  return {
    ...toRow(input),
    installment_group: input.installment?.group ?? null,
    installment_number: input.installment?.number ?? null,
    installment_total: input.installment?.total ?? null,
    recurring_id: input.recurringId ?? null,
  };
}

/**
 * Transações no Supabase (Postgres). Quem é o dono vem do login: o banco preenche o
 * user_id e as regras (RLS) só deixam ver e mexer nas próprias linhas.
 */
export class SupabaseTransactionsRepository implements TransactionsRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async list({ start, end }: DateRange): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select(COLUMNS)
      .gte('date', start)
      .lt('date', end)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .overrideTypes<TransactionRow[], { merge: false }>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data.map(fromRow);
  }

  async create(input: TransactionInput): Promise<Transaction> {
    const { data, error } = await this.client
      .from('transactions')
      .insert(toNewRow(input))
      .select(COLUMNS)
      .single<TransactionRow>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return fromRow(data);
  }

  async update(id: string, input: TransactionInput): Promise<Transaction> {
    const { data, error } = await this.client
      .from('transactions')
      .update(toRow(input))
      .eq('id', id)
      .select(COLUMNS)
      .single<TransactionRow>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return fromRow(data);
  }

  async restore(transaction: Transaction): Promise<void> {
    const { error } = await this.client.from('transactions').insert({
      ...toNewRow(transaction),
      id: transaction.id,
      created_at: transaction.createdAt,
    });
    if (error) throw new Error(`Supabase: ${error.message}`);
  }

  async createMany(inputs: TransactionInput[]): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from('transactions')
      .insert(inputs.map(toNewRow))
      .select(COLUMNS)
      .overrideTypes<TransactionRow[], { merge: false }>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data.map(fromRow);
  }

  async removeInstallments(group: string): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from('transactions')
      .delete()
      .eq('installment_group', group)
      .select(COLUMNS)
      .overrideTypes<TransactionRow[], { merge: false }>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data.map(fromRow);
  }

  async balanceUntil(end: string): Promise<number> {
    const result = await this.client.rpc('balance_until', { end_date: end });
    if (result.error) throw new Error(`Supabase: ${result.error.message}`);
    // bigint chega como número (ou texto, em valores muito grandes).
    return Number(result.data as unknown);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from('transactions').delete().eq('id', id);
    if (error) throw new Error(`Supabase: ${error.message}`);
  }
}
