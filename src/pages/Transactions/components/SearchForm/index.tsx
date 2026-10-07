import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useTransactions } from '../../../../hooks/useTransactions';
import { SearchFormContainer } from './styles';

/** Filtra enquanto você digita (descrição ou categoria), no mês da tela. */
export function SearchForm() {
  const { filters, setFilters } = useTransactions();
  const query = filters.query;
  const setQuery = (value: string) => {
    setFilters({ query: value });
  };

  return (
    <SearchFormContainer
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <MagnifyingGlassIcon size={20} aria-hidden />
      <input
        type="search"
        placeholder="Busque por descrição ou categoria"
        aria-label="Buscar transação"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      {query && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => {
            setQuery('');
          }}
        >
          <XIcon size={18} />
        </button>
      )}
    </SearchFormContainer>
  );
}
