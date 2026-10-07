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

type Tone = 'good' | 'bad' | 'neutral';

/** No cartão roxo, verde e vermelho escuros somem: usa tons claros. */
const ON_PURPLE: Record<Tone, string> = { good: '#B9F6DA', bad: '#FFD0D5', neutral: '#E1E1E6' };

export const Delta = styled.small<{ $tone: Tone; $onPurple?: boolean }>`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  font-weight: ${(props) => (props.$onPurple ? 500 : 400)};
  color: ${(props) =>
    props.$onPurple
      ? ON_PURPLE[props.$tone]
      : props.$tone === 'good'
        ? props.theme['green-300']
        : props.$tone === 'bad'
          ? props.theme['red-300']
          : props.theme['gray-400']};
`;

/** Saldo de tudo até o fim do mês (no cartão roxo). */
export const Accumulated = styled.small`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: ${ON_PURPLE.neutral};
`;
