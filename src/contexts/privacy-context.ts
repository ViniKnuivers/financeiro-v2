import { createContext } from 'react';

export interface PrivacyContextValue {
  /** Valores escondidos (R$ •••••), para abrir o app em público. */
  hidden: boolean;
  toggle: () => void;
}

/** Sem o provider (testes de um componente só), os valores aparecem. */
export const PrivacyContext = createContext<PrivacyContextValue>({
  hidden: false,
  toggle: () => undefined,
});
