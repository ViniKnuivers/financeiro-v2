import { ArrowCircleDownIcon, ArrowCircleUpIcon, WalletIcon } from '@phosphor-icons/react';
import { useTheme } from 'styled-components';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCents } from '../../lib/money';
import { SummaryCard, SummaryContainer } from './styles';

export function Summary() {
  const { summary, status } = useTransactions();
  const theme = useTheme();
  const value = (cents: number) => (status === 'loading' ? '…' : formatCents(cents));

  return (
    <SummaryContainer aria-label="Resumo do mês">
      <SummaryCard>
        <header>
          <span>Entradas</span>
          <ArrowCircleUpIcon size={32} color={theme['green-300']} />
        </header>
        <strong>{value(summary.incomeCents)}</strong>
      </SummaryCard>

      <SummaryCard>
        <header>
          <span>Saídas</span>
          <ArrowCircleDownIcon size={32} color={theme['red-300']} />
        </header>
        <strong>{value(summary.outcomeCents)}</strong>
      </SummaryCard>

      <SummaryCard $variant="purple">
        <header>
          <span>Saldo do mês</span>
          <WalletIcon size={32} color={theme.white} />
        </header>
        <strong>{value(summary.balanceCents)}</strong>
      </SummaryCard>
    </SummaryContainer>
  );
}
