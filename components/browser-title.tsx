'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const browserTitle = 'Crawe';

export function BrowserTitle() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = browserTitle;
  }, [pathname]);

  return null;
}
