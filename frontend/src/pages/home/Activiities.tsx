import styles from './Activities.module.css'
import type { Activity } from '../../types/activity'
import ActivityCard from './ActivityCard'

export default function Aktivities() {

    const activities: Activity[] = [
        {
            category: 'IDENTITET',
            name: 'Hästpass',
            description: 'Digitalt pass med UELN, chipnummer, ras, färg och signalementsuppgifter.',
            creator: ['Hästägare'],
            verifier: { name: 'Avelsförbund', verified: true },
            fields: ['Namn', 'Ras', 'Född', 'Kön', 'Färg', 'UELN', 'Chipnr', 'Ägare', 'Ort', 'Utfärdare', 'Utfärdat', 'Livsmedelskedjan'],
            mandatory: true,
            active: true,
            url: '',
            related: ['Chipmärkning', 'Konturdiagram']
        },
        {
            category: 'TRÄNING',
            name: 'Träningspass',
            description: 'Loggad träningssession med typ, längd och noteringar.',
            verifier: { name: 'Hästägare', verified: false },
            fields: ['Datum', 'Typ', 'Längd', 'Noteringar'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Vaccination',
            description: 'Vaccinationsjournal med preparat, batchnummer och veterinärens signatur.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Vaccin-typ', 'Batchnr', 'Datum', 'Nästa dos', 'Karens', 'Ref. besök'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRANSPORT',
            name: 'Hälsointyg',
            description: 'Officiellt hälsointyg för transport inom EU, giltigt i 10 dagar.',
            verifier: { name: 'Jordbruksverket', title: 'Officiell veterinär', verified: true },
            fields: ['Datum', 'Giltighetstid', 'Destination', 'Off. veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'Betäckning',
            description: 'Registrerad betäckning med uppgifter om hingst, metod och hingsthållare.',
            verifier: { name: 'Svenska Hästavelsförbundet', verified: true },
            fields: ['Datum', 'Hingst', 'Sto', 'Metod', 'Hingsthållare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPRIDNING',
            name: 'Misstanke om smitta',
            description: 'Akut anmälan vid misstänkt epizooti med omedelbar anmälningsplikt.',
            verifier: { name: 'Jordbruksverket', verified: true },
            fields: ['Datum', 'Misstänkt sjukdom', 'Anläggningsnummer', 'UELN'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Ägarbyte',
            description: 'Överlåtelse av äganderätt med verifierad signatur från båda parter.',
            verifier: { name: 'Hästägare', verified: false },
            fields: ['Nuvarande ägare', 'IdentityKey', 'Överlåtelsedatum'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TÄVLING',
            name: 'Tävlingsresultat',
            description: 'Officiellt resultat med klass, placering och poäng.',
            verifier: { name: 'Svenska Ridsportförbundet', verified: true },
            fields: ['Datum', 'Tävling', 'Klass', 'Placering', 'Poäng'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Medicinering',
            description: 'Registrerat läkemedel med dos, karenstid och koppling till livsmedelskedjan.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Läkemedel', 'Dos', 'Karenstid', 'Livsmedelskedjan', 'Ref. besök'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'LIVSCYKEL',
            name: 'Slakt',
            description: 'Registrerad slakt vid godkänt slakteri.',
            verifier: { name: 'Livsmedelsverket', verified: true },
            fields: ['Datum', 'Slakteri', 'UELN'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Stallanknytning',
            description: 'Koppling till registrerad anläggning med JBV-anläggningsnummer.',
            verifier: { name: 'Jordbruksverket', verified: true },
            fields: ['Anläggningsnummer', 'Stallnamn', 'Adress', 'Datum'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Hovslagare',
            description: 'Journalföring av verkning och skoning utförd av hovslagare.',
            verifier: { name: 'Erik Lindqvist', title: 'Cert. hovslagare', verified: true },
            fields: ['Datum', 'Hovslagare', 'Anläggningsnummer', 'Typ'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRÄNING',
            name: 'Medryttarpass',
            description: 'Registrerad medryttare med behörighet att rida och träna hästen.',
            verifier: { name: 'Medryttare', verified: false },
            fields: ['Medryttare', 'Tidsperiod', 'Behörighet', 'Datum'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPRIDNING',
            name: 'Bekräftad smitta',
            description: 'Laboratoriebekräftad diagnos kopplad till ursprunglig misstanke.',
            verifier: { name: 'Jordbruksverket', verified: true },
            fields: ['Datum', 'Bekräftad sjukdom', 'Laboratoriesvar', 'Ref. misstanke'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'Registrering av föl',
            description: 'Nyregistrering av föl med UELN, härstamning och signalement.',
            verifier: { name: 'Svenska Hästavelsförbundet', verified: true },
            fields: ['Datum', 'UELN', 'Kön', 'Färg', 'Födelsedag', 'Mor', 'Far'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Veterinärbesök',
            description: 'Journalföring av veterinärbesök med koppling till anläggning.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Datum', 'Veterinär', 'Anläggningsnummer', 'UELN'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRANSPORT',
            name: 'DOCOM',
            description: 'Handelsdokument för transport inom Norden.',
            verifier: { name: 'Jordbruksverket', title: 'Officiell veterinär', verified: true },
            fields: ['Datum', 'Destination', 'Officiell veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Chipmärkning',
            description: 'Registrering av mikrochip med unikt chipnummer och utförare.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Chipnummer', 'Datum', 'Utförare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TÄVLING',
            name: 'Veterinärbesiktning',
            description: 'Obligatorisk veterinärkontroll före tävling.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Datum', 'Tävling', 'Veterinär', 'Resultat'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'LIVSCYKEL',
            name: 'Avlivning',
            description: 'Registrering av avlivning med orsak, metod och veterinärintyg.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Datum', 'Plats', 'Orsak', 'Metod', 'Utförare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Livsmedelsstatus',
            description: 'Hästägarens beslut om hästen ingår i livsmedelskedjan eller ej.',
            verifier: { name: 'Hästägare', verified: false },
            fields: ['Status', 'Datum', 'Hästägarens beslut'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Fysioterapi',
            description: 'Behandlingsjournal från legitimerad fysioterapeut.',
            verifier: { name: 'Maria Holm', title: 'Eq. fysioterapeut', verified: true },
            fields: ['Datum', 'Fysioterapeut', 'Anläggningsnummer', 'Behandlingstyp'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPRIDNING',
            name: 'Restriktion',
            description: 'Geografiskt förflyttningsförbud vid konstaterat smittutbrott.',
            verifier: { name: 'Jordbruksverket', verified: true },
            fields: ['Datum', 'Sjukdom', 'Geografiskt område', 'Restriktionstyp'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'DNA-typning',
            description: 'Obligatorisk DNA-verifiering vid nyregistrering av häst.',
            verifier: { name: 'SLU', title: 'Laboratorium', verified: true },
            fields: ['Datum', 'Provtagare', 'Laboratorium', 'Resultat', 'Ref. föl'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TÄVLING',
            name: 'Tävlingslicens',
            description: 'Aktiv tävlingslicens utfärdad av tävlingsorganisation.',
            verifier: { name: 'Svenska Ridsportförbundet', verified: true },
            fields: ['Datum', 'Giltighetstid', 'Organisation', 'Licenstyp'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Tandvård',
            description: 'Registrerad tandbehandling utförd av veterinär.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Datum', 'Veterinär', 'Anläggningsnummer', 'Behandlingstyp'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Konturdiagram',
            description: 'Visuellt signalementsdiagram för identifiering av hästen.',
            verifier: { name: 'Svenska Hästavelsförbundet', verified: true },
            fields: ['Konturdiagram', 'Datum', 'Utförare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRANSPORT',
            name: 'Export',
            description: 'Exportdokumentation för transport utanför EU.',
            verifier: { name: 'Jordbruksverket', title: 'Officiell veterinär', verified: true },
            fields: ['Datum', 'Destination', 'Officiell veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'LIVSCYKEL',
            name: 'Nödslakt',
            description: 'Akut slakt på plats godkänd av Livsmedelsverket.',
            verifier: { name: 'Livsmedelsverket', title: 'Officiell veterinär', verified: true },
            fields: ['Datum', 'Plats', 'Orsak', 'Officiell veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'Dräktighetsresultat',
            description: 'Bekräftelse av dräktighet kopplad till registrerad betäckning.',
            verifier: { name: 'Anna Bengtsson', title: 'Leg. veterinär', verified: true },
            fields: ['Datum', 'Resultat', 'Ref. betäckning'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Fodervärd',
            description: 'Registrering av fodervärd med tidsperiod, ansvar och villkor.',
            verifier: { name: 'Hästägare', verified: false },
            fields: ['Fodervärd', 'Tidsperiod', 'Ansvar', 'Villkor'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPRIDNING',
            name: 'Friskförklaring',
            description: 'Hävning av restriktion efter godkänd smittfrihet.',
            verifier: { name: 'Jordbruksverket', verified: true },
            fields: ['Datum', 'Sjukdom', 'Geografiskt område', 'Ref. restriktion'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'LIVSCYKEL',
            name: 'Passmakulering',
            description: 'Makulering av hästpass inom 30 dagar efter dödsfall.',
            verifier: { name: 'Svenska Hästavelsförbundet', verified: true },
            fields: ['Datum', 'Dödsorsak', 'Ref. avlivning/slakt'],
            mandatory: true,
            active: false,
            url: ''
        },
    ]

    return (
        <section className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.headerContainer}>
                    <p className={styles.eyelid}>ALLT OM HÄSTEN</p>
                    <h2 className={styles.sectionHeading}>En journalanteckning för varje händelse i hästens liv</h2>
                    <p className={styles.subText}>Varje anteckning i hästens liv blir en signerad och tidsstämplad post från vaccination och skoning till smittlarm, transport och avel. Specialister, myndigheter och hästägare arbetar tillsammans för att bygga en komplett och verifierbar journal för ökad effektivitet, trygghet och bättre samordning för alla inblandade.</p>
                </div>
            </div>
            <div className={styles.cardContainer}>
                {activities.map((act) => (
                    <ActivityCard key={act.name} activity={act} />
                ))}
            </div>
            
        </section>
    )
}