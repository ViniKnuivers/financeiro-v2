import { categoryByMonth, categoryStats, yearSummary } from './summary';
import type { Transaction } from './transaction';

let seq = 0;
const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: String(++seq),
  type: 'outcome',
  description: 'iFood',
  category: 'Alimentação',
  amountCents: 5000,
  date: '2026-10-06',
  createdAt: '2026-10-06T12:00:00.000Z',
  ...overrides,
});

describe('categoria mês a mês', () => {
  const list = [
    tx({ date: '2026-07-10', amountCents: 4000 }),
    tx({ date: '2026-07-20', amountCents: 2000 }),
    tx({ date: '2026-09-05', amountCents: 9000 }),
    tx({ date: '2026-10-01', amountCents: 3000 }),
    tx({ date: '2026-10-02', category: 'Lazer', amountCents: 99900 }),
    tx({ date: '2026-10-03', type: 'income', amountCents: 77700 }),
  ];

  it('soma por mês, a partir do primeiro mês em que a categoria aparece', () => {
    expect(categoryByMonth(list, 'outcome', 'Alimentação', '2026-10', 12)).toEqual([
      { month: '2026-07', cents: 6000 },
      { month: '2026-08', cents: 0 },
      { month: '2026-09', cents: 9000 },
      { month: '2026-10', cents: 3000 },
    ]);
  });

  it('sem nenhum gasto, fica só o último mês', () => {
    expect(categoryByMonth(list, 'outcome', 'Saúde', '2026-10', 12)).toEqual([
      { month: '2026-10', cents: 0 },
    ]);
  });

  it('média conta os meses vazios no meio; o maior mês é o de mais gasto', () => {
    const months = categoryByMonth(list, 'outcome', 'Alimentação', '2026-10', 12);
    expect(categoryStats(months)).toEqual({
      averageCents: 4500,
      peak: { month: '2026-09', cents: 9000 },
    });
    expect(categoryStats([{ month: '2026-10', cents: 0 }])).toEqual({
      averageCents: 0,
      peak: null,
    });
  });
});

describe('resumo do ano', () => {
  const list = [
    tx({ date: '2025-12-20', amountCents: 100000 }),
    tx({ date: '2026-03-05', type: 'income', category: 'Salário', amountCents: 200000 }),
    tx({ date: '2026-03-10', category: 'Moradia', description: 'Aluguel', amountCents: 90000 }),
    tx({ date: '2026-05-05', type: 'income', category: 'Salário', amountCents: 200000 }),
    tx({ date: '2026-05-12', category: 'Compras', description: 'Notebook', amountCents: 150000 }),
    tx({ date: '2026-05-20', amountCents: 10000 }),
    // Parcela de um mês que ainda não chegou: aparece no gráfico, fora dos totais.
    tx({ date: '2026-11-12', category: 'Compras', description: 'Notebook', amountCents: 150000 }),
  ];
  const year = yearSummary(list, 2026, '2026-06');

  it('totais até o mês atual, sem o ano anterior nem os meses futuros', () => {
    expect(year.incomeCents).toBe(400000);
    expect(year.outcomeCents).toBe(250000);
    expect(year.balanceCents).toBe(150000);
  });

  it('média do primeiro mês com lançamento (março) até o atual (junho): 4 meses', () => {
    expect(year.activeMonths).toBe(4);
    expect(year.averageIncomeCents).toBe(100000);
    expect(year.averageOutcomeCents).toBe(62500);
  });

  it('destaques: mês mais caro, melhor saldo, categoria campeã e maior gasto', () => {
    expect(year.priciestMonth?.month).toBe('2026-05');
    expect(year.bestMonth?.month).toBe('2026-03');
    expect(year.categories[0]).toMatchObject({ category: 'Compras', cents: 150000, percent: 60 });
    expect(year.biggestOutcome?.description).toBe('Notebook');
    expect(year.biggestOutcome?.date).toBe('2026-05-12');
  });

  it('o gráfico tem os 12 meses, inclusive o futuro com parcela', () => {
    expect(year.months).toHaveLength(12);
    expect(year.months[10]).toMatchObject({ month: '2026-11', outcomeCents: 150000 });
  });

  it('ano passado conta até dezembro; ano sem nada fica zerado', () => {
    expect(yearSummary(list, 2025, '2026-06')).toMatchObject({
      outcomeCents: 100000,
      activeMonths: 1,
    });
    expect(yearSummary(list, 2024, '2026-06')).toMatchObject({
      activeMonths: 0,
      averageOutcomeCents: 0,
      priciestMonth: null,
      biggestOutcome: null,
    });
  });
});
