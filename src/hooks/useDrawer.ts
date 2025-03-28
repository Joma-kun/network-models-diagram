// src/hooks/useDrawer.ts
import { useCallback, useState } from 'react';

export const useDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpenDrawer = useCallback(() => {
    setIsOpen(true);
    // body のスクロールを無効化する
    document.body.classList.add('is-disabled-scroll');
  }, []);

  const onCloseDrawer = useCallback(() => {
    setIsOpen(false);
    // body のスクロールを有効化する
    document.body.classList.remove('is-disabled-scroll');
  }, []);

  return { isOpen, onOpenDrawer, onCloseDrawer };
};
