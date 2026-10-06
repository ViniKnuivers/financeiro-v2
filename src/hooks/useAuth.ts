import { useContext } from 'react';
import { AuthContext } from '../auth/auth-context';

/** Login, ou null quando o site roda sem login (só no navegador). */
export function useAuth() {
  return useContext(AuthContext);
}
