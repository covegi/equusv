import styles from './HeroSection.module.css'
import logo from '../../../assets/images/EquusV_Inter_Regular_transparent.png'
import example from '../../../assets/images/equusv_journal_example.png'
import PrimaryBtn from '../../components/buttons/PrimaryBtn'
import SecondaryBtn from '../../components/buttons/SecondaryBtn'

export default function HeroSection() {
    return (
        <div className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.textBlock}>
                    <img src={logo} className={styles.logo}/>
                    <p className={styles.tagline}>SANNINGEN OM DIN HÄST</p>
                    <p className={styles.slogan}>Hela hästens liv i en journal</p>
                    <p className={styles.punchline}>Enkel, privat och verifierbar</p>
                    <div className={styles.btnContainer}>
                        <PrimaryBtn>Skapa nytt arkiv</PrimaryBtn>
                        <SecondaryBtn>Så funkar det</SecondaryBtn>
                </div>
                </div>
                <div className={styles.imageBlock}>   
                    <img src={example} alt="EquusV Journal" className={styles.heroImg}/>
                </div>
                
            </div>
        </div>
    )
}