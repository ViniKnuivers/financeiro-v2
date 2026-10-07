import styled from 'styled-components';

export const ToastBox = styled.div<{ $visible: boolean }>`
  position: fixed;
  left: 50%;
  bottom: calc(1.5rem + env(safe-area-inset-bottom));
  transform: translate(-50%, ${(props) => (props.$visible ? '0' : '150%')});
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition:
    transform 0.2s,
    opacity 0.2s;
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};

  width: max-content;
  max-width: calc(100vw - 2rem);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  background: ${(props) => props.theme['gray-600']};
  color: ${(props) => props.theme['gray-100']};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button {
    border: 0;
    background: transparent;
    color: ${(props) => props.theme['purple-300']};
    font-weight: bold;
    white-space: nowrap;
  }
`;
