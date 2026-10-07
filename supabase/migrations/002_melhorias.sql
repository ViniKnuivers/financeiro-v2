-- Financeiro V2: parcelas, gastos fixos, orçamento, saldo acumulado e excluir conta.
-- Rode no Supabase: SQL Editor → New query → cole tudo → Run.

-- ---------------------------------------------------------------------------------------
-- Parcelas: as N parcelas de uma compra compartilham o mesmo installment_group.
-- ---------------------------------------------------------------------------------------
alter table public.transactions
  add column installment_group uuid,
  add column installment_number smallint,
  add column installment_total smallint,
  add constraint transactions_installment_check check (
    (installment_group is null and installment_number is null and installment_total is null)
    or (
      installment_group is not null
      and installment_total between 2 and 24
      and installment_number between 1 and installment_total
    )
  );

create index transactions_installment_group on public.transactions (installment_group)
  where installment_group is not null;

-- ---------------------------------------------------------------------------------------
-- Gastos fixos: lançados sozinhos todo mês, até o mês atual.
-- ---------------------------------------------------------------------------------------
create table public.recurring (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'outcome')),
  description text not null check (char_length(description) between 1 and 80),
  category text not null check (char_length(category) between 1 and 40),
  amount_cents integer not null check (amount_cents > 0),
  -- Dia do mês; em mês mais curto, vira o último dia (31 → 30/09, 28 ou 29/02).
  day_of_month smallint not null check (day_of_month between 1 and 31),
  -- Primeiro dia do primeiro mês em que entra.
  start_month date not null check (extract(day from start_month) = 1),
  -- Primeiro dia do último mês já lançado. Apagar um lançamento gerado não o recria.
  generated_through date check (generated_through is null or extract(day from generated_through) = 1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring enable row level security;

create policy "ver os próprios" on public.recurring
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "criar os próprios" on public.recurring
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "editar os próprios" on public.recurring
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "apagar os próprios" on public.recurring
  for delete to authenticated using ((select auth.uid()) = user_id);

alter table public.transactions
  add column recurring_id uuid references public.recurring (id) on delete set null;

-- Um lançamento por fixo por mês, mesmo que duas abas chamem a função ao mesmo tempo.
create unique index transactions_recurring_month
  on public.transactions (recurring_id, (date_trunc('month', date::timestamp)))
  where recurring_id is not null;

-- Lança o que falta de cada fixo ativo de quem chamou, do mês de início até o mês de
-- up_to. Roda com as permissões de quem chamou (RLS vale normalmente).
create or replace function public.materialize_recurring(up_to date)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  r public.recurring;
  target date := date_trunc('month', up_to)::date;
  m date;
  last_day integer;
  inserted integer;
  total integer := 0;
begin
  for r in
    select * from public.recurring
    where active and user_id = (select auth.uid())
    for update
  loop
    m := coalesce((r.generated_through + interval '1 month')::date, r.start_month);
    while m <= target loop
      last_day := extract(day from (m + interval '1 month' - interval '1 day'))::integer;
      insert into public.transactions
        (user_id, type, description, category, amount_cents, date, recurring_id)
      values
        (r.user_id, r.type, r.description, r.category, r.amount_cents,
         m + (least(r.day_of_month, last_day) - 1), r.id)
      on conflict do nothing;
      get diagnostics inserted = row_count;
      total := total + inserted;
      m := (m + interval '1 month')::date;
    end loop;
    if r.start_month <= target and (r.generated_through is null or r.generated_through < target) then
      update public.recurring set generated_through = target where id = r.id;
    end if;
  end loop;
  return total;
end;
$$;

-- ---------------------------------------------------------------------------------------
-- Orçamento: um limite mensal por categoria.
-- ---------------------------------------------------------------------------------------
create table public.budgets (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (char_length(category) between 1 and 40),
  limit_cents integer not null check (limit_cents > 0),
  primary key (user_id, category)
);

alter table public.budgets enable row level security;

create policy "ver os próprios" on public.budgets
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "criar os próprios" on public.budgets
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "editar os próprios" on public.budgets
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "apagar os próprios" on public.budgets
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------------------
-- Saldo acumulado: entradas − saídas antes de end_date (de quem chamou).
-- ---------------------------------------------------------------------------------------
create or replace function public.balance_until(end_date date)
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(sum(case when type = 'income' then amount_cents else -amount_cents end), 0)
  from public.transactions
  where user_id = (select auth.uid()) and date < end_date;
$$;

-- ---------------------------------------------------------------------------------------
-- Excluir a própria conta: apaga o usuário logado; as transações, os fixos e os
-- orçamentos vão junto (on delete cascade). Roda como dono do banco (security definer),
-- mas só consegue apagar quem chamou.
-- ---------------------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = me;
end;
$$;

-- Só quem está logado pode chamar as funções.
revoke execute on function public.materialize_recurring(date) from public, anon;
revoke execute on function public.balance_until(date) from public, anon;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.materialize_recurring(date) to authenticated;
grant execute on function public.balance_until(date) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
