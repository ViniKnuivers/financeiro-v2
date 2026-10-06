import styled from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

export const HeaderContainer = styled.header`
  background: ${(props) => props.theme['gray-900']};
  padding: 2.5rem 0 7.5rem;

  ${MOBILE} {
    padding: 1.5rem 0 6.5rem;
  }
`;

export const HeaderContent = styled.div`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;

  display: flex;
  align-items: center;
  gap: 2rem;

  ${MOBILE} {
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  strong {
    font-size: 1.5rem;
    color: ${(props) => props.theme['gray-100']};
  }
`;

export const Nav = styled.nav`
  display: flex;
  gap: 0.5rem;
  flex: 1;

  a {
    color: ${(props) => props.theme['gray-400']};
    text-decoration: none;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.theme['gray-100']};
    }

    &.active {
      color: ${(props) => props.theme['gray-100']};
      border-bottom-color: ${(props) => props.theme['purple-500']};
      border-radius: 6px 6px 0 0;
    }
  }

  ${MOBILE} {
    order: 3;
    flex-basis: 100%;
  }
`;

export const NewTransactionButton = styled.button`
  height: 50px;
  border: 0;
  background: ${(props) => props.theme['purple-500']};
  color: ${(props) => props.theme.white};
  font-weight: bold;
  padding: 0 1.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: ${(props) => props.theme['purple-700']};
  }

  /* No celular, só o "+" ao lado do logo. */
  ${MOBILE} {
    margin-left: auto;
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;

    span {
      display: none;
    }
  }
`;
