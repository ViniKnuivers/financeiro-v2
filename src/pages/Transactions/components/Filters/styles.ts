import styled from 'styled-components';
import { MOBILE } from '../../../../styles/themes/default';

export const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  select {
    border: 0;
    border-radius: 6px;
    background: ${(props) => props.theme['gray-700']};
    color: ${(props) => props.theme['gray-300']};
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
    color-scheme: dark;
  }

  ${MOBILE} {
    gap: 0.5rem;

    select {
      flex: 1;
      min-width: 0;
    }
  }
`;

export const Segmented = styled.div`
  display: flex;
  background: ${(props) => props.theme['gray-700']};
  border-radius: 6px;
  padding: 0.25rem;

  button {
    border: 0;
    background: transparent;
    color: ${(props) => props.theme['gray-400']};
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.375rem 0.875rem;
    border-radius: 4px;
    transition:
      background-color 0.2s,
      color 0.2s;

    &[aria-pressed='true'] {
      background: ${(props) => props.theme['purple-500']};
      color: ${(props) => props.theme.white};
    }
  }

  ${MOBILE} {
    flex-basis: 100%;

    button {
      flex: 1;
    }
  }
`;
