declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): { render(el: any): void };
}
