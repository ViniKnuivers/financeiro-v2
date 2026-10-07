import { AuthFailure, type AuthGateway, type User } from '../auth/auth-gateway';

/** Login falso: uma conta conhecida (vini@exemplo.com / senha-boa-123). */
export class FakeAuth implements AuthGateway {
  user: User | null = null;
  confirmEmail = true;
  private listeners = new Set<(user: User | null) => void>();
  private recoveryListeners = new Set<() => void>();
  passwordUpdates: string[] = [];

  currentUser() {
    return Promise.resolve(this.user);
  }

  onChange(listener: (user: User | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  onPasswordRecovery(listener: () => void) {
    this.recoveryListeners.add(listener);
    return () => {
      this.recoveryListeners.delete(listener);
    };
  }

  signIn(email: string, password: string) {
    if (email !== 'vini@exemplo.com' || password !== 'senha-boa-123') {
      return Promise.reject(new AuthFailure('invalid_credentials', 'credenciais'));
    }
    this.set({ id: 'u1', email });
    return Promise.resolve();
  }

  signUp(email: string) {
    if (email === 'vini@exemplo.com') {
      return Promise.reject(new AuthFailure('user_exists', 'existe'));
    }
    if (this.confirmEmail) return Promise.resolve('confirm_email' as const);
    this.set({ id: 'u2', email });
    return Promise.resolve('signed_in' as const);
  }

  resetPassword() {
    return Promise.resolve();
  }

  updatePassword(password: string) {
    this.passwordUpdates.push(password);
    return Promise.resolve();
  }

  deletedAccounts: string[] = [];

  deleteAccount() {
    if (this.user) this.deletedAccounts.push(this.user.email);
    this.set(null);
    return Promise.resolve();
  }

  signOut() {
    this.set(null);
    return Promise.resolve();
  }

  /** Simula a volta pelo link de "esqueci a senha". */
  recover() {
    for (const listener of this.recoveryListeners) listener();
  }

  private set(user: User | null) {
    this.user = user;
    for (const listener of this.listeners) listener(user);
  }
}
