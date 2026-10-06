-- Financeiro V2: tabela de transações, uma linha por entrada ou saída.
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  -- Dono da linha: preenchido sozinho com o usuário logado.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'outcome')),
  description text not null check (char_length(description) between 1 and 80),
  category text not null check (char_length(category) between 1 and 40),
  -- Sempre em centavos, positivo; o tipo diz se entrou ou saiu.
  amount_cents integer not null check (amount_cents > 0),
  date date not null,
  created_at timestamptz not null default now()
);

create index transactions_user_date on public.transactions (user_id, date desc, created_at desc);

-- Row Level Security: cada pessoa só enxerga e mexe nas próprias transações,
-- mesmo que alguém use a chave pública do site para chamar a API direto.
alter table public.transactions enable row level security;

create policy "ver as próprias" on public.transactions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "criar as próprias" on public.transactions
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "editar as próprias" on public.transactions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "apagar as próprias" on public.transactions
  for delete to authenticated using ((select auth.uid()) = user_id);
