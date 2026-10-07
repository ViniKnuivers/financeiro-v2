import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { SupabaseAuthGateway } from './auth/supabase-auth-gateway';
import { LocalBudgetsRepository } from './data/local-budgets-repository';
import { LocalRecurringRepository } from './data/local-recurring-repository';
import { LocalTransactionsRepository } from './data/local-transactions-repository';
import type { Repositories } from './data/repositories';
import { createSupabaseClient } from './data/supabase';
import { SupabaseBudgetsRepository } from './data/supabase-budgets-repository';
import { SupabaseRecurringRepository } from './data/supabase-recurring-repository';
import { SupabaseTransactionsRepository } from './data/supabase-transactions-repository';

const root = document.getElementById('root');
if (!root) throw new Error('elemento #root não encontrado no index.html');

// Com o Supabase configurado (.env.local): login + dados na nuvem. Sem ele: só no navegador.
const supabase = createSupabaseClient(import.meta.env);
let repositories: Repositories;
if (supabase) {
  repositories = {
    transactions: new SupabaseTransactionsRepository(supabase),
    recurring: new SupabaseRecurringRepository(supabase),
    budgets: new SupabaseBudgetsRepository(supabase),
  };
} else {
  const transactions = new LocalTransactionsRepository();
  repositories = {
    transactions,
    recurring: new LocalRecurringRepository(transactions),
    budgets: new LocalBudgetsRepository(),
  };
}
const auth = supabase ? new SupabaseAuthGateway(supabase, window.location.origin) : null;

createRoot(root).render(
  <StrictMode>
    <App repositories={repositories} auth={auth} />
  </StrictMode>,
);
