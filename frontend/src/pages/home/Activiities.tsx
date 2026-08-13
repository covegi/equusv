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
            verifier: [{ title: 'Avelsförbund', verified: true }],
            fields: ['Namn', 'Ras', 'Född', 'Kön', 'Färg', 'UELN', 'Chipnr', 'Ägare', 'Ort', 'Utfärdare', 'Utfärdat', 'Livsmedelskedjan'],
            mandatory: true,
            active: true,
            url: '',
            related: ['Chipmärkning', 'Konturdiagram']
        },
        {
            category: 'IDENTITET',
            name: 'Chipmärkning',
            description: 'Registrering av mikrochip med unikt chipnummer och utförare.',
            creator: ['ID-kontrollant', 'Veterinär'],
            verifier: [{ name: '', title: 'ID-kontrollant', verified: true }, { name: '', title: 'Veterinär', verified: true }],
            fields: ['Chipnummer', 'Datum', 'Utförare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Konturdiagram',
            description: 'Visuellt signalementsdiagram för identifiering av hästen.',
            creator: ['ID-kontrollant', 'Veterinär'],
            verifier: [{ name: '', title: 'ID-kontrollant', verified: true }, { name: '', title: 'Veterinär', verified: true }],
            fields: ['Konturdiagram', 'Datum', 'Utförare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Stall',
            description: 'Koppling till registrerad anläggning med JBV-anläggningsnummer.',
            creator: ['Stallägare'],
            verifier: [{ title: 'Jordbruksverket', verified: true }],
            fields: ['Anläggningsnummer', 'Stallnamn', 'Adress', 'Djurart', 'Status'],
            mandatory: true,
            active: false,
            url: '',
        },
        {
            category: 'IDENTITET',
            name: 'Position',
            description: 'Hästens aktuella plats. Skapas vid varje förflyttning och ger en komplett rörelsehistorik för smittspårning.',
            creator: ['Hästägare', 'Medryttare', 'Fodervärd'],
            verifier: null,
            fields: ['Anläggningsnummer', 'Platsnamn', 'Plats', 'Adress', 'Koordinater', 'Datum', 'Incheckad av'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Ägare',
            description: 'Registrerad ägare av hästen.',
            creator: ['Hästägare'],
            verifier: [{ title: 'Hästägare', verified: false }],
            fields: ['Nuvarande ägare', 'IdentityKey', 'Överlåtelsedatum'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Fodervärd',
            description: 'Registrering av fodervärd med tidsperiod, ansvar och villkor.',
            creator: ['Hästägare'],
            verifier: [{ title: 'Hästägare', verified: false }],
            fields: ['Fodervärd', 'Tidsperiod', 'Ansvar', 'Villkor'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'IDENTITET',
            name: 'Livsmedelsstatus',
            description: 'Hästägarens beslut om hästen ingår i livsmedelskedjan eller ej.',
            creator: ['Hästägare'],
            verifier: [{ title: 'Hästägare', verified: false }],
            fields: ['Status', 'Datum', 'Hästägarens beslut'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Veterinärbesök',
            description: 'Journalföring av veterinärbesök med koppling till anläggning.',
            creator: ['Veterinär'],
            verifier: [{ title: 'Veterinär', verified: true }],
            fields: ['Datum', 'Veterinär', 'Anläggningsnummer', 'UELN'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Vaccination',
            description: 'Vaccinationsjournal med preparat, batchnummer och veterinärens signatur.',
            creator: ['Veterinär'],
            verifier: [{ title: 'Veterinär', verified: true }],
            fields: ['Vaccin-typ', 'Batchnr', 'Datum', 'Nästa dos', 'Karens', 'Ref. besök'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Medicinering',
            description: 'Registrerat läkemedel med dos, karenstid och koppling till livsmedelskedjan.',
            creator: ['Veterinär'],
            verifier: [{ title: 'Veterinär', verified: true }],
            fields: ['Läkemedel', 'Dos', 'Karenstid', 'Livsmedelskedjan', 'Ref. besök'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Hovslagare',
            description: 'Journalföring av verkning och skoning utförd av hovslagare.',
            creator: ['Godkänd hovslagare', 'Hovslagare'],
            verifier: [{ title: 'Godkänd hovslagare', verified: true }, { title: 'Hovslagare', verified: false }],
            fields: ['Datum', 'Hovslagare', 'Anläggningsnummer', 'Typ'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Tandvård',
            description: 'Journalföring av tandbehandling utförd av hästtandvårdare.',
            creator: ['Hästtandvårdare'],
            verifier: [{ title: 'Hästtandvårdare', verified: false }],
            fields: ['Datum', 'Veterinär', 'Anläggningsnummer', 'Behandlingstyp'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'HÄLSA',
            name: 'Fysioterapi',
            description: 'Behandlingsjournal från legitimerad fysioterapeut.',
            creator: ['Godkänd fysioterapeut', 'Fysioterapeut'],
            verifier: [{ title: 'Godkänd fysioterapeut', verified: true }, { title: 'Fysioterapeut', verified: false }],
            fields: ['Datum', 'Fysioterapeut', 'Anläggningsnummer', 'Behandlingstyp'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRÄNING',
            name: 'Träningspass',
            description: 'Loggad träningssession med typ, längd och noteringar.',
            creator: ['Hästägare', 'Fodervärd'],
            verifier: null,
            fields: ['Datum', 'Typ', 'Längd', 'Noteringar'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'TRÄNING',
            name: 'Medryttarpass',
            description: 'Registrerad medryttare med behörighet att rida och träna hästen.',
            creator: ['Medryttare'],
            verifier: null,
            fields: ['Medryttare', 'Tidsperiod', 'Behörighet', 'Datum'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'TRANSPORT',
            name: 'Hälsointyg',
            description: 'Officiellt hälsointyg för transport inom EU, giltigt i 10 dagar.',
            creator: ['Officiell veterinär'],
            verifier: [{ title: 'Officiell veterinär', verified: true }],
            fields: ['Datum', 'Giltighetstid', 'Destination', 'Off. veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRANSPORT',
            name: 'DOCOM',
            description: 'Handelsdokument för transport inom Norden.',
            creator: ['Officiell veterinär'],
            verifier: [{ title: 'Officiell veterinär', verified: true }],
            fields: ['Datum', 'Destination', 'Officiell veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'TRANSPORT',
            name: 'Export',
            description: 'Exportdokumentation för transport utanför EU.',
            creator: ['Officiell veterinär'],
            verifier: [{ title: 'Officiell veterinär', verified: true }],
            fields: ['Datum', 'Destination', 'Officiell veterinär'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPÅRNING',
            name: 'Misstanke om smitta',
            description: 'Akut anmälan vid misstänkt epizooti med omedelbar anmälningsplikt.',
            creator: ['Veterinär', 'Smittskyddsveterinär'],
            verifier: [{ title: 'Smittskyddsveterinär', verified: true }],
            fields: ['Datum', 'Misstänkt sjukdom', 'Anläggningsnummer', 'UELN'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPÅRNING',
            name: 'Bekräftad smitta',
            description: 'Laboratoriebekräftad diagnos kopplad till ursprunglig misstanke.',
            creator: ['Smittskyddsveterinär'],
            verifier: [{ title: 'Smittskyddsveterinär', verified: true }],
            fields: ['Datum', 'Bekräftad sjukdom', 'Laboratoriesvar', 'Ref. misstanke'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPÅRNING',
            name: 'Restriktion',
            description: 'Geografiskt förflyttningsförbud vid konstaterat smittutbrott.',
            creator: ['Smittskyddsveterinär'],
            verifier: [{ title: 'Smittskyddsveterinär', verified: true }],
            fields: ['Datum', 'Sjukdom', 'Geografiskt område', 'Restriktionstyp'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'SMITTSPÅRNING',
            name: 'Friskförklaring',
            description: 'Hävning av restriktion efter godkänd smittfrihet.',
            creator: ['Smittskyddsveterinär'],
            verifier: [{ title: 'Smittskyddsveterinär', verified: true }],
            fields: ['Datum', 'Sjukdom', 'Geografiskt område', 'Ref. restriktion'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'Betäckning',
            description: 'Registrerad betäckning med uppgifter om hingst, metod och hingsthållare.',
            creator: ['Hästägare'],
            verifier: [{ title: 'Avelsförbund', verified: true }],
            fields: ['Datum', 'Hingst', 'Sto', 'Metod', 'Hingsthållare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'Dräktighetsresultat',
            description: 'Bekräftelse av dräktighet kopplad till registrerad betäckning.',
            creator: ['Veterinär'],
            verifier: [{ title: 'Veterinär', verified: true }],
            fields: ['Datum', 'Resultat', 'Ref. betäckning'],
            mandatory: false,
            active: false,
            url: ''
        },
        {
            category: 'AVEL',
            name: 'DNA-typning',
            description: 'Obligatorisk DNA-verifiering vid nyregistrering av häst.',
            creator: ['Veterinär', 'ID-kontrollant'],
            verifier: [{ title: 'Avelsförbund', verified: true }],
            fields: ['Datum', 'Provtagare', 'Laboratorium', 'Resultat', 'Ref. föl'],
            mandatory: true,
            active: false,
            url: ''
        },
        // {
        //     category: 'TÄVLING',
        //     name: 'Tävlingslicens',
        //     description: 'Aktiv tävlingslicens utfärdad av tävlingsorganisation.',
        //     creator: ['Hästägare'],
        //     verifier: [{ title: 'Avelsförbund', verified: true }],
        //     fields: ['Datum', 'Giltighetstid', 'Organisation', 'Licenstyp'],
        //     mandatory: false,
        //     active: false,
        //     url: ''
        // },
        // {
        //     category: 'TÄVLING',
        //     name: 'Veterinärbesiktning',
        //     description: 'Obligatorisk veterinärkontroll före tävling.',
        //     creator: ['Hästägare'],
        //     verifier: [{ title: 'Avelsförbund', verified: true }],
        //     fields: ['Datum', 'Tävling', 'Veterinär', 'Resultat'],
        //     mandatory: true,
        //     active: false,
        //     url: ''
        // },
        // {
        //     category: 'TÄVLING',
        //     name: 'Tävlingsresultat',
        //     description: 'Officiellt resultat med klass, placering och poäng.',
        //     creator: ['Hästägare'],
        //     verifier: [{ title: 'Avelsförbund', verified: true }],
        //     fields: ['Datum', 'Tävling', 'Klass', 'Placering', 'Poäng'],
        //     mandatory: false,
        //     active: false,
        //     url: ''
        // },
        {
            category: 'LIVSCYKEL',
            name: 'Avlivning',
            description: 'Registrering av avlivning med orsak, metod och veterinärintyg.',
            creator: ['Hästägare', 'Veterinär'],
            verifier: [{ title: 'Veterinär', verified: true }],
            fields: ['Datum', 'Plats', 'Orsak', 'Metod', 'Utförare'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'LIVSCYKEL',
            name: 'Slakt',
            description: 'Registrerad slakt vid godkänt slakteri eller nödslakt på plats.',
            creator: ['Officiell veterinär'],
            verifier: [{ title: 'Officiell veterinär', verified: true }],
            fields: ['Datum', 'Slakteri', 'UELN', 'Typ', 'Plats'],
            mandatory: true,
            active: false,
            url: ''
        },
        {
            category: 'LIVSCYKEL',
            name: 'Passmakulering',
            description: 'Makulering av hästpass inom 30 dagar efter dödsfall.',
            creator: ['Hästägare'],
            verifier: [{ title: 'Avelsförbund', verified: true }],
            fields: ['Datum', 'Dödsorsak', 'Ref. avlivning/slakt'],
            mandatory: true,
            active: false,
            url: ''
        },  
    ]

    const categories = ['IDENTITET', 'HÄLSA', 'TRÄNING', 'TRANSPORT', 'SMITTSPÅRNING', 'AVEL', 'LIVSCYKEL']

    return (
        <section className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.headerContainer}>
                    <p className={styles.eyelid}>ALLT OM HÄSTEN</p>
                    <h2 className={styles.sectionHeading}>En journalanteckning för varje händelse i hästens liv</h2>
                    <p className={styles.subText}>Varje anteckning i hästens liv blir en signerad och tidsstämplad post från vaccination och skoning till smittlarm, transport och avel. Specialister, myndigheter och hästägare arbetar tillsammans för att bygga en komplett och verifierbar journal för ökad effektivitet, trygghet och bättre samordning för alla inblandade.</p>
                </div>
            </div>

            {categories.map(cat => {
                const catTokens = activities.filter(t => t.category === cat)
                return (
                    <section key={cat}>
                        <div className={styles.category}>
                            <h2 className={styles.categoryLabel}>{cat}</h2>
                            <div className={styles.divider} />
                        </div>
                        <div className={styles.cardContainer}>
                            {catTokens.map(token => (
                        <ActivityCard key={token.name} activity={token} />
                        ))}
                        </div>
                    </section>
                )
            })}
        </section>
    )
}