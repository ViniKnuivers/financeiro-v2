import styled from 'styled-components';

export const MonthPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  h2 {
    font-size: 1.125rem;
    font-weight: 500;
    min-width: 11rem;
    text-align: center;

    &::first-letter {
      text-transform: uppercase;
    }
  }
`;

export const MonthButton = styled.button`
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 6px;
  background: ${(props) => props.theme['gray-700']};
  color: ${(props) => props.theme['gray-300']};
  display: grid;
  place-items: center;

  &:hover {
    background: ${(props) => props.theme['gray-600']};
  }
`;

export const TodayButton = styled.button`
  margin-left: 0.5rem;
  border: 0;
  background: transparent;
  color: ${(props) => props.theme['purple-300']};
  font-weight: 500;
`;
