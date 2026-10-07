import { useEffect } from 'react';
import { ToastBox } from './styles';

export interface ToastMessage {
  /** Muda a cada aviso, para o tempo recomeçar. */
  id: number;
  text: string;
  actions?: { label: string; onClick: () => void }[];
}

/** Quanto tempo o aviso fica na tela. */
export const TOAST_MS = 6000;

/** Aviso no rodapé (ex.: "Mercado apagado · Desfazer"), que some sozinho. */
export function Toast({ message, onClose }: { message: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, TOAST_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose]);

  return (
    <ToastBox role="status" aria-live="polite" $visible={message !== null}>
      {message && (
        <>
          <span>{message.text}</span>
          {message.actions?.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                onClose();
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </>
      )}
    </ToastBox>
  );
}
