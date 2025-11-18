// context/AccountContext.tsx
import { createContext, useContext, useState } from "react";
import {
  CavosWallet,
} from "cavos-service-native";

type AccountContextType = {
  account: CavosWallet | null;       // Wallet address or account id
  setAccount: (acc: CavosWallet | null) => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<CavosWallet | null>(null);

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used inside an AccountProvider");
  }
  return context;
}
