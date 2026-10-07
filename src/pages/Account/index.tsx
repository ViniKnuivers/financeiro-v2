import { useState } from 'react';
import { Navigate } from 'react-router';
import { AuthFailure } from '../../auth/auth-gateway';
import { useAuth } from '../../hooks/useAuth';
import { AccountContainer, DangerButton, Message, Section, SubmitButton } from './styles';

const MIN_PASSWORD = 8;
const CONFIRM_WORD = 'EXCLUIR';

/** Minha conta: trocar a senha e excluir a conta com todos os dados. */
export function Account() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!auth?.user) return <Navigate to="/" replace />;
  const { gateway, user } = auth;

  async function changePassword() {
    if (password.length < MIN_PASSWORD) {
      setPasswordMessage({
        ok: false,
        text: `A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`,
      });
      return;
    }
    setBusy(true);
    try {
      await gateway.updatePassword(password);
      setPassword('');
      setPasswordMessage({ ok: true, text: 'Senha alterada.' });
    } catch (error) {
      setPasswordMessage({
        ok: false,
        text:
          error instanceof AuthFailure && error.reason === 'weak_password'
            ? 'Senha fraca: misture letras e números.'
            : 'Não deu certo. Tente de novo.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setBusy(true);
    setDeleteError(null);
    try {
      await gateway.deleteAccount();
    } catch {
      setDeleteError('Não foi possível excluir. Tente de novo.');
      setBusy(false);
    }
  }

  return (
    <AccountContainer>
      <h2>Minha conta</h2>
      <p className="email">{user.email}</p>

      <Section>
        <h3>Trocar senha</h3>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void changePassword();
          }}
        >
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
          <SubmitButton type="submit" disabled={busy}>
            Salvar senha
          </SubmitButton>
        </form>
        {passwordMessage && (
          <Message role={passwordMessage.ok ? 'status' : 'alert'} $ok={passwordMessage.ok}>
            {passwordMessage.text}
          </Message>
        )}
      </Section>

      <Section $danger>
        <h3>Excluir conta</h3>
        <p>
          Apaga a sua conta e <strong>todos os seus lançamentos, gastos fixos e limites</strong>.
          Não dá para desfazer. Para confirmar, digite {CONFIRM_WORD}.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void deleteAccount();
          }}
        >
          <input
            type="text"
            aria-label={`Digite ${CONFIRM_WORD} para confirmar`}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
            }}
          />
          <DangerButton type="submit" disabled={busy || confirmation.trim() !== CONFIRM_WORD}>
            Excluir conta
          </DangerButton>
        </form>
        {deleteError && (
          <Message role="alert" $ok={false}>
            {deleteError}
          </Message>
        )}
      </Section>
    </AccountContainer>
  );
}
