import styles from './Header.module.css'
import logo from '../../../assets/images/equus-app-icon.png'
import PrimaryBtn from '../buttons/PrimaryBtn'
import SecondaryBtn from '../buttons/SecondaryBtn'
import { AiOutlineMenu } from "react-icons/ai"
import { AiFillCheckCircle } from "react-icons/ai"


export default function Header() {
    return (
        <header className={styles.outerContainer}>
           <div className={styles.innerContainer}>
                <div>
                    <img src={logo} className={styles.img} alt='EquusV' />
                </div>
                <nav className={styles.menuContainer}>
                    <a href="#" className={styles.menuItem}>Så funkar det</a>
                    <a href="#" className={styles.menuItem}>Din häst din data</a>
                    <a href="#" className={styles.menuItem}>Alla runt hästen</a>
                    <a href="#" className={styles.menuItem}>Verifierad<span><AiFillCheckCircle className={styles.verifiedBadge} /></span></a>
                    <a href="#" className={styles.menuItem}>Vanliga frågor</a>
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