import React, { createContext, useContext, useMemo, useState } from 'react';

type Stage = 'none' | 'active' | 'canceled';

type EntitlementValue = {
  stage: Stage;
  active: boolean;
  loading: boolean;
  setStage: (s: Stage) => void;
};

const Ctx = createContext<EntitlementValue>({ stage: 'none', active: false, loading: false, setStage: () => {} });

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>('none');

  const value = useMemo<EntitlementValue>(() => ({
    stage,
    active: stage === 'active',
    loading: false,
    setStage,
  }), [stage]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEntitlement() {
  return useContext(Ctx);
}
