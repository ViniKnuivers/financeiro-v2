import type { AuthError, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthFailure, type AuthFailureReason, type AuthGateway, type User } from './auth-gateway';

function toUser(user: SupabaseUser | null | undefined): User | null {
  return user ? { id: user.id, email: user.email ?? '' } : null;
}

function toFailure(error: AuthError): AuthFailure {
  const reasons: Record<string, AuthFailureReason> = {
    invalid_credentials: 'invalid_credentials',
    email_not_confirmed: 'email_not_confirmed',
    user_already_exists: 'user_exists',
    email_exists: 'user_exists',
    weak_password: 'weak_password',
    over_request_rate_limit: 'rate_limited',
    over_email_send_rate_limit: 'rate_limited',
  };
  return new AuthFailure(reasons[error.code ?? ''] ?? 'unknown', error.message);
}

/** Login por e-mail e senha no Supabase Auth. */
export class SupabaseAuthGateway implements AuthGateway {
  private readonly client: SupabaseClient;
  /** Para onde o link do e-mail (confirmação, senha nova) leva de volta. */
  private readonly redirectTo: string;

  constructor(client: SupabaseClient, redirectTo: string) {
    this.client = client;
    this.redirectTo = redirectTo;
  }

  async currentUser(): Promise<User | null> {
    const { data } = await this.client.auth.getSession();
    return toUser(data.session?.user);
  }

  onChange(listener: (user: User | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(toUser(session?.user));
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw toFailure(error);
  }

  async signUp(email: string, password: string): Promise<'signed_in' | 'confirm_email'> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: this.redirectTo },
    });
    if (error) throw toFailure(error);
    // Com "confirmar e-mail" ligado, a conta nasce sem sessão até clicar no link. Se o
    // e-mail já existe, o Supabase devolve um usuário sem identidades (sem dizer que existe).
    if (data.user?.identities?.length === 0) {
      throw new AuthFailure('user_exists', 'já existe conta com esse e-mail');
    }
    return data.session ? 'signed_in' : 'confirm_email';
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: this.redirectTo,
    });
    if (error) throw toFailure(error);
  }

  onPasswordRecovery(listener: () => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') listener();
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password });
    if (error) throw toFailure(error);
  }

  async deleteAccount(): Promise<void> {
    // A função do banco apaga só quem chamou (auth.uid()); os dados vão junto (cascade).
    const { error } = await this.client.rpc('delete_my_account');
    if (error) throw new AuthFailure('unknown', error.message);
    await this.client.auth.signOut({ scope: 'local' });
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw toFailure(error);
  }
}
