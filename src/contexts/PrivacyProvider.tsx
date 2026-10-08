import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { PrivacyContext } from './privacy-context';

const STORAGE_KEY = 'financeiro:privacy';

/** O navegador pode bloquear o localStorage (aba anônima): aí só não lembra a escolha. */
function readHidden(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'hidden';
  } catch {
    return false;
  }
}

function saveHidden(hidden: boolean): void {
  try {
    if (hidden) window.localStorage.setItem(STORAGE_KEY, 'hidden');
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem localStorage, vale só até fechar o site.
  }
}

/** Modo privacidade: lembra a escolha neste aparelho. */
export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(readHidden);

  const toggle = useCallback(() => {
    setHidden((current) => {
      saveHidden(!current);
      return !current;
    });
  }, []);

  const value = useMemo(() => ({ hidden, toggle }), [hidden, toggle]);
  return <PrivacyContext value={value}>{children}</PrivacyContext>;
}
