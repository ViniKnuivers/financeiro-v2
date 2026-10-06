import { centsToInput, formatCents, parseAmountToCents } from './money';

describe('parseAmountToCents', () => {
  it.each([
    ['12', 1200],
    ['12,5', 1250],
    ['32,50', 3250],
    ['1.234,56', 123456],
    ['R$ 1.234,56', 123456],
    ['12.50', 1250],
    ['1.234', 123400],
    ['0,99', 99],
  ])('%s → %i centavos', (input, cents) => {
    expect(parseAmountToCents(input)).toBe(cents);
  });

  it.each(['', 'abc', '12,345', '-5', '1,2,3'])('recusa %j', (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });
});

describe('formatação', () => {
  it('centavos → R$ e → campo do formulário', () => {
    expect(formatCents(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
    expect(centsToInput(3250)).toBe('32,50');
  });
});
