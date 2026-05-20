import { createContext, useContext, useState } from 'react'

type ActivitiesMenuContextType = {
    menuVisible: boolean,
    setMenuVisible: (visible: boolean) => void,
}

const ActivitiesMenuContext = createContext<ActivitiesMenuContextType>({
    menuVisible: false,
    setMenuVisible: (visible: boolean) => {},
})

export const ActivitiesMenuContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [menuVisible, setMenuVisible] = useState<boolean>(false)

    return (
        <ActivitiesMenuContext.Provider value={{ menuVisible, setMenuVisible }}>
            {children}
        </ActivitiesMenuContext.Provider>
    )
}

export const useActivitesMenu = () => useContext(ActivitiesMenuContext)