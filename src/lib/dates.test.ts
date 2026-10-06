import {
  addMonths,
  formatDate,
  formatMonthLong,
  formatMonthShort,
  monthRange,
  today,
} from './dates';

describe('datas', () => {
  it('hoje no fuso local, sem virar o dia por causa de UTC', () => {
    const lateNight = new Date(2026, 9, 6, 23, 30);
    expect(today(lateNight)).toBe('2026-10-06');
  });

  it('meses: soma, intervalo e nomes', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(monthRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-11-01' });
    expect(formatMonthLong('2026-10')).toBe('outubro de 2026');
    expect(formatMonthShort('2026-10')).toBe('out/26');
    expect(formatDate('2026-10-06')).toBe('06/10/2026');
  });
});
