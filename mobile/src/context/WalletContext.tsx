import { createContext, useContext, useState } from "react"
import type { Wallet } from '@bsv/wallet-toolbox'

type WalletContextType = {
    wallet: Wallet | null,
    setWallet: (wallet: Wallet) => void
}  

const WalletContext = createContext<WalletContextType>({
    wallet: null,
    setWallet: (wallet: Wallet) => {}
})

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [wallet, setWallet] = useState<Wallet | null>(null)

    return (
        <WalletContext.Provider value={{ wallet, setWallet }}>
            { children }
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext) 