import styled, { css } from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

export const SummaryContainer = styled.section`
  width: 100%;
  max-width: 1120px;
  margin: -5rem auto 0;
  padding: 0 1.5rem;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  ${MOBILE} {
    /* No celular, os cartões deslizam para o lado. */
    grid-template-columns: repeat(3, 80%);
    gap: 1rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 1.5rem;
    scrollbar-width: none;
  }
`;

interface SummaryCardProps {
  $variant?: 'purple';
}

export const SummaryCard = styled.div<SummaryCardProps>`
  background: ${(props) => props.theme['gray-600']};
  border-radius: 6px;
  padding: 2rem;
  scroll-snap-align: start;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${(props) => props.theme['gray-300']};
  }

  strong {
    display: block;
    margin-top: 1rem;
    font-size: 2rem;
    white-space: nowrap;
  }

  ${MOBILE} {
    padding: 1.5rem;

    strong {
      font-size: 1.5rem;
    }
  }

  ${(props) =>
    props.$variant === 'purple' &&
    css`
      background: ${props.theme['purple-700']};

      header {
        color: ${props.theme['gray-100']};
      }
    `}
`;
