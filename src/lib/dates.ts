/**
 * Datas "só dia" ficam como texto "YYYY-MM-DD" e meses como "YYYY-MM": sem fuso nem
 * hora, o dia 06/10 nunca vira 05/10 por causa de UTC.
 */

/** Hoje, no fuso do navegador. */
export function today(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function addMonths(month: string, count: number): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + count, 1));
  return date.toISOString().slice(0, 7);
}

/** Primeiro dia do mês e primeiro dia do mês seguinte (intervalo [início, fim)). */
export function monthRange(month: string): { start: string; end: string } {
  return { start: `${month}-01`, end: `${addMonths(month, 1)}-01` };
}

/** "2026-10-06" → "06/10/2026". */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day ?? ''}/${month ?? ''}/${year ?? ''}`;
}

/** "2026-10" → "outubro de 2026". */
export function formatMonthLong(month: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00.000Z`));
}

/** "2026-10" → "out/26". */
export function formatMonthShort(month: string): string {
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
    .format(new Date(`${month}-01T00:00:00.000Z`))
    .replace('.', '');
  return `${name}/${month.slice(2, 4)}`;
}
