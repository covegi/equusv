import styles from './Header.module.css'
import logo from '../../../assets/images/equus-app-icon.png'
import PrimaryBtn from '../buttons/PrimaryBtn'
import SecondaryBtn from '../buttons/SecondaryBtn'
import { AiOutlineMenu } from "react-icons/ai";

export default function Header() {
    return (
        <header className={styles.outerContainer}>
           <div className={styles.innerContainer}>
                <div>
                    <img src={logo} className={styles.img} alt='EquusV' />
                </div>
                <nav className={styles.menuContainer}>
                    <a href="#" className={styles.menuItem}>Så funkar det</a>
                    <a href="#" className={styles.menuItem}>Alla runt hästen</a>
                    <a href="#" className={styles.menuItem}>Under huven</a>
                    <a href="#" className={styles.menuItem}>Kontakt</a>
                </nav>
                <div className={styles.btnContainer}>
                    <SecondaryBtn>Anslut arkiv</SecondaryBtn>
                    <PrimaryBtn>Skapa nytt arkiv</PrimaryBtn>
                </div>
                <AiOutlineMenu className={styles.hamburgerMenu}/>
           </div>
        </header>
    )
}