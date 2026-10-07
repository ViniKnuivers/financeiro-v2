import { categoriesIn, type ListFilters } from '../../../../domain/summary';
import { useTransactions } from '../../../../hooks/useTransactions';
import { FiltersContainer, Segmented } from './styles';

const TYPES: { value: ListFilters['type']; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Entradas' },
  { value: 'outcome', label: 'Saídas' },
];

/** Tipo, categoria e ordem, somados à busca. */
export function Filters() {
  const { filters, setFilters, transactions } = useTransactions();
  const categories = categoriesIn(transactions);

  return (
    <FiltersContainer aria-label="Filtros">
      <Segmented role="group" aria-label="Tipo">
        {TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.type === value}
            onClick={() => {
              setFilters({ type: value });
            }}
          >
            {label}
          </button>
        ))}
      </Segmented>

      <select
        aria-label="Categoria"
        value={filters.category}
        onChange={(event) => {
          setFilters({ category: event.target.value });
        }}
      >
        <option value="">Categorias</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        aria-label="Ordem"
        value={filters.sort}
        onChange={(event) => {
          setFilters({ sort: event.target.value === 'amount' ? 'amount' : 'date' });
        }}
      >
        <option value="date">Mais recentes</option>
        <option value="amount">Maior valor</option>
      </select>
    </FiltersContainer>
  );
}
