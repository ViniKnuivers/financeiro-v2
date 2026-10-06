import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { SupabaseAuthGateway } from './auth/supabase-auth-gateway';
import { LocalTransactionsRepository } from './data/local-transactions-repository';
import { createSupabaseClient } from './data/supabase';
import { SupabaseTransactionsRepository } from './data/supabase-transactions-repository';

const root = document.getElementById('root');
if (!root) throw new Error('elemento #root não encontrado no index.html');

// Com o Supabase configurado (.env.local): login + dados na nuvem. Sem ele: só no navegador.
const supabase = createSupabaseClient(import.meta.env);
const repository = supabase
  ? new SupabaseTransactionsRepository(supabase)
  : new LocalTransactionsRepository();
const auth = supabase ? new SupabaseAuthGateway(supabase, window.location.origin) : null;

createRoot(root).render(
  <StrictMode>
    <App repository={repository} auth={auth} />
  </StrictMode>,
);
