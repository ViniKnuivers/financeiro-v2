import { NavLink } from 'react-router';
import { Tabs } from '../styles';

/** Resumo do mês ou do ano. */
export function PeriodTabs() {
  return (
    <Tabs aria-label="Período">
      <NavLink to="/resumo" end>
        Mês
      </NavLink>
      <NavLink to="/resumo/ano">Ano</NavLink>
    </Tabs>
  );
}
