"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Site = "henrik" | "sweden" | "all";

interface SiteContextValue {
  site: Site;
  setSite: (site: Site) => void;
}

const SiteContext = createContext<SiteContextValue>({
  site: "henrik",
  setSite: () => {},
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site>("henrik");
  return (
    <SiteContext.Provider value={{ site, setSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}
