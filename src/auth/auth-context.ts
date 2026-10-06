import { createContext } from 'react';
import type { AuthGateway, User } from './auth-gateway';

export interface AuthContextValue {
  /** null: ninguém logado; undefined: ainda verificando. */
  user: User | null | undefined;
  gateway: AuthGateway;
  /** Voltou pelo link de "esqueci a senha": mostrar o formulário de senha nova. */
  recovering: boolean;
  finishRecovery: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
