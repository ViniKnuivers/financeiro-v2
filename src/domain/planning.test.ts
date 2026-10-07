import { addMonthsToDate, dayInMonth } from '../lib/dates';
import { budgetStatus } from './budget';
import { recurringFrom } from './recurring';
import { installmentPlan, splitInstallments, transactionFormSchema } from './transaction';

describe('parcelas', () => {
  it('divide em centavos, com o resto na 1ª parcela', () => {
    expect(splitInstallments(10000, 3)).toEqual([3334, 3333, 3333]);
    expect(splitInstallments(3163, 3)).toEqual([1055, 1054, 1054]);
  });

  it('uma parcela por mês; dia 31 em mês curto vira o último dia', () => {
    const plan = installmentPlan(
      {
        type: 'outcome',
        description: 'Kit pc',
        category: 'Compras',
        amountCents: 57200,
        date: '2026-12-31',
      },
      3,
      'g1',
    );
    expect(plan.map((p) => [p.date, p.amountCents, p.installment?.number])).toEqual([
      ['2026-12-31', 19068, 1],
      ['2027-01-31', 19066, 2],
      ['2027-02-28', 19066, 3],
    ]);
    expect(plan.every((p) => p.installment?.group === 'g1' && p.installment.total === 3)).toBe(
      true,
    );
  });

  it('datas: soma de meses e dia do fixo em meses curtos', () => {
    expect(addMonthsToDate('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsToDate('2028-01-31', 1)).toBe('2028-02-29');
    expect(dayInMonth('2026-09', 31)).toBe('2026-09-30');
    expect(dayInMonth('2026-10', 5)).toBe('2026-10-05');
  });

  it('parcelado e fixo ao mesmo tempo é recusado', () => {
    const result = transactionFormSchema.safeParse({
      type: 'outcome',
      description: 'Academia',
      amount: '65',
      category: 'Saúde',
      date: '2026-10-01',
      installments: 3,
      repeat: true,
    });
    expect(result.error?.issues[0]?.message).toBe('Parcelado ou fixo: escolha um dos dois');
  });
});

describe('fixos e orçamento', () => {
  it('um lançamento "repete todo mês" vira fixo no dia e mês da data', () => {
    expect(
      recurringFrom({
        type: 'outcome',
        description: 'Aluguel',
        category: 'Moradia',
        amountCents: 120000,
        date: '2026-10-31',
      }),
    ).toEqual({
      type: 'outcome',
      description: 'Aluguel',
      category: 'Moradia',
      amountCents: 120000,
      dayOfMonth: 31,
      startMonth: '2026-10',
    });
  });

  it('barras: ok, âmbar a partir de 80% e vermelho acima do limite, mais apertado primeiro', () => {
    const status = budgetStatus(
      [
        { category: 'Lazer', limitCents: 30000 },
        { category: 'Mercado', limitCents: 50000 },
        { category: 'Transporte', limitCents: 10000 },
      ],
      [
        { category: 'Lazer', cents: 25000, percent: 0 },
        { category: 'Transporte', cents: 12000, percent: 0 },
      ],
    );
    expect(status.map((s) => [s.category, s.percent, s.level])).toEqual([
      ['Transporte', 120, 'over'],
      ['Lazer', 83, 'warn'],
      ['Mercado', 0, 'ok'],
    ]);
  });
});
