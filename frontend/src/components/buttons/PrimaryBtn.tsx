import { ReactNode } from 'react'
import styles from './PrimaryBtn.module.css'

export default function PrimaryBtn({ children }: {children: ReactNode }) {
    return (
            <button className={styles.btn}>{children}</button>
    )
}