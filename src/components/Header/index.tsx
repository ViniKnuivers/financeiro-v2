import { PlusIcon, SignOutIcon } from '@phosphor-icons/react';
import { NavLink } from 'react-router';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../hooks/useAuth';
import { useTransactionModal } from '../../hooks/useTransactionModal';
import {
  HeaderContainer,
  HeaderContent,
  Logo,
  Nav,
  NewTransactionButton,
  SignOutButton,
} from './styles';

export function Header() {
  const { openCreate } = useTransactionModal();
  const auth = useAuth();

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <img src={logo} alt="" width={40} height={40} />
          <strong>Financeiro</strong>
        </Logo>

        <Nav aria-label="Páginas">
          <NavLink to="/" end>
            Lançamentos
          </NavLink>
          <NavLink to="/resumo">Resumo</NavLink>
        </Nav>

        <NewTransactionButton type="button" onClick={openCreate} aria-label="Nova transação">
          <PlusIcon size={20} weight="bold" />
          <span>Nova transação</span>
        </NewTransactionButton>

        {auth?.user && (
          <SignOutButton
            type="button"
            aria-label={`Sair (${auth.user.email})`}
            title={`Sair (${auth.user.email})`}
            onClick={() => void auth.gateway.signOut()}
          >
            <SignOutIcon size={22} />
          </SignOutButton>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
}
