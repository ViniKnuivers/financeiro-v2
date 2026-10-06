import { memoryStorage } from '../test/memory-storage';
import { LocalTransactionsRepository } from './local-transactions-repository';
import { TransactionNotFoundError } from './transactions-repository';

function setup() {
  let n = 0;
  let clock = 0;
  return new LocalTransactionsRepository(
    memoryStorage(),
    () => new Date(Date.UTC(2026, 9, 6, 12, 0, clock++)),
    () => `id-${String(++n)}`,
  );
}

const input = {
  type: 'outcome' as const,
  description: 'Almoço',
  category: 'Alimentação',
  amountCents: 3200,
  date: '2026-10-06',
};

describe('LocalTransactionsRepository', () => {
  it('cria, lista o mês (mais recentes primeiro), edita e apaga', async () => {
    const repo = setup();
    await repo.create(input);
    await repo.create({ ...input, description: 'Uber', date: '2026-10-07' });
    await repo.create({ ...input, description: 'Setembro', date: '2026-09-30' });
    const october = { start: '2026-10-01', end: '2026-11-01' };

    expect((await repo.list(october)).map((t) => t.description)).toEqual(['Uber', 'Almoço']);

    await repo.update('id-1', { ...input, amountCents: 4000 });
    expect((await repo.list(october)).find((t) => t.id === 'id-1')?.amountCents).toBe(4000);

    await repo.remove('id-2');
    expect((await repo.list(october)).map((t) => t.description)).toEqual(['Almoço']);
  });

  it('editar o que não existe é erro; dados corrompidos viram lista vazia', async () => {
    const storage = memoryStorage();
    storage.setItem('financeiro:transactions', '{quebrado');
    const repo = new LocalTransactionsRepository(storage);

    await expect(repo.update('nada', input)).rejects.toBeInstanceOf(TransactionNotFoundError);
    expect(await repo.list({ start: '2000-01-01', end: '2100-01-01' })).toEqual([]);
  });
});
