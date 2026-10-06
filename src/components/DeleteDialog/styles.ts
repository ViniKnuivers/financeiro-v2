import * as Dialog from '@radix-ui/react-dialog';
import styled from 'styled-components';

export const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
`;

export const Content = styled(Dialog.Content)`
  width: min(26rem, calc(100vw - 2rem));
  border-radius: 6px;
  padding: 2rem;
  background: ${(props) => props.theme['gray-800']};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  p {
    margin-top: 1rem;
    color: ${(props) => props.theme['gray-300']};
    line-height: 1.5;
  }

  [role='alert'] {
    color: ${(props) => props.theme['red-300']};
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;

  button {
    height: 44px;
    padding: 0 1.25rem;
    border-radius: 6px;
    font-weight: bold;
  }
`;

export const CancelButton = styled.button`
  border: 1px solid ${(props) => props.theme['gray-600']};
  background: transparent;
  color: ${(props) => props.theme['gray-300']};
`;

export const DeleteButton = styled.button`
  border: 0;
  background: ${(props) => props.theme['red-500']};
  color: ${(props) => props.theme.white};
`;
