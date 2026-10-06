const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Valores ficam sempre em centavos (inteiros): 0,1 + 0,2 em float não dá 0,3. */
export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/**
 * Valor digitado → centavos, sem passar por float. Aceita "12", "12,5", "1.234,56",
 * "R$ 1.234,56" e "12.50" (ponto como decimal quando há só 1 ou 2 dígitos depois dele).
 * Retorna null quando não é um valor válido.
 */
export function parseAmountToCents(input: string): number | null {
  const text = input.replace(/r\$/i, '').replace(/\s/g, '');
  if (!/^\d[\d.,]*$/.test(text)) return null;

  let integer = text;
  let decimals = '';
  const comma = text.lastIndexOf(',');
  if (comma >= 0) {
    integer = text.slice(0, comma);
    decimals = text.slice(comma + 1);
  } else {
    const dot = text.lastIndexOf('.');
    if (dot >= 0 && text.length - dot - 1 <= 2) {
      integer = text.slice(0, dot);
      decimals = text.slice(dot + 1);
    }
  }
  integer = integer.replace(/\./g, '');
  if (!/^\d+$/.test(integer) || !/^\d{0,2}$/.test(decimals)) return null;

  const cents = Number(integer) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Centavos → texto para o campo de valor ("1234,50"). */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}
