export interface User {
  id: string;
  email: string;
}

/**
 * - invalid_credentials: e-mail ou senha errados;
 * - email_not_confirmed: falta clicar no link do e-mail de confirmação;
 * - user_exists: já existe conta com esse e-mail;
 * - weak_password: senha fraca demais;
 * - rate_limited: tentativas demais em pouco tempo;
 * - unknown: o resto (rede, servidor).
 */
export type AuthFailureReason =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_exists'
  | 'weak_password'
  | 'rate_limited'
  | 'unknown';

export class AuthFailure extends Error {
  readonly reason: AuthFailureReason;

  constructor(reason: AuthFailureReason, message: string) {
    super(message);
    this.name = 'AuthFailure';
    this.reason = reason;
  }
}

/** Login, independente do serviço (Supabase hoje; um falso nos testes). */
export interface AuthGateway {
  currentUser(): Promise<User | null>;
  /** Avisa quando entra ou sai. Retorna a função para parar de ouvir. */
  onChange(listener: (user: User | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  /** "confirm_email": a conta foi criada e falta clicar no link enviado por e-mail. */
  signUp(email: string, password: string): Promise<'signed_in' | 'confirm_email'>;
  /** Envia o e-mail para criar uma senha nova. */
  resetPassword(email: string): Promise<void>;
  /** Avisa quando a pessoa volta pelo link de "esqueci a senha" (já entra logada). */
  onPasswordRecovery(listener: () => void): () => void;
  /** Troca a senha de quem está logado. */
  updatePassword(password: string): Promise<void>;
  /** Exclui a conta de quem está logado e todos os dados dela, e sai. */
  deleteAccount(): Promise<void>;
  signOut(): Promise<void>;
}
