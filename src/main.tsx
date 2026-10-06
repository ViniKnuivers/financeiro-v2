import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LocalTransactionsRepository } from './data/local-transactions-repository';

const root = document.getElementById('root');
if (!root) throw new Error('elemento #root não encontrado no index.html');

createRoot(root).render(
  <StrictMode>
    <App repository={new LocalTransactionsRepository()} />
  </StrictMode>,
);
