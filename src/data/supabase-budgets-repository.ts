import type { SupabaseClient } from '@supabase/supabase-js';
import type { Budget } from '../domain/budget';
import type { BudgetsRepository } from './budgets-repository';

interface BudgetRow {
  category: string;
  limit_cents: number;
}

/** Limites por categoria no Supabase (um por usuário + categoria). */
export class SupabaseBudgetsRepository implements BudgetsRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async list(): Promise<Budget[]> {
    const { data, error } = await this.client
      .from('budgets')
      .select('category, limit_cents')
      .overrideTypes<BudgetRow[], { merge: false }>();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return data.map((row) => ({ category: row.category, limitCents: row.limit_cents }));
  }

  async set(category: string, limitCents: number): Promise<void> {
    const { error } = await this.client
      .from('budgets')
      .upsert({ category, limit_cents: limitCents }, { onConflict: 'user_id,category' });
    if (error) throw new Error(`Supabase: ${error.message}`);
  }

  async remove(category: string): Promise<void> {
    const { error } = await this.client.from('budgets').delete().eq('category', category);
    if (error) throw new Error(`Supabase: ${error.message}`);
  }
}
