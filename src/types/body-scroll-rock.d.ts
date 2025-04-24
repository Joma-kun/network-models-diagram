// src/types/body-scroll-lock.d.ts

// TypeScript declaration for body-scroll-lock module
declare module 'body-scroll-lock' {
    export function disableBodyScroll(targetElement: Element, options?: any): void;
    export function enableBodyScroll(targetElement: Element): void;
    export function clearAllBodyScrollLocks(): void;
  }
  