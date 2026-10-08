import styled, { type DefaultTheme } from 'styled-components';
import type { BudgetStatus } from '../../../domain/budget';

export const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h3 {
    margin-bottom: 0 !important;

    small {
      color: ${(props) => props.theme['gray-400']};
      font-weight: 400;
    }
  }

  button {
    border: 0;
    background: transparent;
    color: ${(props) => props.theme['purple-300']};
    font-weight: 500;
    white-space: nowrap;
  }
`;

/** Âmbar a partir de 80% do limite, vermelho acima de 100%. */
const AMBER = '#FBA94C';

function levelColor(level: BudgetStatus['level'], theme: DefaultTheme): string {
  if (level === 'over') return theme['red-300'];
  return level === 'warn' ? AMBER : theme['purple-500'];
}

export const BudgetRow = styled.div<{ $level: BudgetStatus['level'] }>`
  & + & {
    margin-top: 1rem;
  }

  > div:first-child {
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
      color: ${(props) =>
        props.$level === 'ok' ? props.theme['gray-100'] : levelColor(props.$level, props.theme)};
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
      background: ${(props) => levelColor(props.$level, props.theme)};
    }
  }
`;

export const LimitsForm = styled.form`
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  max-height: 60dvh;
  overflow-y: auto;

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: ${(props) => props.theme['gray-300']};

    input {
      width: 8.5rem;
      border: 0;
      border-radius: 6px;
      background: ${(props) => props.theme['gray-900']};
      color: ${(props) => props.theme['gray-100']};
      padding: 0.625rem 0.75rem;
      text-align: right;

      &::placeholder {
        color: ${(props) => props.theme['gray-500']};
      }
    }
  }

  button[type='submit'] {
    margin-top: 0.75rem;
    position: sticky;
    bottom: 0;
  }
`;

export const RecurringList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;

    div {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;

      strong {
        font-weight: 500;
      }

      span {
        color: ${(props) => props.theme['gray-500']};
      }
    }

    .income {
      color: ${(props) => props.theme['green-300']};
    }
    .outcome {
      color: ${(props) => props.theme['red-300']};
    }

    button {
      border: 1px solid ${(props) => props.theme['gray-600']};
      background: transparent;
      color: ${(props) => props.theme['gray-400']};
      border-radius: 6px;
      padding: 0.25rem 0.625rem;
      font-size: 0.8125rem;

      &.danger {
        border-color: ${(props) => props.theme['red-300']};
        color: ${(props) => props.theme['red-300']};
      }
    }
  }
`;

/** Os números do topo da janela "categoria mês a mês". */
export const HistoryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 1.25rem 0 1rem;

  div {
    background: ${(props) => props.theme['gray-700']};
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  span {
    font-size: 0.75rem;
    color: ${(props) => props.theme['gray-400']};
  }

  strong {
    font-size: 0.9375rem;
    font-weight: 500;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;
