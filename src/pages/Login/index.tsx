import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router';
import { z } from 'zod';
import logo from '../../assets/logo.svg';
import { AuthFailure, type AuthFailureReason } from '../../auth/auth-gateway';
import { useAuth } from '../../hooks/useAuth';
import { Card, Field, LinkButton, LoginContainer, Message, SubmitButton } from './styles';

type Mode = 'signIn' | 'signUp' | 'reset';

const MIN_PASSWORD = 8;

const schema = z.object({
  email: z.email('Digite um e-mail válido'),
  password: z.string(),
});
type LoginForm = z.infer<typeof schema>;

const FAILURES: Record<AuthFailureReason, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
  user_exists: 'Já existe uma conta com esse e-mail. Entre ou recupere a senha.',
  weak_password: `Senha fraca: use pelo menos ${MIN_PASSWORD} caracteres, misturando letras e números.`,
  rate_limited: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  unknown: 'Não deu certo. Verifique a internet e tente de novo.',
};

const TITLES: Record<Mode, string> = {
  signIn: 'Entrar',
  signUp: 'Criar conta',
  reset: 'Recuperar senha',
};

export function Login() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  if (!auth) return <Navigate to="/" replace />;
  // Ainda lendo a sessão salva: não mostra o formulário (parecia pedir login de novo).
  if (auth.user === undefined) return <LoginContainer aria-busy="true" />;
  if (auth.user) return <Navigate to="/" replace />;
  const { gateway } = auth;

  async function submit({ email, password }: LoginForm) {
    setMessage(null);
    if (mode !== 'reset' && password.length < (mode === 'signUp' ? MIN_PASSWORD : 1)) {
      setError('password', {
        message: mode === 'signUp' ? `Pelo menos ${MIN_PASSWORD} caracteres` : 'Digite a senha',
      });
      return;
    }
    try {
      if (mode === 'signIn') {
        await gateway.signIn(email, password);
      } else if (mode === 'signUp') {
        const result = await gateway.signUp(email, password);
        if (result === 'confirm_email') {
          setMessage({
            kind: 'info',
            text: `Conta criada! Enviamos um link para ${email}. Clique nele para entrar.`,
          });
        }
      } else {
        await gateway.resetPassword(email);
        setMessage({
          kind: 'info',
          text: `Se existir uma conta com ${email}, você vai receber um link para criar uma senha nova.`,
        });
      }
    } catch (error) {
      const reason = error instanceof AuthFailure ? error.reason : 'unknown';
      setMessage({ kind: 'error', text: FAILURES[reason] });
    }
  }

  function switchTo(next: Mode) {
    setMode(next);
    setMessage(null);
  }

  return (
    <LoginContainer>
      <Card>
        <header>
          <img src={logo} alt="" width={48} height={48} />
          <h1>Financeiro</h1>
        </header>
        <h2>{TITLES[mode]}</h2>

        {/* method/action e os autocomplete "username"/"current-password" são o padrão que
            o iPhone (Chaves) e o Chrome reconhecem para oferecer "salvar senha". */}
        <form
          method="post"
          action="/entrar"
          onSubmit={(event) => void handleSubmit(submit)(event)}
          noValidate
        >
          <Field>
            <input
              id="email"
              type="email"
              inputMode="email"
              placeholder="E-mail"
              aria-label="E-mail"
              autoComplete="username"
              {...register('email')}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </Field>

          {mode !== 'reset' && (
            <Field>
              <input
                id="password"
                type="password"
                placeholder="Senha"
                aria-label="Senha"
                autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                {...register('password')}
              />
              {errors.password && <span>{errors.password.message}</span>}
            </Field>
          )}

          {message && (
            <Message role={message.kind === 'error' ? 'alert' : 'status'} $kind={message.kind}>
              {message.text}
            </Message>
          )}

          <SubmitButton type="submit" disabled={isSubmitting}>
            {mode === 'signIn' ? 'Entrar' : mode === 'signUp' ? 'Criar conta' : 'Enviar link'}
          </SubmitButton>
        </form>

        <footer>
          {mode === 'signIn' ? (
            <>
              <LinkButton
                type="button"
                onClick={() => {
                  switchTo('signUp');
                }}
              >
                Criar conta
              </LinkButton>
              <LinkButton
                type="button"
                onClick={() => {
                  switchTo('reset');
                }}
              >
                Esqueci a senha
              </LinkButton>
            </>
          ) : (
            <LinkButton
              type="button"
              onClick={() => {
                switchTo('signIn');
              }}
            >
              Já tenho conta: entrar
            </LinkButton>
          )}
        </footer>
      </Card>
    </LoginContainer>
  );
}
