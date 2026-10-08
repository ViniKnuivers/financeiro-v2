import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from 'styled-components';
import { MonthButton, MonthPickerContainer } from '../../components/MonthPicker/styles';
import { Delta, SummaryCard, SummaryContainer } from '../../components/Summary/styles';
import { yearSummary, type YearSummary } from '../../domain/summary';
import { useMoney, usePrivacy } from '../../hooks/usePrivacy';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDate, formatMonthLong, formatMonthShort, monthOf, today } from '../../lib/dates';
import { PeriodTabs } from '../Overview/components/PeriodTabs';
import { ChartCard, ChartsGrid, OverviewContainer, Toolbar } from '../Overview/styles';
import { Highlights, TopCategories } from './styles';

/** Categorias na lista "onde foi o dinheiro". */
const TOP_CATEGORIES = 8;

/** O ano em números: totais, médias, destaques e os 12 meses. */
export function YearOverview() {
  const { month, transactions, repositories } = useTransactions();
  const theme = useTheme();
  const formatCents = useMoney();
  const { hidden } = usePrivacy();
  const [year, setYear] = useState(() => Number(month.slice(0, 4)));
  const [loaded, setLoaded] = useState<{ year: number; summary: YearSummary } | null>(null);
  const [failed, setFailed] = useState(false);

  // Recarrega quando troca o ano ou algo é lançado/editado.
  useEffect(() => {
    let cancelled = false;
    repositories.transactions
      .list({ start: `${String(year)}-01-01`, end: `${String(year + 1)}-01-01` })
      .then(
        (list) => {
          if (!cancelled) {
            setFailed(false);
            setLoaded({ year, summary: yearSummary(list, year, monthOf(today())) });
          }
        },
        () => {
          if (!cancelled) setFailed(true);
        },
      );
    return () => {
      cancelled = true;
    };
  }, [repositories.transactions, year, transactions]);

  const data = loaded?.year === year ? loaded.summary : null;
  const value = (cents: number | undefined) => (cents === undefined ? '…' : formatCents(cents));
  const monthName = (m: string) => formatMonthLong(m).split(' de ')[0] ?? m;
  const tooltipStyle = {
    contentStyle: {
      background: theme['gray-900'],
      border: `1px solid ${theme['gray-600']}`,
      borderRadius: 6,
    },
    itemStyle: { color: theme['gray-100'] },
    labelStyle: { color: theme['gray-300'] },
  };
  const top = data?.categories.slice(0, TOP_CATEGORIES) ?? [];
  const hasData = (data?.activeMonths ?? 0) > 0;

  return (
    <>
      <SummaryContainer aria-label="Resumo do ano">
        <SummaryCard>
          <header>
            <span>Entradas em {year}</span>
            <ArrowCircleUpIcon size={32} color={theme['green-300']} />
          </header>
          <strong>{value(data?.incomeCents)}</strong>
          {hasData && data && (
            <Delta $tone="neutral">Média: {formatCents(data.averageIncomeCents)}/mês</Delta>
          )}
        </SummaryCard>
        <SummaryCard>
          <header>
            <span>Saídas em {year}</span>
            <ArrowCircleDownIcon size={32} color={theme['red-300']} />
          </header>
          <strong>{value(data?.outcomeCents)}</strong>
          {hasData && data && (
            <Delta $tone="neutral">Média: {formatCents(data.averageOutcomeCents)}/mês</Delta>
          )}
        </SummaryCard>
        <SummaryCard $variant="purple">
          <header>
            <span>Saldo de {year}</span>
            <WalletIcon size={32} color={theme.white} />
          </header>
          <strong>{value(data?.balanceCents)}</strong>
          {hasData && (
            <Delta $tone="neutral" $onPurple>
              {data?.activeMonths === 1 ? '1 mês' : `${String(data?.activeMonths)} meses`} com
              lançamentos
            </Delta>
          )}
        </SummaryCard>
      </SummaryContainer>

      <OverviewContainer>
        <Toolbar>
          <PeriodTabs />
          <MonthPickerContainer>
            <MonthButton
              type="button"
              aria-label="Ano anterior"
              onClick={() => {
                setYear((y) => y - 1);
              }}
            >
              <CaretLeftIcon size={20} />
            </MonthButton>
            <h2>{year}</h2>
            <MonthButton
              type="button"
              aria-label="Próximo ano"
              onClick={() => {
                setYear((y) => y + 1);
              }}
            >
              <CaretRightIcon size={20} />
            </MonthButton>
          </MonthPickerContainer>
        </Toolbar>

        {failed && (
          <ChartCard role="alert" style={{ marginTop: '1.5rem' }}>
            Não foi possível carregar o ano. Recarregue a página.
          </ChartCard>
        )}

        {data && !hasData && (
          <ChartCard style={{ marginTop: '1.5rem' }}>
            <p className="empty">Nenhum lançamento em {year} até agora.</p>
          </ChartCard>
        )}

        {data && hasData && (
          <>
            <Highlights aria-label="Destaques do ano">
              <li>
                <span>Mês mais caro</span>
                <strong>{data.priciestMonth ? monthName(data.priciestMonth.month) : '—'}</strong>
                {data.priciestMonth && (
                  <small>{formatCents(data.priciestMonth.outcomeCents)} de saídas</small>
                )}
              </li>
              <li>
                <span>Melhor saldo</span>
                <strong>{data.bestMonth ? monthName(data.bestMonth.month) : '—'}</strong>
                {data.bestMonth && <small>{formatCents(data.bestMonth.balanceCents)}</small>}
              </li>
              <li>
                <span>Categoria campeã</span>
                <strong>{data.categories[0]?.category ?? '—'}</strong>
                {data.categories[0] && <small>{data.categories[0].percent}% das saídas</small>}
              </li>
              <li>
                <span>Maior gasto</span>
                <strong>{data.biggestOutcome?.description ?? '—'}</strong>
                {data.biggestOutcome && (
                  <small>
                    {formatCents(data.biggestOutcome.amountCents)} ·{' '}
                    {formatDate(data.biggestOutcome.date)}
                  </small>
                )}
              </li>
            </Highlights>

            <ChartsGrid>
              <ChartCard>
                <h3>Onde foi o dinheiro</h3>
                <TopCategories>
                  {top.map((c) => (
                    <li key={c.category}>
                      <div>
                        <span>{c.category}</span>
                        <span>
                          {formatCents(c.cents)} · <strong>{c.percent}%</strong>
                        </span>
                      </div>
                      <div className="bar">
                        <div style={{ width: `${String(c.percent)}%` }} />
                      </div>
                    </li>
                  ))}
                </TopCategories>
              </ChartCard>

              <ChartCard>
                <h3>Entradas × saídas em {year}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.months} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke={theme['gray-600']} vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(m: string) => formatMonthShort(m).split('/')[0] ?? m}
                      stroke={theme['gray-400']}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(cents: number) =>
                        hidden ? '' : formatCents(cents).replace(/,00$/, '')
                      }
                      stroke={theme['gray-400']}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      formatter={(v) => (typeof v === 'number' ? formatCents(v) : '')}
                      labelFormatter={(m) => (typeof m === 'string' ? formatMonthLong(m) : '')}
                      cursor={{ fill: theme['gray-600'], opacity: 0.4 }}
                      {...tooltipStyle}
                    />
                    <Legend wrapperStyle={{ color: theme['gray-300'] }} />
                    <Bar
                      dataKey="incomeCents"
                      name="Entradas"
                      fill={theme['green-300']}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="outcomeCents"
                      name="Saídas"
                      fill={theme['red-300']}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </ChartsGrid>
          </>
        )}
      </OverviewContainer>
    </>
  );
}
