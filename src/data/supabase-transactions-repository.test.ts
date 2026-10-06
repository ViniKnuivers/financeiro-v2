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
