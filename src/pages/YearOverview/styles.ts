import styled from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

/** Os quatro destaques do ano, lado a lado (dois por linha no celular). */
export const Highlights = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;

  li {
    background: ${(props) => props.theme['gray-700']};
    border-radius: 6px;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  span,
  small {
    font-size: 0.8125rem;
    color: ${(props) => props.theme['gray-400']};
  }

  strong {
    font-weight: 500;
    overflow-wrap: anywhere;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  ${MOBILE} {
    gap: 0.75rem;
  }
`;

export const TopCategories = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  > li > div:first-child {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.875rem;
    margin-bottom: 0.375rem;

    span:last-child {
      color: ${(props) => props.theme['gray-400']};
      white-space: nowrap;
    }

    strong {
      color: ${(props) => props.theme['gray-100']};
    }
  }

  .bar {
    height: 8px;
    border-radius: 999px;
    background: ${(props) => props.theme['gray-600']};
    overflow: hidden;

    div {
      height: 100%;
      border-radius: 999px;
      background: ${(props) => props.theme['purple-500']};
    }
  }
`;
