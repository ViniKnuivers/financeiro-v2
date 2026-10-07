import { memoryStorage } from '../test/memory-storage';
import { LocalRecurringRepository } from './local-recurring-repository';
import { LocalTransactionsRepository } from './local-transactions-repository';

function setup() {
  const storage = memoryStorage();
  const transactions = new LocalTransactionsRepository(storage);
  return { transactions, recurring: new LocalRecurringRepository(transactions, storage) };
}

const all = { start: '2000-01-01', end: '2100-01-01' };
const aluguel = {
  type: 'outcome' as const,
  description: 'Aluguel',
  category: 'Moradia',
  amountCents: 120000,
  dayOfMonth: 31,
  startMonth: '2026-08',
};

describe('LocalRecurringRepository', () => {
  it('lança do mês de início até o atual, uma vez só; dia 31 vira 30 em setembro', async () => {
    const { transactions, recurring } = setup();
    await recurring.create(aluguel);

    expect(await recurring.materialize('2026-10-07')).toBe(3);
    expect(await recurring.materialize('2026-10-20')).toBe(0);
    const dates = (await transactions.list(all)).map((t) => t.date).sort();
    expect(dates).toEqual(['2026-08-31', '2026-09-30', '2026-10-31']);
  });

  it('apagar um lançamento gerado não o recria; parar deixa de lançar', async () => {
    const { transactions, recurring } = setup();
    const created = await recurring.create(aluguel);
    await recurring.materialize('2026-10-07');
    const september = (await transactions.list(all)).find((t) => t.date === '2026-09-30');
    if (!september) throw new Error('faltou setembro');
    await transactions.remove(september.id);

    expect(await recurring.materialize('2026-10-07')).toBe(0);
    await recurring.stop(created.id);
    expect(await recurring.list()).toEqual([]);
    expect(await recurring.materialize('2026-12-01')).toBe(0);
  });

  it('fixo que começa no mês que vem ainda não lança nada', async () => {
    const { recurring } = setup();
    await recurring.create({ ...aluguel, startMonth: '2026-11' });

    expect(await recurring.materialize('2026-10-07')).toBe(0);
    expect(await recurring.materialize('2026-11-01')).toBe(1);
  });

  it('duas chamadas ao mesmo tempo não duplicam', async () => {
    const { transactions, recurring } = setup();
    await recurring.create(aluguel);

    await Promise.all([recurring.materialize('2026-10-07'), recurring.materialize('2026-10-07')]);

    expect(await transactions.list(all)).toHaveLength(3);
  });
});
