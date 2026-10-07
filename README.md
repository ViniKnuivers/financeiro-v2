# Financeiro

Controle simples das suas entradas e saídas, no navegador do celular ou do computador.
Versão 2 do [bot-financeiro](https://github.com/ViniKnuivers/bot-financeiro), agora como
site, a partir do protótipo do curso de React (DT Money).

- **Lançamentos:** entradas e saídas com descrição, valor, categoria e data (com atalhos
  Hoje/Ontem); editar e apagar (com "Desfazer"); busca, filtros por tipo e categoria e
  ordem por data ou valor; navegação mês a mês.
- **Parcelas e gastos fixos:** compra em até 24x (uma parcela por mês) e lançamentos que
  se repetem todo mês sozinhos.
- **Resumo:** entradas, saídas e saldo do mês comparados com o mês anterior, saldo
  acumulado, saídas por categoria, entradas × saídas mês a mês, orçamento por categoria e
  painel de gastos fixos.
- **Conta:** login por e-mail e senha, trocar a senha e excluir a conta com todos os dados.
- **Celular:** instalável na tela inicial; a lista vira cartões e os números do mês
  deslizam para o lado.

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

## Banco na nuvem e login (Supabase)

Sem configuração, o site guarda tudo no próprio navegador e não pede login. Para os dados
ficarem na nuvem, com login por e-mail e senha:

1. Crie um projeto em [supabase.com](https://supabase.com) (plano gratuito, região São Paulo).
2. Em **SQL Editor**, rode os arquivos de [`supabase/migrations`](supabase/migrations) em
   ordem (001, 002…): criam as tabelas, as funções e as regras que deixam cada pessoa ver
   só os próprios dados.
3. Em **Authentication → URL Configuration**, coloque o endereço do site em **Site URL** e
   em **Redirect URLs** (ex.: `http://localhost:5180` e o endereço da Vercel).
4. Copie `.env.example` para `.env.local` e preencha com a **Project URL** e a **Publishable
   key** (Project Settings → API Keys).

A publishable key é pública por definição (vai junto com o site); quem protege os dados são
as regras do banco (Row Level Security).

## Como é feito

React 19 + TypeScript + Vite, styled-components (tema cinza e roxo), Radix (modais),
react-hook-form + zod (formulário), React Router e Recharts (gráficos, carregados só no
Resumo).

```
src/
├── domain/      # regras puras: transação, categorias, validação, resumos
├── auth/        # login (contrato + Supabase Auth), proteção das páginas
├── data/        # onde os dados ficam (contrato + navegador ou Supabase)
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
