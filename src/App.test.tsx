import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { LocalTransactionsRepository } from './data/local-transactions-repository';
import { addDays, addMonths, formatMonthLong, today } from './lib/dates';
import { memoryStorage } from './test/memory-storage';

async function setup(seed?: (repository: LocalTransactionsRepository) => Promise<void>) {
  const repository = new LocalTransactionsRepository(memoryStorage());
  await seed?.(repository);
  render(<App repository={repository} auth={null} />);
  return { user: userEvent.setup(), repository };
}

const money = (text: string) => new RegExp(text.replace('R$ ', 'R\\$\\s'));

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
    expect(within(summary).getByText(money('R$ 3.445,10'))).toBeInTheDocument();
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
});
