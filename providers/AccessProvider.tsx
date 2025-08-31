import React, { createContext, useContext, useMemo, useState } from 'react';

type AccessValue = {
  hasAccess: boolean;
  setHasAccess: (next: boolean) => void;
};

const Ctx = createContext<AccessValue>({ hasAccess: false, setHasAccess: () => {} });

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  const value = useMemo<AccessValue>(() => ({ hasAccess, setHasAccess }), [hasAccess]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccess() {
  return useContext(Ctx);
}
