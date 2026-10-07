import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';
import styled, { css } from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

export const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
`;

export const Content = styled(Dialog.Content)`
  width: min(32rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  border-radius: 6px;
  padding: 2.5rem 3rem;
  background: ${(props) => props.theme['gray-800']};

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  ${MOBILE} {
    padding: 2rem 1.5rem;
  }

  form {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

const fieldControl = css`
  width: 100%;
  border-radius: 6px;
  border: 0;
  background: ${(props) => props.theme['gray-900']};
  color: ${(props) => props.theme['gray-300']};
  padding: 1rem;
  color-scheme: dark;

  &::placeholder {
    color: ${(props) => props.theme['gray-500']};
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  input,
  select {
    ${fieldControl}
  }

  select:invalid,
  select option[value=''] {
    color: ${(props) => props.theme['gray-500']};
  }
`;

export const ErrorText = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme['red-300']};
`;

export const SubmitButton = styled.button`
  height: 58px;
  border: 0;
  background: ${(props) => props.theme['purple-500']};
  color: ${(props) => props.theme.white};
  font-weight: bold;
  padding: 0 1.25rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  transition: background-color 0.2s;

  &:not(:disabled):hover {
    background: ${(props) => props.theme['purple-700']};
  }
`;

export const CloseButton = styled(Dialog.Close)`
  position: absolute;
  background: transparent;
  border: 0;
  top: 1.5rem;
  right: 1.5rem;
  line-height: 0;
  color: ${(props) => props.theme['gray-500']};
`;

export const TransactionType = styled(RadioGroup.Root)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

interface TransactionTypeButtonProps {
  /** Prop "transiente" ($): só o styled-components vê, não vai para o HTML. */
  $variant: 'income' | 'outcome';
}

export const TransactionTypeButton = styled(RadioGroup.Item)<TransactionTypeButtonProps>`
  background: ${(props) => props.theme['gray-700']};
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 6px;
  border: 0;
  color: ${(props) => props.theme['gray-300']};

  svg {
    color: ${(props) =>
      props.$variant === 'income' ? props.theme['green-300'] : props.theme['red-300']};
  }

  &[data-state='unchecked']:hover {
    transition: background-color 0.2s;
    background: ${(props) => props.theme['gray-600']};
  }

  &[data-state='checked'] {
    color: ${(props) => props.theme.white};
    background: ${(props) =>
      props.$variant === 'income' ? props.theme['green-500'] : props.theme['red-500']};

    svg {
      color: ${(props) => props.theme.white};
    }
  }
`;

export const DateRow = styled.div`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    min-width: 0;
  }
`;

/** "Hoje" / "Ontem": um toque em vez de abrir o calendário. */
export const QuickDate = styled.button`
  border: 0;
  border-radius: 6px;
  padding: 0 0.875rem;
  background: ${(props) => props.theme['gray-700']};
  color: ${(props) => props.theme['gray-300']};
  font-weight: 500;
  font-size: 0.875rem;

  &[aria-pressed='true'] {
    background: ${(props) => props.theme['purple-700']};
    color: ${(props) => props.theme.white};
  }
`;

export const Options = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  select {
    border: 0;
    border-radius: 6px;
    background: ${(props) => props.theme['gray-900']};
    color: ${(props) => props.theme['gray-300']};
    padding: 0.75rem 1rem;
    color-scheme: dark;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(props) => props.theme['gray-300']};
    cursor: pointer;

    input {
      width: 18px;
      height: 18px;
      accent-color: ${(props) => props.theme['purple-500']};
    }

    &:has(input:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export const Hint = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme['gray-400']};
  line-height: 1.4;
`;
