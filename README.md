# Financeiro

Controle simples das suas entradas e saídas, no navegador do celular ou do computador.
Versão 2 do [bot-financeiro](https://github.com/ViniKnuivers/bot-financeiro), agora como
site, a partir do protótipo do curso de React (DT Money).

- **Lançamentos:** entradas e saídas com descrição, valor, categoria e data; editar e apagar
  com um toque; busca por descrição ou categoria; navegação mês a mês.
- **Resumo:** entradas, saídas e saldo do mês, saídas por categoria e entradas × saídas mês a
  mês.
- **Celular:** a lista vira cartões e os números do mês deslizam para o lado.

## Rodando

Requer Node.js 22+.

```bash
npm install
npm run dev
```

| Script              | O que faz                             |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento (Vite)    |
| `npm test`          | Testes (Vitest + Testing Library)     |
| `npm run lint`      | ESLint com regras que checam os tipos |
| `npm run typecheck` | TypeScript em modo estrito            |
| `npm run format`    | Formata com Prettier                  |
| `npm run build`     | Gera o site em `dist/`                |

## Como é feito

React 19 + TypeScript + Vite, styled-components (tema cinza e roxo), Radix (modais),
react-hook-form + zod (formulário), React Router e Recharts (gráficos, carregados só no
Resumo).

```
src/
├── domain/      # regras puras: transação, categorias, validação, resumos
├── data/        # onde os dados ficam (contrato + implementação no navegador)
├── contexts/    # estado compartilhado: mês, lista, busca, criar/editar/apagar
├── components/  # cabeçalho, cartões, seletor de mês, modais
├── pages/       # Lançamentos e Resumo
└── lib/         # dinheiro (sempre em centavos) e datas ("YYYY-MM-DD", sem fuso)
```

- **Dinheiro em centavos inteiros**, e o valor digitado ("1.234,56") é convertido sem passar
  por número com vírgula.
- **As telas não sabem onde os dados ficam:** dependem só do contrato
  `TransactionsRepository`. Hoje os dados ficam no navegador; trocar por um banco na nuvem é
  escrever outra implementação.
