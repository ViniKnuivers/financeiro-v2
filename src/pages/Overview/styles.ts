import styled from 'styled-components';
import { MOBILE } from '../../styles/themes/default';

export const OverviewContainer = styled.main`
  width: 100%;
  max-width: 1120px;
  margin: 4rem auto;
  padding: 0 1.5rem;

  ${MOBILE} {
    margin-top: 2rem;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: flex-start;

  ${MOBILE} {
    justify-content: center;
  }
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 2rem;
  margin-top: 1.5rem;

  ${MOBILE} {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 641px) and (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.section`
  background: ${(props) => props.theme['gray-700']};
  border-radius: 6px;
  padding: 1.5rem;
  min-width: 0;

  h3 {
    font-size: 1rem;
    font-weight: 500;
    color: ${(props) => props.theme['gray-300']};
    margin-bottom: 1rem;
  }

  .empty {
    color: ${(props) => props.theme['gray-500']};
    padding: 3rem 0;
    text-align: center;
  }
`;

export const CategoryList = styled.ul`
  list-style: none;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;

  li {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .percent {
    color: ${(props) => props.theme['gray-500']};
  }

  strong {
    font-weight: 500;
    min-width: 6.5rem;
    text-align: right;
  }
`;
