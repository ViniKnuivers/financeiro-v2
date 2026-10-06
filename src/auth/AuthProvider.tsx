import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { AuthGateway, User } from './auth-gateway';

export function AuthProvider({ gateway, children }: { gateway: AuthGateway; children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let active = true;
    gateway.currentUser().then(
      (current) => {
        if (active) setUser((known) => (known === undefined ? current : known));
      },
      () => {
        if (active) setUser((known) => (known === undefined ? null : known));
      },
    );
    const stopUser = gateway.onChange((next) => {
      setUser(next);
    });
    const stopRecovery = gateway.onPasswordRecovery(() => {
      setRecovering(true);
    });
    return () => {
      active = false;
      stopUser();
      stopRecovery();
    };
  }, [gateway]);

  const value = useMemo(
    () => ({
      user,
      gateway,
      recovering,
      finishRecovery: () => {
        setRecovering(false);
      },
    }),
    [user, gateway, recovering],
  );
  return <AuthContext value={value}>{children}</AuthContext>;
}
