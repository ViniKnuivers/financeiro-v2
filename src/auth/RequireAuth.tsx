import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const Splash = styled.div`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  color: ${(props) => props.theme['gray-400']};
`;

/** Com login ligado, só mostra as páginas para quem entrou; sem login, mostra direto. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!auth) return children;
  if (auth.user === undefined) return <Splash>Carregando…</Splash>;
  if (auth.user === null) return <Navigate to="/entrar" replace />;
  return children;
}
