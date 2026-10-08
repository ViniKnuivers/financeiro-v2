import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useState } from 'react';
import { ErrorText, SubmitButton } from '../../../components/TransactionModal/styles';
import { Content, Overlay } from '../../../components/ui/dialog';
import { budgetStatus, type Budget } from '../../../domain/budget';
import { outcomeByCategory } from '../../../domain/summary';
import { CATEGORIES } from '../../../domain/transaction';
import { useTransactions } from '../../../hooks/useTransactions';
import { useMoney } from '../../../hooks/usePrivacy';
import { centsToInput, parseAmountToCents } from '../../../lib/money';
import { BudgetRow, LimitsForm, PanelHeader } from './styles';

/** Orçamento do mês: uma barra por categoria com limite. */
export function BudgetPanel() {
  const { transactions, repositories } = useTransactions();
  const [budgets, setBudgets] = useState<Budget[] | null>(null);
  const [editing, setEditing] = useState(false);
  const formatCents = useMoney();

  const load = useCallback(() => {
    repositories.budgets.list().then(setBudgets, () => {
      setBudgets([]);
    });
  }, [repositories.budgets]);

  useEffect(load, [load]);

  const status = budgetStatus(budgets ?? [], outcomeByCategory(transactions));

  return (
    <>
      <PanelHeader>
        <h3>Orçamento do mês</h3>
        <button
          type="button"
          onClick={() => {
            setEditing(true);
          }}
        >
          Definir limites
        </button>
      </PanelHeader>

      {budgets !== null && status.length === 0 && (
        <p className="empty">
          Defina um limite por mês para as categorias que quer controlar (ex.: Lazer R$ 300).
        </p>
      )}
      {status.map((b) => (
        <BudgetRow key={b.category} $level={b.level}>
          <div>
            <span>{b.category}</span>
            <span>
              {formatCents(b.spentCents)} de {formatCents(b.limitCents)} ·{' '}
              <strong>{b.percent}%</strong>
            </span>
          </div>
          <div className="bar" role="progressbar" aria-label={b.category} aria-valuenow={b.percent}>
            <div style={{ width: `${String(Math.min(100, b.percent))}%` }} />
          </div>
        </BudgetRow>
      ))}

      {editing && (
        <LimitsDialog
          budgets={budgets ?? []}
          onClose={() => {
            setEditing(false);
            load();
          }}
        />
      )}
    </>
  );
}

function LimitsDialog({ budgets, onClose }: { budgets: Budget[]; onClose: () => void }) {
  const { repositories } = useTransactions();
  const current = new Map(budgets.map((b) => [b.category, b.limitCents]));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      CATEGORIES.outcome.map((category) => {
        const cents = current.get(category);
        return [category, cents === undefined ? '' : centsToInput(cents)];
      }),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const invalid = Object.entries(values).find(
      ([, text]) => text.trim() !== '' && !parseAmountToCents(text),
    );
    if (invalid) {
      setError(`Valor inválido em ${invalid[0]}.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const [category, text] of Object.entries(values)) {
        const cents = text.trim() === '' ? null : parseAmountToCents(text);
        const before = current.get(category) ?? null;
        if (cents === before) continue;
        if (cents === null || cents === 0) await repositories.budgets.remove(category);
        else await repositories.budgets.set(category, cents);
      }
      onClose();
    } catch {
      setError('Não foi possível salvar. Tente de novo.');
      setBusy(false);
    }
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content>
          <Dialog.Title>Limites por mês</Dialog.Title>
          <Dialog.Description>Deixe em branco para não ter limite.</Dialog.Description>
          <LimitsForm
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            {CATEGORIES.outcome.map((category) => (
              <label key={category}>
                <span>{category}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="sem limite"
                  aria-label={`Limite de ${category}`}
                  value={values[category] ?? ''}
                  onChange={(event) => {
                    setValues((v) => ({ ...v, [category]: event.target.value }));
                  }}
                />
              </label>
            ))}
            {error && <ErrorText role="alert">{error}</ErrorText>}
            <SubmitButton type="submit" disabled={busy}>
              Salvar limites
            </SubmitButton>
          </LimitsForm>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
