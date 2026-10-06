import styled from 'styled-components';

export const LoginContainer = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: calc(1.5rem + env(safe-area-inset-top)) 1.5rem 1.5rem;
  background: ${(props) => props.theme['gray-900']};
`;

export const Card = styled.section`
  width: min(24rem, 100%);
  background: ${(props) => props.theme['gray-800']};
  border-radius: 8px;
  padding: 2.5rem 2rem;

  header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;

    h1 {
      font-size: 1.5rem;
    }
  }

  h2 {
    font-size: 1.125rem;
    font-weight: 500;
    color: ${(props) => props.theme['gray-300']};
    margin-bottom: 1.25rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  footer {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  input {
    border-radius: 6px;
    border: 0;
    background: ${(props) => props.theme['gray-900']};
    color: ${(props) => props.theme['gray-300']};
    padding: 1rem;

    &::placeholder {
      color: ${(props) => props.theme['gray-500']};
    }
  }

  span {
    font-size: 0.875rem;
    color: ${(props) => props.theme['red-300']};
  }
`;

export const Message = styled.p<{ $kind: 'error' | 'info' }>`
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${(props) => (props.$kind === 'error' ? props.theme['red-300'] : props.theme['green-300'])};
`;

export const SubmitButton = styled.button`
  height: 52px;
  border: 0;
  border-radius: 6px;
  background: ${(props) => props.theme['purple-500']};
  color: ${(props) => props.theme.white};
  font-weight: bold;

  &:not(:disabled):hover {
    background: ${(props) => props.theme['purple-700']};
  }
`;

export const LinkButton = styled.button`
  border: 0;
  background: transparent;
  color: ${(props) => props.theme['purple-300']};
  font-weight: 500;
`;
