import { XIcon } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useTheme } from 'styled-components';
import { CloseButton } from '../../../components/TransactionModal/styles';
import { Content, Overlay } from '../../../components/ui/dialog';
import {
  categoryByMonth,
  categoryStats,
  changeFrom,
  type CategoryMonth,
} from '../../../domain/summary';
import { useMoney } from '../../../hooks/usePrivacy';
import { useTransactions } from '../../../hooks/useTransactions';
import { addMonths, formatMonthLong, formatMonthShort, monthRange } from '../../../lib/dates';
import { HistoryStats } from './styles';

/** Meses na janela de evolução de uma categoria. */
const MONTHS = 12;

interface Props {
  category: string;
  onClose: () => void;
}

/** Quanto foi numa categoria (de saída) mês a mês, até o mês da tela. */
export function CategoryHistory({ category, onClose }: Props) {
  const { month, repositories } = useTransactions();
  const theme = useTheme();
  const formatCents = useMoney();
  const [months, setMonths] = useState<CategoryMonth[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const first = addMonths(month, -(MONTHS - 1));
    repositories.transactions
      .list({ start: monthRange(first).start, end: monthRange(month).end })
      .then(
        (list) => {
          if (!cancelled) setMonths(categoryByMonth(list, 'outcome', category, month, MONTHS));
        },
        () => {
          if (!cancelled) setFailed(true);
        },
      );
    return () => {
      cancelled = true;
    };
  }, [repositories.transactions, month, category]);

  const stats = months ? categoryStats(months) : null;
  const current = months?.at(-1)?.cents ?? 0;
  const vsAverage = stats ? changeFrom(stats.averageCents, current) : null;
  const shortMonth = (m: string) => formatMonthLong(m).split(' de ')[0] ?? m;

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Overlay />
        <Content aria-describedby={undefined} style={{ width: 'min(34rem, calc(100vw - 2rem))' }}>
          <CloseButton aria-label="Fechar">
            <XIcon size={22} />
          </CloseButton>
          <Dialog.Title>{category} mês a mês</Dialog.Title>

          {failed && <p role="alert">Não foi possível carregar. Tente de novo.</p>}
          {months && stats && (
            <>
              <HistoryStats>
                <div>
                  <span>Média por mês</span>
                  <strong>{formatCents(stats.averageCents)}</strong>
                </div>
                <div>
                  <span>Maior mês</span>
                  <strong>
                    {stats.peak
                      ? `${shortMonth(stats.peak.month)} · ${formatCents(stats.peak.cents)}`
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span>{shortMonth(month)} vs média</span>
                  <strong>
                    {!vsAverage || vsAverage.kind === 'new'
                      ? '—'
                      : vsAverage.kind === 'same'
                        ? '= na média'
                        : `${vsAverage.kind === 'up' ? '▲' : '▼'} ${String(vsAverage.percent)}%`}
                  </strong>
                </div>
              </HistoryStats>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={months} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={theme['gray-600']} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value: string) => formatMonthShort(value)}
                    stroke={theme['gray-400']}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => (typeof value === 'number' ? formatCents(value) : '')}
                    labelFormatter={(value) =>
                      typeof value === 'string' ? formatMonthLong(value) : ''
                    }
                    cursor={{ fill: theme['gray-600'], opacity: 0.4 }}
                    contentStyle={{
                      background: theme['gray-900'],
                      border: `1px solid ${theme['gray-600']}`,
                      borderRadius: 6,
                    }}
                    itemStyle={{ color: theme['gray-100'] }}
                    labelStyle={{ color: theme['gray-300'] }}
                  />
                  <Bar
                    dataKey="cents"
                    name={category}
                    fill={theme['purple-500']}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
