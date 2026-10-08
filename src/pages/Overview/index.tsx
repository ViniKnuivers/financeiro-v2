import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from 'styled-components';
import { MonthPicker } from '../../components/MonthPicker';
import { Summary } from '../../components/Summary';
import {
  fromFirstActiveMonth,
  monthlyTotals,
  outcomeByCategory,
  type MonthTotals,
} from '../../domain/summary';
import { useTransactions } from '../../hooks/useTransactions';
import { addMonths, formatMonthLong, formatMonthShort, monthRange } from '../../lib/dates';
import { useMoney, usePrivacy } from '../../hooks/usePrivacy';
import { BudgetPanel } from './components/BudgetPanel';
import { CategoryHistory } from './components/CategoryHistory';
import { PeriodTabs } from './components/PeriodTabs';
import { RecurringPanel } from './components/RecurringPanel';
import { CategoryList, ChartCard, ChartsGrid, OverviewContainer, Toolbar } from './styles';

/** Meses no gráfico de entradas × saídas. */
const HISTORY_MONTHS = 6;

const CATEGORY_COLORS = [
  '#8257E5',
  '#00B37E',
  '#F75A68',
  '#FBA94C',
  '#4EA8DE',
  '#E05DB0',
  '#C4C4CC',
  '#B8E05D',
  '#5DE0C9',
  '#996DFF',
  '#7C7C8A',
];

export function Overview() {
  const { month, transactions, repositories } = useTransactions();
  const repository = repositories.transactions;
  const theme = useTheme();
  const [history, setHistory] = useState<MonthTotals[]>([]);
  // Categoria aberta na janela de evolução.
  const [opened, setOpened] = useState<string | null>(null);
  const formatCents = useMoney();
  const { hidden } = usePrivacy();

  // Os 6 meses até o mês da tela. Recarrega quando o mês muda ou algo é lançado/editado.
  useEffect(() => {
    let cancelled = false;
    const first = addMonths(month, -(HISTORY_MONTHS - 1));
    repository
      .list({ start: monthRange(first).start, end: monthRange(month).end })
      .then((list) => {
        if (!cancelled) {
          setHistory(fromFirstActiveMonth(monthlyTotals(list, month, HISTORY_MONTHS)));
        }
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, month, transactions]);

  // Cada fatia leva a própria cor (o Recharts lê o campo "fill" de cada item).
  const categories = outcomeByCategory(transactions).map((c, index) => ({
    ...c,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? theme['purple-500'],
  }));
  const money = (value: unknown) => (typeof value === 'number' ? formatCents(value) : '');
  const tooltipStyle = {
    contentStyle: {
      background: theme['gray-900'],
      border: `1px solid ${theme['gray-600']}`,
      borderRadius: 6,
    },
    itemStyle: { color: theme['gray-100'] },
    labelStyle: { color: theme['gray-300'] },
  };

  return (
    <>
      <Summary />
      <OverviewContainer>
        <Toolbar>
          <PeriodTabs />
          <MonthPicker />
        </Toolbar>

        <ChartsGrid>
          <ChartCard>
            <h3>Saídas por categoria</h3>
            {categories.length === 0 ? (
              <p className="empty">Nenhuma saída em {formatMonthLong(month)}.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="cents"
                      nameKey="category"
                      innerRadius="58%"
                      outerRadius="90%"
                      stroke={theme['gray-700']}
                    />
                    <Tooltip formatter={money} {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <CategoryList>
                  {categories.map((c) => (
                    <li key={c.category}>
                      <button
                        type="button"
                        title="Ver mês a mês"
                        onClick={() => {
                          setOpened(c.category);
                        }}
                      >
                        <span className="dot" style={{ background: c.fill }} />
                        <span className="name">{c.category}</span>
                        <span className="percent">{c.percent}%</span>
                        <strong>{formatCents(c.cents)}</strong>
                      </button>
                    </li>
                  ))}
                </CategoryList>
                <p className="hint">Toque numa categoria para ver mês a mês.</p>
              </>
            )}
          </ChartCard>

          <ChartCard>
            <h3>Entradas × saídas mês a mês</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={history} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid stroke={theme['gray-600']} vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value: string) => formatMonthShort(value)}
                  stroke={theme['gray-400']}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value: number) =>
                    hidden ? '' : formatCents(value).replace(/,00$/, '')
                  }
                  stroke={theme['gray-400']}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={money}
                  labelFormatter={(value) =>
                    typeof value === 'string' ? formatMonthLong(value) : ''
                  }
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

        <ChartsGrid>
          <ChartCard>
            <BudgetPanel />
          </ChartCard>
          <ChartCard>
            <RecurringPanel />
          </ChartCard>
        </ChartsGrid>
      </OverviewContainer>

      {opened && (
        <CategoryHistory
          category={opened}
          onClose={() => {
            setOpened(null);
          }}
        />
      )}
    </>
  );
}
