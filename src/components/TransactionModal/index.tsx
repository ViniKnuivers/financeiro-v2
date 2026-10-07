import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowCircleDownIcon, ArrowCircleUpIcon, XIcon } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  CATEGORIES,
  formToInput,
  MAX_DESCRIPTION,
  MAX_INSTALLMENTS,
  transactionFormSchema,
  type Transaction,
  type TransactionForm,
  type TransactionInput,
} from '../../domain/transaction';
import type { CreateOptions } from '../../contexts/transactions-context';
import { addDays, today } from '../../lib/dates';
import { centsToInput } from '../../lib/money';
import {
  CloseButton,
  Content,
  DateRow,
  Hint,
  Options,
  QuickDate,
  ErrorText,
  Field,
  Overlay,
  SubmitButton,
  TransactionType,
  TransactionTypeButton,
} from './styles';

/**
 * Formulário de nova transação ou de edição. O Layout o remonta (key) a cada abertura,
 * então ele sempre começa com os valores certos, sem precisar "resetar".
 */
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editando esta transação; sem ela, é uma nova. */
  editing: Transaction | null;
  onSubmit: (input: TransactionInput, options: CreateOptions) => Promise<void>;
}

function defaults(editing: Transaction | null): TransactionForm {
  if (!editing) {
    return {
      type: 'outcome',
      description: '',
      amount: '',
      category: '',
      date: today(),
      installments: 1,
      repeat: false,
    };
  }
  return {
    type: editing.type,
    description: editing.description,
    amount: centsToInput(editing.amountCents),
    category: editing.category,
    date: editing.date,
    installments: 1,
    repeat: false,
  };
}

export function TransactionModal({ open, onOpenChange, editing, onSubmit }: Props) {
  const [failed, setFailed] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: defaults(editing),
  });
  const type = useWatch({ control, name: 'type' });
  const chosenDate = useWatch({ control, name: 'date' });
  const installments = useWatch({ control, name: 'installments' });
  const repeat = useWatch({ control, name: 'repeat' });

  // Trocou Entrada/Saída: a categoria escolhida pode não existir no outro tipo.
  useEffect(() => {
    if (!CATEGORIES[type].includes(getValues('category'))) setValue('category', '');
    // Entrada não é parcelada.
    if (type === 'income') setValue('installments', 1);
  }, [type, getValues, setValue]);

  async function submit(form: TransactionForm) {
    setFailed(false);
    try {
      await onSubmit(formToInput(form), {
        installments: form.installments,
        repeat: form.repeat,
      });
      onOpenChange(false);
    } catch {
      setFailed(true);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Overlay />
        <Content aria-describedby={undefined}>
          <CloseButton aria-label="Fechar">
            <XIcon size={24} />
          </CloseButton>
          <Dialog.Title>{editing ? 'Editar transação' : 'Nova transação'}</Dialog.Title>

          <form onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <TransactionType
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label="Tipo"
                >
                  <TransactionTypeButton $variant="income" value="income">
                    <ArrowCircleUpIcon size={24} />
                    Entrada
                  </TransactionTypeButton>
                  <TransactionTypeButton $variant="outcome" value="outcome">
                    <ArrowCircleDownIcon size={24} />
                    Saída
                  </TransactionTypeButton>
                </TransactionType>
              )}
            />

            <Field>
              <input
                type="text"
                placeholder="Descrição"
                aria-label="Descrição"
                maxLength={MAX_DESCRIPTION}
                autoComplete="off"
                {...register('description')}
              />
              {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
            </Field>

            <Field>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Valor (ex.: 32,50)"
                aria-label="Valor"
                autoComplete="off"
                {...register('amount')}
              />
              {errors.amount && <ErrorText>{errors.amount.message}</ErrorText>}
            </Field>

            <Field>
              <select aria-label="Categoria" {...register('category')}>
                <option value="" disabled>
                  Categoria
                </option>
                {CATEGORIES[type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <ErrorText>{errors.category.message}</ErrorText>}
            </Field>

            <Field>
              <DateRow>
                <input type="date" aria-label="Data" {...register('date')} />
                {(
                  [
                    ['Hoje', today()],
                    ['Ontem', addDays(today(), -1)],
                  ] as const
                ).map(([label, date]) => (
                  <QuickDate
                    key={label}
                    type="button"
                    aria-pressed={date === chosenDate}
                    onClick={() => {
                      setValue('date', date, { shouldValidate: true });
                    }}
                  >
                    {label}
                  </QuickDate>
                ))}
              </DateRow>
              {errors.date && <ErrorText>{errors.date.message}</ErrorText>}
            </Field>

            {/* Só em lançamento novo: parcelar (saídas) ou repetir todo mês. */}
            {!editing && (
              <Options>
                {type === 'outcome' && (
                  <select
                    aria-label="Parcelas"
                    disabled={repeat}
                    {...register('installments', { valueAsNumber: true })}
                  >
                    {Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n === 1 ? 'À vista' : `${String(n)}x`}
                      </option>
                    ))}
                  </select>
                )}
                <label>
                  <input type="checkbox" disabled={installments > 1} {...register('repeat')} />
                  Repete todo mês
                </label>
              </Options>
            )}
            {errors.repeat && <ErrorText>{errors.repeat.message}</ErrorText>}
            {installments > 1 && (
              <Hint>
                {installments} parcelas, uma por mês a partir da data. O valor é o total da compra.
              </Hint>
            )}
            {repeat && <Hint>Lançado sozinho todo mês, nesse mesmo dia.</Hint>}

            {failed && <ErrorText role="alert">Não foi possível salvar. Tente de novo.</ErrorText>}

            <SubmitButton type="submit" disabled={isSubmitting}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </SubmitButton>
          </form>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
