import styled from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

export const TransactionContainer = styled.main`
  width: 100%;
  max-width: 1120px;
  margin: 4rem auto 4rem;
  padding: 0 1.5rem;

  ${MOBILE} {
    margin-top: 2rem;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${MOBILE} {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;

    > div {
      justify-content: center;
    }
  }
`;

export const TransactionTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.5rem;
  margin-top: 1.5rem;

  td {
    padding: 1.25rem 2rem;
    background: ${(props) => props.theme['gray-700']};

    &:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    &:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }

  td.description {
    width: 45%;
  }

  td.actions {
    width: 1%;
    white-space: nowrap;
    padding: 0 1rem;
  }

  /* No celular, cada linha vira um cartão: descrição e valor em cima, o resto embaixo. */
  ${MOBILE} {
    tbody {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'description actions'
        'amount amount'
        'category date';
      background: ${(props) => props.theme['gray-700']};
      border-radius: 6px;
      padding: 1.25rem;
      row-gap: 0.5rem;
    }

    td {
      padding: 0;
      background: transparent;
      border-radius: 0 !important;
    }

    td.description {
      grid-area: description;
      width: auto;
      color: ${(props) => props.theme['gray-300']};
    }
    td.amount {
      grid-area: amount;
      font-size: 1.25rem;
      font-weight: bold;
    }
    td.category {
      grid-area: category;
      color: ${(props) => props.theme['gray-500']};
    }
    td.date {
      grid-area: date;
      color: ${(props) => props.theme['gray-500']};
      text-align: right;
    }
    td.actions {
      grid-area: actions;
      padding: 0;
    }
  }
`;

interface PriceHighlightProps {
  $variant: 'income' | 'outcome';
}

export const PriceHighlight = styled.span<PriceHighlightProps>`
  white-space: nowrap;
  color: ${(props) =>
    props.$variant === 'income' ? props.theme['green-300'] : props.theme['red-300']};
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  border: 0;
  background: transparent;
  color: ${(props) => props.theme['gray-500']};
  line-height: 0;
  padding: 0.5rem;
  border-radius: 6px;
  transition: color 0.2s;

  &:hover {
    color: ${(props) => (props.$danger ? props.theme['red-300'] : props.theme['purple-300'])};
  }
`;

export const EmptyState = styled.div`
  margin-top: 1.5rem;
  padding: 3rem 1.5rem;
  border-radius: 6px;
  border: 1px dashed ${(props) => props.theme['gray-600']};
  color: ${(props) => props.theme['gray-400']};
  text-align: center;

  button {
    margin-top: 1.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid ${(props) => props.theme['purple-300']};
    background: transparent;
    color: ${(props) => props.theme['purple-300']};
    font-weight: bold;
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    transition:
      background-color 0.2s,
      color 0.2s;

    &:hover {
      background: ${(props) => props.theme['purple-500']};
      color: ${(props) => props.theme.white};
    }
  }
`;
