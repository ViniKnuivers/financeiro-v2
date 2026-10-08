import { useCallback, useContext } from 'react';
import { PrivacyContext } from '../contexts/privacy-context';
import { formatCents } from '../lib/money';

export const HIDDEN_MONEY = 'R$ •••••';

export function usePrivacy() {
  return useContext(PrivacyContext);
}

/** formatCents que respeita o modo privacidade. */
export function useMoney(): (cents: number) => string {
  const { hidden } = useContext(PrivacyContext);
  return useCallback((cents: number) => (hidden ? HIDDEN_MONEY : formatCents(cents)), [hidden]);
}
