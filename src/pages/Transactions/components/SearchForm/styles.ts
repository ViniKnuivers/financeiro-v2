import styled from 'styled-components';

export const SearchFormContainer = styled.form`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-radius: 6px;
  background: ${(props) => props.theme['gray-900']};
  color: ${(props) => props.theme['gray-500']};

  &:focus-within {
    box-shadow: 0 0 0 2px ${(props) => props.theme['purple-500']};
  }

  input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    color: ${(props) => props.theme['gray-300']};
    padding: 1rem 0;

    &:focus {
      box-shadow: none;
    }

    &::placeholder {
      color: ${(props) => props.theme['gray-500']};
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  button {
    border: 0;
    background: transparent;
    color: ${(props) => props.theme['gray-400']};
    line-height: 0;
  }
`;
