import '@testing-library/jest-dom/vitest';

// O jsdom não tem ResizeObserver (os gráficos do Recharts usam).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in globalThis)) globalThis.ResizeObserver = ResizeObserverStub;
