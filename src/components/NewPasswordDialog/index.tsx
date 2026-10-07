import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { AuthFailure } from '../../auth/auth-gateway';
import { useAuth } from '../../hooks/useAuth';
import { Content, Overlay } from '../ui/dialog';
import { ErrorText, Field, SubmitButton } from '../TransactionModal/styles';

const MIN_PASSWORD = 8;

/** Depois do link de "esqueci a senha": a pessoa já entrou e escolhe a senha nova. */
export function NewPasswordDialog() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!auth) return null;
  const { gateway, recovering, finishRecovery } = auth;

  async function save() {
    if (password.length < MIN_PASSWORD) {
      setError(`Pelo menos ${MIN_PASSWORD} caracteres`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await gateway.updatePassword(password);
      finishRecovery();
    } catch (failure) {
      setError(
        failure instanceof AuthFailure && failure.reason === 'weak_password'
          ? 'Senha fraca: misture letras e números.'
          : 'Não deu certo. Tente de novo.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={recovering}>
      <Dialog.Portal>
        <Overlay />
        <Content aria-describedby={undefined}>
          <Dialog.Title>Crie uma senha nova</Dialog.Title>
          <form
            style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <Field>
              <input
                type="password"
                placeholder="Senha nova"
                aria-label="Senha nova"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              {error && <ErrorText>{error}</ErrorText>}
            </Field>
            <SubmitButton type="submit" disabled={busy}>
              Salvar senha
            </SubmitButton>
          </form>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
