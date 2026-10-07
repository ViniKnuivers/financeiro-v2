import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { FakeAuth } from '../test/fake-auth';
import { localRepositories } from '../test/local-repositories';

function setup(auth = new FakeAuth()) {
  window.history.pushState({}, '', '/');
  render(<App repositories={localRepositories()} auth={auth} />);
  return { user: userEvent.setup(), auth };
}

describe('login', () => {
  it('campos no padrão que o celular reconhece para salvar a senha', async () => {
    setup();
    expect(await screen.findByLabelText('E-mail')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('já logado, abrir /entrar leva direto para os lançamentos (sem pedir login)', async () => {
    const auth = new FakeAuth();
    auth.user = { id: 'u1', email: 'vini@exemplo.com' };
    window.history.pushState({}, '', '/entrar');
    render(<App repositories={localRepositories()} auth={auth} />);

    expect(await screen.findByText(/Nenhuma transação em/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
  });

  it('sem entrar, vai para a página de login; entrando, vê os lançamentos e pode sair', async () => {
    const { user } = setup();

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail'), 'vini@exemplo.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-errada');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');

    await user.clear(screen.getByLabelText('Senha'));
    await user.type(screen.getByLabelText('Senha'), 'senha-boa-123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/Nenhuma transação em/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sair (vini@exemplo.com)' }));
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('criar conta: senha curta é recusada; depois pede para confirmar o e-mail', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Criar conta' }));
    await user.type(screen.getByLabelText('E-mail'), 'amigo@exemplo.com');
    await user.type(screen.getByLabelText('Senha'), 'curta');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Pelo menos 8 caracteres')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Senha'));
    await user.type(screen.getByLabelText('Senha'), 'uma-senha-longa-1');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Conta criada! Enviamos um link para amigo@exemplo.com.',
    );
  });

  it('e-mail já cadastrado e recuperação de senha', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Criar conta' }));
    await user.type(screen.getByLabelText('E-mail'), 'vini@exemplo.com');
    await user.type(screen.getByLabelText('Senha'), 'qualquer-coisa-1');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe uma conta');

    await user.click(screen.getByRole('button', { name: 'Já tenho conta: entrar' }));
    await user.click(screen.getByRole('button', { name: 'Esqueci a senha' }));
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(await screen.findByRole('status')).toHaveTextContent('você vai receber um link');
  });

  it('voltando pelo link de senha nova, pede a senha nova', async () => {
    const auth = new FakeAuth();
    auth.user = { id: 'u1', email: 'vini@exemplo.com' };
    const { user } = setup(auth);
    await screen.findByText(/Nenhuma transação em/);

    act(() => {
      auth.recover();
    });
    await user.type(await screen.findByLabelText('Senha nova'), 'nova-senha-123');
    await user.click(screen.getByRole('button', { name: 'Salvar senha' }));

    expect(auth.passwordUpdates).toEqual(['nova-senha-123']);
    expect(screen.queryByLabelText('Senha nova')).not.toBeInTheDocument();
  });

  it('Minha conta: troca a senha e exclui a conta só depois de digitar EXCLUIR', async () => {
    const auth = new FakeAuth();
    auth.user = { id: 'u1', email: 'vini@exemplo.com' };
    const { user } = setup(auth);

    await user.click(await screen.findByRole('link', { name: 'Minha conta' }));
    expect(await screen.findByText('vini@exemplo.com')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Senha nova'), 'curta');
    await user.click(screen.getByRole('button', { name: 'Salvar senha' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('pelo menos 8 caracteres');
    await user.clear(screen.getByLabelText('Senha nova'));
    await user.type(screen.getByLabelText('Senha nova'), 'senha-nova-123');
    await user.click(screen.getByRole('button', { name: 'Salvar senha' }));
    expect(await screen.findByText('Senha alterada.')).toBeInTheDocument();
    expect(auth.passwordUpdates).toEqual(['senha-nova-123']);

    const remove = screen.getByRole('button', { name: 'Excluir conta' });
    expect(remove).toBeDisabled();
    await user.type(screen.getByLabelText('Digite EXCLUIR para confirmar'), 'EXCLUIR');
    await user.click(remove);

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(auth.deletedAccounts).toEqual(['vini@exemplo.com']);
  });
});
