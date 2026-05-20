import { createContext, useContext, useState } from "react"

type PassportModalContextType = {
    visible: boolean,
    setVisible: (visible: boolean) => void
}

const PassportModalContext = createContext<PassportModalContextType>({
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