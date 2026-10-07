import type { Recurring, RecurringInput } from '../domain/recurring';
import { addMonths, dayInMonth, monthOf, monthRange } from '../lib/dates';
import type { LocalTransactionsRepository } from './local-transactions-repository';
import type { RecurringRepository } from './recurring-repository';

const STORAGE_KEY = 'financeiro:recurring';

interface Stored extends Recurring {
  /** Último mês já lançado ("YYYY-MM"): apagar um lançamento gerado não o recria. */
  generatedThrough: string | null;
}

function toRecurring(stored: Stored): Recurring {
  return {
    id: stored.id,
    type: stored.type,
    description: stored.description,
    category: stored.category,
    amountCents: stored.amountCents,
    dayOfMonth: stored.dayOfMonth,
    startMonth: stored.startMonth,
    active: stored.active,
  };
}

/** Gastos fixos no navegador (mesmas regras da função materialize_recurring do banco). */
export class LocalRecurringRepository implements RecurringRepository {
  private readonly transactions: LocalTransactionsRepository;
  private readonly storage: Pick<Storage, 'getItem' | 'setItem'>;
  private readonly newId: () => string;
  /** Uma execução de cada vez: a segunda espera a primeira e não acha nada a lançar. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    transactions: LocalTransactionsRepository,
    storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage,
    newId: () => string = () => crypto.randomUUID(),
  ) {
    this.transactions = transactions;
    this.storage = storage;
    this.newId = newId;
  }

  list(): Promise<Recurring[]> {
    return Promise.resolve(
      this.read()
        .filter((r) => r.active)
        .map((stored) => toRecurring(stored))
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth),
    );
  }

  create(input: RecurringInput): Promise<Recurring> {
    const recurring: Recurring = { ...input, id: this.newId(), active: true };
    this.write([...this.read(), { ...recurring, generatedThrough: null }]);
    return Promise.resolve(recurring);
  }

  stop(id: string): Promise<void> {
    this.write(this.read().map((r) => (r.id === id ? { ...r, active: false } : r)));
    return Promise.resolve();
  }

  materialize(today: string): Promise<number> {
    const run = this.queue.then(() => this.materializeNow(today));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async materializeNow(today: string): Promise<number> {
    const target = monthOf(today);
    const all = this.read();
    let created = 0;
    for (const r of all) {
      if (!r.active) continue;
      let month = r.generatedThrough ? addMonths(r.generatedThrough, 1) : r.startMonth;
      while (month <= target) {
        // Como o índice único do banco: nunca dois lançamentos do mesmo fixo no mesmo mês.
        const existing = await this.transactions.list(monthRange(month));
        if (existing.some((t) => t.recurringId === r.id)) {
          month = addMonths(month, 1);
          continue;
        }
        await this.transactions.create({
          type: r.type,
          description: r.description,
          category: r.category,
          amountCents: r.amountCents,
          date: dayInMonth(month, r.dayOfMonth),
          recurringId: r.id,
        });
        created += 1;
        month = addMonths(month, 1);
      }
      if (r.startMonth <= target && (r.generatedThrough ?? '') < target)
        r.generatedThrough = target;
    }
    this.write(all);
    return created;
  }

  private read(): Stored[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? (parsed as Stored[]) : [];
    } catch {
      return [];
    }
  }

  private write(recurring: Stored[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(recurring));
  }
}
