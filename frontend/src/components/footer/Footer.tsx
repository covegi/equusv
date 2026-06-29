import styles from './Footer.module.css'
import logo from '../../../assets/images/equus-app-icon.png'

export default function Footer() {
    return (
        <footer className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.column}>
                    <img src={logo} className={styles.img} alt='EquusV' />
                    <p className={styles.text}>Säker infrastruktur för journalföring, spårbarhet och rapportering inom hästnäringen.</p>
                    <div className={styles.copyrightBlock}>
                        <span>© {new Date().getFullYear()}. Alla rättigheter förbehålls.</span>
                        <span>Powered by BSV Blockchain.</span>
                    </div>
                </div>
                <div className={styles.column}>
                    <div>
                        <p className={`${styles.text} ${styles.columnHeading}`}>UNDER HUVEN</p>
                    </div>
                    <div className={styles.linkColumn}>
                        <a href="#" className={styles.linkItem}>Tokenisering</a>
                        <a href="#" className={styles.linkItem}>Arkiv</a>
                        <a href="#" className={styles.linkItem}>Verifierad</a>
                        <a href="#" className={styles.linkItem}>Direktmeddelanden</a>
                        <a href="#" className={styles.linkItem}>Kryptering</a>
                    </div>
                </div>
                <div className={styles.column}>
                    <div>
                        <p className={`${styles.text} ${styles.columnHeading}`}>ALLA RUNT HÄSTEN</p>
                    </div>
                    <div className={styles.linkColumn}>
                        <a href="#" className={styles.linkItem}>Hästägare</a>
                        <a href="#" className={styles.linkItem}>Veterinär</a>
                        <a href="#" className={styles.linkItem}>Avelsorganisation</a>
                        <a href="#" className={styles.linkItem}>Stallägare</a>
                        <a href="#" className={styles.linkItem}>Smittskyddsveterinär</a>
                    </div>
                </div>
                <div className={styles.column}>
                    <div>
                        <p className={`${styles.text} ${styles.columnHeading}`}>ÖVRIGT</p>
                    </div>
                    <div className={styles.linkColumn}>
                        <a href="#" className={styles.linkItem}>Om oss</a>
                        <a href="#" className={styles.linkItem}>Kontakt</a>
                        <a href="#" className={styles.linkItem}>Användarvillkor</a>
                        <a href="#" className={styles.linkItem}>Integritetpolicy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}   