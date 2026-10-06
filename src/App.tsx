import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { Layout } from './components/Layout';
import { TransactionsProvider } from './contexts/TransactionsProvider';
import type { TransactionsRepository } from './data/transactions-repository';
import { Transactions } from './pages/Transactions';
import { GlobalStyle } from './styles/global';
import { defaultTheme } from './styles/themes/default';

const router = createBrowserRouter([
  {
    element: <Layout />,
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
]);

export function App({ repository }: { repository: TransactionsRepository }) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <TransactionsProvider repository={repository}>
        <RouterProvider router={router} />
      </TransactionsProvider>
    </ThemeProvider>
  );
}
