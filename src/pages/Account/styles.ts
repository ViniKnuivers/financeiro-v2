import styled from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

export const AccountContainer = styled.main`
  width: 100%;
  max-width: 640px;
  margin: -5rem auto 4rem;
  padding: 0 1.5rem;

  h2 {
    font-size: 1.5rem;
  }

  .email {
    margin-top: 0.25rem;
    color: ${(props) => props.theme['gray-400']};
  }
`;

export const Section = styled.section<{ $danger?: boolean }>`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 6px;
  background: ${(props) => props.theme['gray-700']};
  border: 1px solid ${(props) => (props.$danger ? props.theme['red-500'] : props.theme['gray-700'])};

  h3 {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  p {
    color: ${(props) => props.theme['gray-300']};
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    gap: 0.75rem;

    ${MOBILE} {
      flex-direction: column;
    }
  }

  input {
    flex: 1;
    min-width: 0;
    border: 0;
    border-radius: 6px;
    background: ${(props) => props.theme['gray-900']};
    color: ${(props) => props.theme['gray-100']};
    padding: 0.875rem 1rem;

    &::placeholder {
      color: ${(props) => props.theme['gray-500']};
    }
  }
`;

const button = `
  height: 48px;
  border: 0;
  border-radius: 6px;
  padding: 0 1.25rem;
  font-weight: bold;
  white-space: nowrap;
`;

export const SubmitButton = styled.button`
  ${button}
  background: ${(props) => props.theme['purple-500']};
  color: ${(props) => props.theme.white};
`;

export const DangerButton = styled.button`
  ${button}
  background: ${(props) => props.theme['red-500']};
  color: ${(props) => props.theme.white};
`;

export const Message = styled.p<{ $ok: boolean }>`
  margin: 0.75rem 0 0 !important;
  font-size: 0.875rem;
  color: ${(props) => (props.$ok ? props.theme['green-300'] : props.theme['red-300'])} !important;
`;
