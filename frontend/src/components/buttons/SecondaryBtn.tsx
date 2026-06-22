import { ReactNode } from 'react'
import styles from './SecondaryBtn.module.css'

export default function SecondaryBtn({ children }: {children: ReactNode }) {
    return (
            <button className={styles.btn}>{children}</button>
    )
}