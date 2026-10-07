import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { LocalTransactionsRepository } from './data/local-transactions-repository';
import { addDays, addMonths, formatMonthLong, today } from './lib/dates';
import { localRepositories } from './test/local-repositories';

async function setup(seed?: (repository: LocalTransactionsRepository) => Promise<void>) {
  const repositories = localRepositories();
  await seed?.(repositories.transactions);
  window.history.pushState({}, '', '/');
  render(<App repositories={repositories} auth={null} />);
  return { user: userEvent.setup(), repository: repositories.transactions, repositories };
}

const money = (text: string) => new RegExp(text.replace(/R\$ /g, 'R\\$\\s'));

describe('Financeiro', () => {
  it('lança uma saída e uma entrada; a lista e os cartões se atualizam', async () => {
    const { user } = await setup();
    expect(await screen.findByText(/Nenhuma transação em/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /nova transação/i }));
    const dialog = await screen.findByRole('dialog', { name: 'Nova transação' });
    await user.type(within(dialog).getByLabelText('Descrição'), 'Mercado');
    await user.type(within(dialog).getByLabelText('Valor'), '150,90');
    await user.selectOptions(within(dialog).getByLabelText('Categoria'), 'Mercado');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    const [description] = await screen.findAllByText('Mercado', { selector: 'td' });
    const row = description?.closest('tr');
    expect(row).toHaveTextContent(money('- R$ 150,90'));
    expect(row).toHaveTextContent(today().split('-').reverse().join('/'));

    await user.click(screen.getByRole('button', { name: /nova transação/i }));
    const income = await screen.findByRole('dialog', { name: 'Nova transação' });
    await user.click(within(income).getByRole('radio', { name: 'Entrada' }));
    await user.type(within(income).getByLabelText('Descrição'), 'Salário');
    await user.type(within(income).getByLabelText('Valor'), '3.596');
    await user.selectOptions(within(income).getByLabelText('Categoria'), 'Salário');
    await user.click(within(income).getByRole('button', { name: 'Cadastrar' }));

    const summary = await screen.findByRole('region', { name: 'Resumo do mês' });
    expect(await within(summary).findByText(money('R$ 3.596,00'))).toBeInTheDocument();
    expect(within(summary).getByText(money('R$ 150,90'))).toBeInTheDocument();
    expect(
      within(summary).getByText(money('R$ 3.445,10'), { selector: 'strong' }),
    ).toBeInTheDocument();
    // Primeiro mês: o acumulado é o próprio saldo.
    expect(within(summary).getByText(money('Acumulado: R$ 3.445,10'))).toBeInTheDocument();
  });

  it('mostra os erros do formulário em vez de salvar', async () => {
    const { user } = await setup();
    await user.click(await screen.findByRole('button', { name: /nova transação/i }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText('Valor'), '0');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    expect(await within(dialog).findByText('Descreva a transação')).toBeInTheDocument();
    expect(within(dialog).getByText('Digite um valor, ex.: 32,50')).toBeInTheDocument();
    expect(within(dialog).getByText('Escolha uma categoria')).toBeInTheDocument();
  });

  it('edita, busca e apaga', async () => {
    const date = today();
    const { user } = await setup(async (repository) => {
      await repository.create({
        type: 'outcome',
        description: 'Almoço',
        category: 'Alimentação',
        amountCents: 3200,
        date,
      });
      await repository.create({
        type: 'outcome',
        description: 'Uber',
        category: 'Transporte',
        amountCents: 1800,
        date,
      });
    });

    // Editar: o formulário já vem preenchido.
    await user.click(await screen.findByRole('button', { name: 'Editar Almoço' }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar transação' });
    expect(within(dialog).getByLabelText('Valor')).toHaveValue('32,00');
    await user.clear(within(dialog).getByLabelText('Valor'));
    await user.type(within(dialog).getByLabelText('Valor'), '45');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText(money('- R$ 45,00'), { selector: 'span' })).toBeInTheDocument();

    // Buscar: só a do Uber.
    await user.type(screen.getByLabelText('Buscar transação'), 'transp');
    expect(screen.queryByText('Almoço', { selector: 'td' })).not.toBeInTheDocument();
    expect(screen.getByText('Uber', { selector: 'td' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));

    // Apagar: some na hora e o aviso oferece "Desfazer", que traz de volta.
    await user.click(screen.getByRole('button', { name: 'Apagar Uber' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Uber apagado');
    await waitFor(() => {
      expect(screen.queryByText('Uber', { selector: 'td' })).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(await screen.findByText('Uber', { selector: 'td' })).toBeInTheDocument();
  });

  it('filtra por tipo e categoria, ordena por valor e limpa os filtros', async () => {
    const date = today();
    const { user } = await setup(async (repository) => {
      const base = { type: 'outcome' as const, date };
      await repository.create({
        ...base,
        description: 'Almoço',
        category: 'Alimentação',
        amountCents: 3200,
      });
      await repository.create({
        ...base,
        description: 'Mercado',
        category: 'Mercado',
        amountCents: 15000,
      });
      await repository.create({
        ...base,
        description: 'Uber',
        category: 'Transporte',
        amountCents: 1800,
      });
      await repository.create({
        ...base,
        type: 'income',
        description: 'Salário',
        category: 'Salário',
        amountCents: 359600,
      });
    });
    const descriptions = () =>
      [...document.querySelectorAll('td.description')].map((cell) => cell.textContent);
    await screen.findAllByText('Salário', { selector: 'td' });

    await user.click(screen.getByRole('button', { name: 'Saídas' }));
    expect(descriptions()).not.toContain('Salário');

    await user.selectOptions(screen.getByLabelText('Ordem'), 'Maior valor');
    expect(descriptions()).toEqual(['Mercado', 'Almoço', 'Uber']);

    await user.selectOptions(screen.getByLabelText('Categoria'), 'Transporte');
    expect(descriptions()).toEqual(['Uber']);

    await user.click(screen.getByRole('button', { name: 'Entradas' }));
    expect(await screen.findByText(/Nenhuma transação com esses filtros/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(descriptions()).toHaveLength(4);
  });

  it('"Ontem" preenche a data de ontem', async () => {
    const { user } = await setup();
    await user.click(await screen.findByRole('button', { name: /nova transação/i }));
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: 'Ontem' }));
    expect(within(dialog).getByLabelText('Data')).toHaveValue(addDays(today(), -1));
    expect(within(dialog).getByRole('button', { name: 'Ontem' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('compara com o mês anterior nos cartões', async () => {
    const thisMonth = today().slice(0, 7);
    await setup(async (repository) => {
      const base = { type: 'outcome' as const, description: 'Mercado', category: 'Mercado' };
      await repository.create({
        ...base,
        amountCents: 10000,
        date: `${addMonths(thisMonth, -1)}-10`,
      });
      await repository.create({ ...base, amountCents: 12000, date: `${thisMonth}-01` });
    });
    const summary = await screen.findByRole('region', { name: 'Resumo do mês' });
    const previous = formatMonthLong(addMonths(thisMonth, -1)).split(' de ')[0] ?? '';

    // Saídas subiram 20%: vermelho (para saídas, subir é ruim).
    expect(await within(summary).findByText(`▲ 20% vs ${previous}`)).toBeInTheDocument();
  });

  it('compra em 3x: uma parcela por mês, com o selo 1/3, 2/3…', async () => {
    const { user } = await setup();
    await user.click(await screen.findByRole('button', { name: /nova transação/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Descrição'), 'Kit pc');
    await user.type(within(dialog).getByLabelText('Valor'), '300');
    await user.selectOptions(within(dialog).getByLabelText('Categoria'), 'Compras');
    await user.selectOptions(within(dialog).getByLabelText('Parcelas'), '3x');
    expect(within(dialog).getByLabelText('Repete todo mês')).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    const [cell] = await screen.findAllByText('Kit pc', { exact: false, selector: 'td' });
    expect(cell).toHaveTextContent('Kit pc1/3');
    expect(cell?.closest('tr')).toHaveTextContent(money('- R$ 100,00'));

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(await screen.findByText('2/3')).toBeInTheDocument();
  });

  it('apagar uma parcela oferece apagar as outras; Desfazer devolve todas', async () => {
    const { user, repository } = await setup(async (repo) => {
      const month = today().slice(0, 7);
      await repo.createMany(
        [1, 2, 3].map((number) => ({
          type: 'outcome' as const,
          description: 'Tênis',
          category: 'Compras',
          amountCents: 10000,
          date: `${addMonths(month, number - 1)}-01`,
          installment: { group: 'g1', number, total: 3 },
        })),
      );
    });
    const all = { start: '2000-01-01', end: '2100-01-01' };

    await user.click(await screen.findByRole('button', { name: 'Apagar Tênis' }));
    await user.click(await screen.findByRole('button', { name: 'Apagar as outras parcelas' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Tênis: todas as parcelas apagadas',
    );
    expect(await repository.list(all)).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Desfazer' }));
    await waitFor(async () => {
      expect(await repository.list(all)).toHaveLength(3);
    });
  });

  it('gasto fixo: marcado no mês passado, já aparece neste mês com o selo Fixo', async () => {
    const { user, repositories } = await setup();
    const lastMonth = addMonths(today().slice(0, 7), -1);
    await user.click(await screen.findByRole('button', { name: /nova transação/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Descrição'), 'Academia');
    await user.type(within(dialog).getByLabelText('Valor'), '65');
    await user.selectOptions(within(dialog).getByLabelText('Categoria'), 'Saúde');
    await user.clear(within(dialog).getByLabelText('Data'));
    await user.type(within(dialog).getByLabelText('Data'), `${lastMonth}-01`);
    await user.click(within(dialog).getByLabelText('Repete todo mês'));
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    // Foi para o mês passado (a data escolhida) e já lançou este também.
    expect(await screen.findByText('Fixo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(await screen.findByText('Fixo')).toBeInTheDocument();
    expect(await repositories.recurring.list()).toHaveLength(1);
  });

  it('Resumo: define um limite e vê a barra; lista o fixo e para de repetir', async () => {
    const { user, repositories } = await setup(async (repo) => {
      await repo.create({
        type: 'outcome',
        description: 'Cinema',
        category: 'Lazer',
        amountCents: 8500,
        date: today(),
      });
    });
    await repositories.recurring.create({
      type: 'outcome',
      description: 'Spotify',
      category: 'Assinaturas',
      amountCents: 2400,
      dayOfMonth: 10,
      startMonth: addMonths(today().slice(0, 7), 1),
    });
    await user.click(await screen.findByRole('link', { name: 'Resumo' }));

    await user.click(await screen.findByRole('button', { name: 'Definir limites' }));
    const dialog = await screen.findByRole('dialog', { name: 'Limites por mês' });
    await user.type(within(dialog).getByLabelText('Limite de Lazer'), '100');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar limites' }));

    const bar = await screen.findByRole('progressbar', { name: 'Lazer' });
    expect(bar).toHaveAttribute('aria-valuenow', '85');
    expect(screen.getByText(money('R$ 85,00 de R$ 100,00'), { exact: false })).toBeInTheDocument();

    expect(await screen.findByText('Spotify')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Parar de repetir Spotify' }));
    await user.click(screen.getByRole('button', { name: 'Parar?' }));
    await waitFor(() => {
      expect(screen.queryByText('Spotify')).not.toBeInTheDocument();
    });
  });
});
