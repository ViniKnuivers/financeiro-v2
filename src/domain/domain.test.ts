import {
  changeFrom,
  filterAndSort,
  NO_FILTERS,
  fromFirstActiveMonth,
  matchesSearch,
  monthlyTotals,
  outcomeByCategory,
  summarize,
} from './summary';
import { formToInput, transactionFormSchema, type Transaction } from './transaction';

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: '1',
  type: 'outcome',
  description: 'Almoço',
  category: 'Alimentação',
  amountCents: 3200,
  date: '2026-10-06',
  createdAt: '2026-10-06T12:00:00.000Z',
  ...overrides,
});

describe('resumo', () => {
  const list = [
    tx({ type: 'income', category: 'Salário', amountCents: 359600 }),
    tx({ amountCents: 3200 }),
    tx({ category: 'Transporte', amountCents: 1800 }),
    tx({ amountCents: 5000, date: '2026-09-30' }),
  ];

  it('entradas, saídas e saldo', () => {
    expect(summarize(list)).toEqual({
      incomeCents: 359600,
      outcomeCents: 10000,
      balanceCents: 349600,
    });
  });

  it('saídas por categoria, da maior para a menor, com porcentagem', () => {
    expect(outcomeByCategory(list)).toEqual([
      { category: 'Alimentação', cents: 8200, percent: 82 },
      { category: 'Transporte', cents: 1800, percent: 18 },
    ]);
  });

  it('totais mês a mês, incluindo meses vazios', () => {
    expect(monthlyTotals(list, '2026-10', 3).map((m) => [m.month, m.outcomeCents])).toEqual([
      ['2026-08', 0],
      ['2026-09', 5000],
      ['2026-10', 5000],
    ]);
  });

  it('o gráfico começa no primeiro mês com lançamentos', () => {
    const months = monthlyTotals(list, '2026-10', 6);
    expect(fromFirstActiveMonth(months).map((m) => m.month)).toEqual(['2026-09', '2026-10']);
    expect(fromFirstActiveMonth(monthlyTotals([], '2026-10', 6)).map((m) => m.month)).toEqual([
      '2026-10',
    ]);
  });

  it('busca por descrição ou categoria, sem acento nem maiúscula', () => {
    expect(matchesSearch(tx({}), 'almoco')).toBe(true);
    expect(matchesSearch(tx({}), 'ALIMENT')).toBe(true);
    expect(matchesSearch(tx({}), 'uber')).toBe(false);
    expect(matchesSearch(tx({}), '  ')).toBe(true);
  });
});

describe('filtros e comparação', () => {
  const list = [
    tx({ id: 'a', description: 'Almoço', amountCents: 3200, date: '2026-10-02' }),
    tx({
      id: 'b',
      description: 'Mercado',
      category: 'Mercado',
      amountCents: 15000,
      date: '2026-10-01',
    }),
    tx({
      id: 'c',
      type: 'income',
      description: 'Salário',
      category: 'Salário',
      amountCents: 359600,
      date: '2026-10-03',
    }),
  ];

  it('tipo, categoria e ordem (data ou maior valor)', () => {
    const ids = (filters: Partial<typeof NO_FILTERS>) =>
      filterAndSort(list, { ...NO_FILTERS, ...filters }).map((t) => t.id);
    expect(ids({})).toEqual(['c', 'a', 'b']);
    expect(ids({ type: 'outcome' })).toEqual(['a', 'b']);
    expect(ids({ type: 'outcome', sort: 'amount' })).toEqual(['b', 'a']);
    expect(ids({ category: 'Mercado' })).toEqual(['b']);
    expect(ids({ query: 'almo', type: 'income' })).toEqual([]);
  });

  it('variação contra o mês anterior, inclusive com saldo negativo', () => {
    expect(changeFrom(10000, 12000)).toEqual({ kind: 'up', percent: 20 });
    expect(changeFrom(10000, 9200)).toEqual({ kind: 'down', percent: 8 });
    expect(changeFrom(-5000, 5000)).toEqual({ kind: 'up', percent: 200 });
    expect(changeFrom(0, 5000)).toEqual({ kind: 'new' });
    expect(changeFrom(5000, 5000)).toEqual({ kind: 'same' });
    expect(changeFrom(100000, 100001)).toEqual({ kind: 'same' });
  });
});

describe('formulário', () => {
  const valid = {
    type: 'outcome' as const,
    description: '  Mercado  ',
    amount: '150,90',
    category: 'Mercado',
    date: '2026-10-06',
    installments: 1,
    repeat: false,
  };

  it('converte o valor digitado em centavos e limpa a descrição', () => {
    const form = transactionFormSchema.parse(valid);
    expect(formToInput(form)).toEqual({
      type: 'outcome',
      description: 'Mercado',
      amountCents: 15090,
      category: 'Mercado',
      date: '2026-10-06',
    });
  });

  it('recusa valor zero ou inválido, descrição vazia e categoria do outro tipo', () => {
    const errors = (override: object) =>
      transactionFormSchema.safeParse({ ...valid, ...override }).error?.issues[0]?.message;
    expect(errors({ amount: '0' })).toBe('Digite um valor, ex.: 32,50');
    expect(errors({ amount: 'abc' })).toBe('Digite um valor, ex.: 32,50');
    expect(errors({ description: '   ' })).toBe('Descreva a transação');
    expect(errors({ category: 'Salário' })).toBe('Escolha uma categoria');
  });
});
