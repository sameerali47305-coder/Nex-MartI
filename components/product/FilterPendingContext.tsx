"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";

interface FilterPendingContextValue {
  isPending: boolean;
  startFilterTransition: (callback: () => void) => void;
}

const FilterPendingContext = createContext<FilterPendingContextValue | null>(null);

export function FilterPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <FilterPendingContext.Provider value={{ isPending, startFilterTransition: startTransition }}>
      {children}
    </FilterPendingContext.Provider>
  );
}

export function useFilterPending() {
  const ctx = useContext(FilterPendingContext);
  if (!ctx) throw new Error("useFilterPending must be used within FilterPendingProvider");
  return ctx;
}