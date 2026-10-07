import { useCallback, useEffect, useState } from 'react';
import type { Recurring } from '../../../domain/recurring';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCents } from '../../../lib/money';
import { PanelHeader, RecurringList } from './styles';

/** Gastos fixos ativos, com o total por mês e "Parar de repetir". */
export function RecurringPanel() {
  const { repositories, transactions, refresh } = useTransactions();
  const [list, setList] = useState<Recurring[] | null>(null);
  // Confirmação em dois toques: o primeiro mostra "Parar?".
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(() => {
    repositories.recurring.list().then(setList, () => {
      setList([]);
    });
  }, [repositories.recurring]);

  // Recarrega quando o mês muda ou algo é lançado (um fixo novo, por exemplo).
  useEffect(load, [load, transactions]);

  const monthlyOutcome = (list ?? [])
    .filter((r) => r.type === 'outcome')
    .reduce((sum, r) => sum + r.amountCents, 0);

  async function stop(id: string) {
    await repositories.recurring.stop(id);
    setConfirming(null);
    load();
    refresh();
  }

  return (
    <>
      <PanelHeader>
        <h3>
          Gastos fixos
          {monthlyOutcome > 0 && <small> · {formatCents(monthlyOutcome)}/mês</small>}
        </h3>
      </PanelHeader>

      {list !== null && list.length === 0 && (
        <p className="empty">
          Marque “Repete todo mês” ao lançar algo (aluguel, assinaturas) e ele aparece aqui.
        </p>
      )}
      <RecurringList>
        {(list ?? []).map((r) => (
          <li key={r.id}>
            <div>
              <strong>{r.description}</strong>
              <span>
                {r.category} · todo dia {r.dayOfMonth}
              </span>
            </div>
            <span className={r.type}>
              {r.type === 'outcome' && '- '}
              {formatCents(r.amountCents)}
            </span>
            {confirming === r.id ? (
              <button type="button" className="danger" onClick={() => void stop(r.id)}>
                Parar?
              </button>
            ) : (
              <button
                type="button"
                aria-label={`Parar de repetir ${r.description}`}
                onClick={() => {
                  setConfirming(r.id);
                }}
              >
                Parar
              </button>
            )}
          </li>
        ))}
      </RecurringList>
    </>
  );
}
