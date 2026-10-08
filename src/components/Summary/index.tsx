import { ArrowCircleDownIcon, ArrowCircleUpIcon, WalletIcon } from '@phosphor-icons/react';
import { useTheme } from 'styled-components';
import { changeFrom, type Summary as MonthSummary } from '../../domain/summary';
import { useTransactions } from '../../hooks/useTransactions';
import { addMonths, formatMonthLong } from '../../lib/dates';
import { useMoney } from '../../hooks/usePrivacy';
import { Accumulated, Delta, SummaryCard, SummaryContainer } from './styles';

type Key = keyof MonthSummary;

export function Summary() {
  const { summary, previousSummary, previousHasData, accumulatedCents, status, month } =
    useTransactions();
  const theme = useTheme();
  const formatCents = useMoney();
  const loading = status === 'loading';
  const value = (cents: number) => (loading ? '…' : formatCents(cents));
  const previousName = formatMonthLong(addMonths(month, -1)).split(' de ')[0] ?? '';

  /** "▲ 12% vs setembro": verde quando é bom (subir na entrada; cair na saída). */
  function delta(key: Key, upIsGood: boolean, onPurple = false) {
    if (loading || !previousSummary || !previousHasData) return null;
    const change = changeFrom(previousSummary[key], summary[key]);
    const text =
      change.kind === 'new'
        ? `sem ${previousName} para comparar`
        : change.kind === 'same'
          ? `= igual a ${previousName}`
          : `${change.kind === 'up' ? '▲' : '▼'} ${String(change.percent)}% vs ${previousName}`;
    const tone =
      change.kind === 'up' || change.kind === 'down'
        ? (change.kind === 'up') === upIsGood
          ? 'good'
          : 'bad'
        : 'neutral';
    return (
      <Delta $tone={tone} $onPurple={onPurple}>
        {text}
      </Delta>
    );
  }

  return (
    <SummaryContainer aria-label="Resumo do mês">
      <SummaryCard>
        <header>
          <span>Entradas</span>
          <ArrowCircleUpIcon size={32} color={theme['green-300']} />
        </header>
        <strong>{value(summary.incomeCents)}</strong>
        {delta('incomeCents', true)}
      </SummaryCard>

      <SummaryCard>
        <header>
          <span>Saídas</span>
          <ArrowCircleDownIcon size={32} color={theme['red-300']} />
        </header>
        <strong>{value(summary.outcomeCents)}</strong>
        {delta('outcomeCents', false)}
      </SummaryCard>

      <SummaryCard $variant="purple">
        <header>
          <span>Saldo do mês</span>
          <WalletIcon size={32} color={theme.white} />
        </header>
        <strong>{value(summary.balanceCents)}</strong>
        {delta('balanceCents', true, true)}
        {!loading && accumulatedCents !== null && (
          <Accumulated>Acumulado: {formatCents(accumulatedCents)}</Accumulated>
        )}
      </SummaryCard>
    </SummaryContainer>
  );
}
