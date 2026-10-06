import { useMemo } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ThemeProvider } from 'styled-components';
import type { AuthGateway } from './auth/auth-gateway';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { Layout } from './components/Layout';
import { NewPasswordDialog } from './components/NewPasswordDialog';
import { TransactionsProvider } from './contexts/TransactionsProvider';
import type { TransactionsRepository } from './data/transactions-repository';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Transactions } from './pages/Transactions';
import { GlobalStyle } from './styles/global';
import { defaultTheme } from './styles/themes/default';

interface Props {
  repository: TransactionsRepository;
  /** Login (Supabase); null roda só no navegador, sem login. */
  auth: AuthGateway | null;
}

/** Os dados de quem está logado: trocou de conta, recarrega do zero. */
function UserData({ repository }: { repository: TransactionsRepository }) {
  const auth = useAuth();
  return (
    <TransactionsProvider key={auth?.user?.id ?? 'local'} repository={repository}>
      <Layout />
    </TransactionsProvider>
  );
}

export function App({ repository, auth }: Props) {
  const router = useMemo(
    () =>
      createBrowserRouter([
        { path: '/entrar', element: <Login /> },
        {
          element: (
            <RequireAuth>
              <UserData repository={repository} />
            </RequireAuth>
          ),
          children: [
            { index: true, element: <Transactions /> },
            {
              // Os gráficos (Recharts) só carregam quando você abre o Resumo.
              path: 'resumo',
              lazy: async () => ({ Component: (await import('./pages/Overview')).Overview }),
            },
            { path: '*', element: <Navigate to="/" replace /> },
          ],
        },
      ]),
    [repository],
  );

  const app = <RouterProvider router={router} />;
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      {auth ? (
        <AuthProvider gateway={auth}>
          {app}
          <NewPasswordDialog />
        </AuthProvider>
      ) : (
        app
      )}
    </ThemeProvider>
  );
}
