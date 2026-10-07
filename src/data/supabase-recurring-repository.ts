import type { SupabaseClient } from '@supabase/supabase-js';
import type { Recurring, RecurringInput } from '../domain/recurring';
import type { RecurringRepository } from './recurring-repository';

interface RecurringRow {
  id: string;
  type: 'income' | 'outcome';
  description: string;
  category: string;
  amount_cents: number;
  day_of_month: number;
  /** "YYYY-MM-01" */
  start_month: string;
  active: boolean;
}

const COLUMNS = 'id, type, description, category, amount_cents, day_of_month, start_month, active';

function fromRow(row: RecurringRow): Recurring {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    category: row.category,
    amountCents: row.amount_cents,
    dayOfMonth: row.day_of_month,
    startMonth: row.start_month.slice(0, 7),
    active: row.active,
  };
}

/** Gastos fixos no Supabase; quem lança os meses é a função materialize_recurring do banco. */
export class SupabaseRecurringRepository implements RecurringRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async list(): Promise<Recurring[]> {
    const { data, error } = await this.client
      .from('recurring')
      .select(COLUMNS)
      .eq('active', true)
      .order('day_of_month')
      .overrideTypes<RecurringRow[], { merge: false }>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data.map(fromRow);
  }

  async create(input: RecurringInput): Promise<Recurring> {
    const { data, error } = await this.client
      .from('recurring')
      .insert({
        type: input.type,
        description: input.description,
        category: input.category,
        amount_cents: input.amountCents,
        day_of_month: input.dayOfMonth,
        start_month: `${input.startMonth}-01`,
      })
      .select(COLUMNS)
      .single<RecurringRow>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return fromRow(data);
  }

  async stop(id: string): Promise<void> {
    const { error } = await this.client.from('recurring').update({ active: false }).eq('id', id);
    if (error) throw new Error(`Supabase: ${error.message}`);
  }

  async materialize(today: string): Promise<number> {
    const result = await this.client.rpc('materialize_recurring', { up_to: today });
    if (result.error) throw new Error(`Supabase: ${result.error.message}`);
    return Number(result.data as unknown);
  }
}
