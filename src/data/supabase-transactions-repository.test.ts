import { fromRow, toRow } from './supabase-transactions-repository';

describe('Supabase: linha do banco ↔ transação', () => {
  it('converte nos dois sentidos (snake_case no banco, camelCase no site)', () => {
    const row = {
      id: 'abc',
      type: 'outcome' as const,
      description: 'Mercado',
      category: 'Mercado',
      amount_cents: 15090,
      date: '2026-10-06',
      created_at: '2026-10-06T12:00:00Z',
      installment_group: 'g1',
      installment_number: 2,
      installment_total: 3,
      recurring_id: null,
    };
    const transaction = fromRow(row);

    expect(transaction).toEqual({
      id: 'abc',
      type: 'outcome',
      description: 'Mercado',
      category: 'Mercado',
      amountCents: 15090,
      date: '2026-10-06',
      createdAt: '2026-10-06T12:00:00Z',
      installment: { group: 'g1', number: 2, total: 3 },
      recurringId: null,
    });
    // Para gravar: sem id, created_at nem user_id (o banco preenche).
    expect(toRow(transaction)).toEqual({
      type: 'outcome',
      description: 'Mercado',
      category: 'Mercado',
      amount_cents: 15090,
      date: '2026-10-06',
    });
  });
});
