import { byNewest, type Transaction, type TransactionInput } from '../domain/transaction';
import {
  TransactionNotFoundError,
  type DateRange,
  type TransactionsRepository,
} from './transactions-repository';

const STORAGE_KEY = 'financeiro:transactions';

/** Guarda as transações no próprio navegador (antes de ligar o banco na nuvem). */
export class LocalTransactionsRepository implements TransactionsRepository {
  private readonly storage: Pick<Storage, 'getItem' | 'setItem'>;
  private readonly now: () => Date;
  private readonly newId: () => string;

  constructor(
    storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage,
    now: () => Date = () => new Date(),
    newId: () => string = () => crypto.randomUUID(),
  ) {
    this.storage = storage;
    this.now = now;
    this.newId = newId;
  }

  list({ start, end }: DateRange): Promise<Transaction[]> {
    return Promise.resolve(
      this.read()
        .filter((t) => t.date >= start && t.date < end)
        .sort(byNewest),
    );
  }

  create(input: TransactionInput): Promise<Transaction> {
    const transaction: Transaction = {
      ...input,
      id: this.newId(),
      createdAt: this.now().toISOString(),
    };
    this.write([...this.read(), transaction]);
    return Promise.resolve(transaction);
  }

  update(id: string, input: TransactionInput): Promise<Transaction> {
    const all = this.read();
    const current = all.find((t) => t.id === id);
    if (!current) return Promise.reject(new TransactionNotFoundError(id));
    const updated: Transaction = { ...current, ...input };
    this.write(all.map((t) => (t.id === id ? updated : t)));
    return Promise.resolve(updated);
  }

  remove(id: string): Promise<void> {
    this.write(this.read().filter((t) => t.id !== id));
    return Promise.resolve();
  }

  createMany(inputs: TransactionInput[]): Promise<Transaction[]> {
    const created = inputs.map((input): Transaction => ({
      ...input,
      id: this.newId(),
      createdAt: this.now().toISOString(),
    }));
    this.write([...this.read(), ...created]);
    return Promise.resolve(created);
  }

  removeInstallments(group: string): Promise<Transaction[]> {
    const all = this.read();
    const removed = all.filter((t) => t.installment?.group === group);
    this.write(all.filter((t) => t.installment?.group !== group));
    return Promise.resolve(removed);
  }

  balanceUntil(end: string): Promise<number> {
    return Promise.resolve(
      this.read()
        .filter((t) => t.date < end)
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amountCents : -t.amountCents), 0),
    );
  }

  restore(transaction: Transaction): Promise<void> {
    const all = this.read();
    if (!all.some((t) => t.id === transaction.id)) this.write([...all, transaction]);
    return Promise.resolve();
  }

  private read(): Transaction[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? (parsed as Transaction[]) : [];
    } catch {
      return [];
    }
  }

  private write(transactions: Transaction[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
}
