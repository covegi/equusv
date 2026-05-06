import { createContext, ReactNode, useContext, useState } from "react"

type PassportModalContextType = {
    visible: boolean,
    setVisible: () => void
}

const PassportModalContext = createContext({
    visible: false,
    setVisible: (visible: boolean) => {}
})

export const PassportModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState<boolean>(false)

    return (
        <PassportModalContext.Provider value={{ visible, setVisible }}>
            {children}
        </PassportModalContext.Provider>
    )
}

export const usePassportModal = () => useContext(PassportModalContext)