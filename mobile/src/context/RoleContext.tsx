import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useWallet } from './WalletContext'
import { ROLES, type RoleId, type RoleDefinition } from '../constants/certificates'

export type RoleContextType = {
    activeRole: RoleId,
    setActiveRole: (roleId: RoleId) => void,
    availableRoles: RoleDefinition[] 
}

const RoleContext = createContext<RoleContextType>({
    activeRole: 'owner',
    setActiveRole: () => {},
    availableRoles: []
})

export const RoleProvider = ({ children }: { children: ReactNode }) => {
    const { wallet } = useWallet()
    const [activeRole, setActiveRole] = useState<RoleId>('owner')
    const [availableRoles, setAvailableRoles] = useState<RoleDefinition[]>([])

    useEffect(() => {
        if (!wallet) {
            setAvailableRoles([])
        }

        const loadRoles = async () => {
            setAvailableRoles(ROLES)
        }
        loadRoles()

    }, [wallet])

    return (
        <RoleContext.Provider value={{ activeRole, setActiveRole, availableRoles }}>
            {children}
        </RoleContext.Provider>
    )
}

export const useRole = () => useContext(RoleContext)