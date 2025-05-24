"use client";
import { createContext, useContext, useState } from "react";

const DnDContext = createContext<
  [string | null, (type: string | null) => void]
>([null, () => void 0]);

export const DnDProvider = ({ children }: { children: React.ReactNode }) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
