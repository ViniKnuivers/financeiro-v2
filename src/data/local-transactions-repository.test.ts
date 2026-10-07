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

    const [uber] = (await repo.list(october)).filter((t) => t.id === 'id-2');
    await repo.remove('id-2');
    expect((await repo.list(october)).map((t) => t.description)).toEqual(['Almoço']);

    // Desfazer: volta igual, com o mesmo id (e não duplica se chamado duas vezes).
    if (!uber) throw new Error('faltou a transação');
    await repo.restore(uber);
    await repo.restore(uber);
    expect((await repo.list(october)).map((t) => t.id)).toEqual(['id-2', 'id-1']);
  });

  it('editar o que não existe é erro; dados corrompidos viram lista vazia', async () => {
    const storage = memoryStorage();
    storage.setItem('financeiro:transactions', '{quebrado');
    const repo = new LocalTransactionsRepository(storage);

    await expect(repo.update('nada', input)).rejects.toBeInstanceOf(TransactionNotFoundError);
    expect(await repo.list({ start: '2000-01-01', end: '2100-01-01' })).toEqual([]);
  });

  it('parcelas: cria todas de uma vez e apaga o grupo inteiro; saldo acumulado', async () => {
    const repo = setup();
    const installment = (number: number) => ({ group: 'g1', number, total: 2 });
    await repo.create({ ...input, type: 'income', amountCents: 100000, date: '2026-09-05' });
    await repo.createMany([
      { ...input, amountCents: 5000, date: '2026-09-10', installment: installment(1) },
      { ...input, amountCents: 5000, date: '2026-10-10', installment: installment(2) },
    ]);

    // Até o fim de setembro: 1.000 − 50 = 950; até o fim de outubro: 900.
    expect(await repo.balanceUntil('2026-10-01')).toBe(95000);
    expect(await repo.balanceUntil('2026-11-01')).toBe(90000);

    const removed = await repo.removeInstallments('g1');
    expect(removed.map((t) => t.installment?.number)).toEqual([1, 2]);
    expect(await repo.balanceUntil('2026-11-01')).toBe(100000);
  });
});
