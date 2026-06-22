import styles from './index.module.css'
import Header from '../../components/header/Header.tsx'
import Footer from '../../components/footer/Footer.tsx'
import HeroSection from './HeroSection.tsx'

export default function Home() {
    return (
        <main className={styles.outerContainer}>
            <Header />
            <HeroSection />
            <Footer />
        </main>
    )
}