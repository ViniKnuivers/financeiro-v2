import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useTransactions } from '../../hooks/useTransactions';
import { addMonths, formatMonthLong, monthOf, today } from '../../lib/dates';
import { MonthButton, MonthPickerContainer, TodayButton } from './styles';

export function MonthPicker() {
  const { month, setMonth } = useTransactions();
  const current = monthOf(today());

  return (
    <MonthPickerContainer>
      <MonthButton
        type="button"
        aria-label="Mês anterior"
        onClick={() => {
          setMonth(addMonths(month, -1));
        }}
      >
        <CaretLeftIcon size={20} />
      </MonthButton>
      <h2>{formatMonthLong(month)}</h2>
      <MonthButton
        type="button"
        aria-label="Próximo mês"
        onClick={() => {
          setMonth(addMonths(month, 1));
        }}
      >
        <CaretRightIcon size={20} />
      </MonthButton>
      {month !== current && (
        <TodayButton
          type="button"
          onClick={() => {
            setMonth(current);
          }}
        >
          Mês atual
        </TodayButton>
      )}
    </MonthPickerContainer>
  );
}
