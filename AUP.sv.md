# Riktlinjer för godtagbar användning — UHRP-lagringsserver

**Server:** uhrp.equusv.com
**Operatör:** Covegi AB
**Senast uppdaterad:** 2026-08-15

## 1. Syfte

Dessa riktlinjer reglerar användningen av denna UHRP-server (Universal Hash Resolution Protocol). Servern lagrar och tillhandahåller filer som laddas upp av autentiserade användare av plattformen.

## 2. Tillåten användning

Servern får användas för att lagra innehåll som:

- Laddas upp av en autentiserad identitet enligt plattformens normala uppladdningsflöde
- Inte gör intrång i tredje parts rättigheter
- Följer begränsningarna för förbjuden användning nedan

## 3. Förbjuden användning

Servern får inte användas för att lagra innehåll som:

- Gör intrång i upphovsrätt, varumärke eller annan immateriell rättighet
- Är olagligt enligt svensk lag eller EU-rätt
- Innehåller skadlig kod eller är avsett att underlätta obehörig åtkomst till ett system
- Kränker någon enskild persons integritet eller rätt till personuppgifter

## 4. Ansvar och spårbarhet

Varje fil som laddas upp till denna server kopplas kryptografiskt till identitetsnyckeln hos den part som laddar upp filen, vid tidpunkten för uppladdningen. Denna koppling finns inbäddad i annonseringstoken on-chain (`uploader_identity_key`) och kan inte ändras i efterhand. Detta gör det möjligt för operatören att identifiera källan till en given uppladdning vid en berättigad anmälan eller ett rättsligt krav.

## 5. Kryptering av innehåll och integritet

Varje uppladdad fil krypteras till ägarens identitetsnyckel vid uppladdningstillfället. Endast ägaren kan dekryptera och se filens innehåll — servern lagrar krypterade data och kan inte inspektera vad den lagrar. Detta innebär att tredje part inte kan upptäcka en policyöverträdelse genom att av misstag stöta på innehållet, eftersom det inte är synligt för någon annan än ägaren. Efterlevnad av dessa riktlinjer bygger därför på anmälningar från ägaren, från parter som ägaren delat åtkomst med, eller via andra legitima kanaler — inte på att utomstående upptäcker innehållet visuellt.

## 6. Anmäla en överträdelse

Den som anser att innehåll som lagras på denna server bryter mot dessa riktlinjer, eller gör intrång i dennes rättigheter, kan anmäla detta till operatören på: [kontakt-e-post läggs till].

En anmälan bör innehålla:
- UHRP-URL:en för det aktuella innehållet
- En beskrivning av den påstådda överträdelsen
- Kontaktuppgifter till den anmälande parten

## 7. Borttagningsprocess (takedown)

Vid mottagande av en berättigad anmälan, eller på operatörens eget initiativ när en överträdelse är uppenbar, kommer operatören att:

1. Återkalla on-chain-annonseringen för det aktuella innehållet, så att det inte längre går att hitta via UHRP-nätverket
2. Ta bort den underliggande filen från serverns lagring
3. Föra register över borttagningsåtgärden för efterlevnadsändamål

Borttagningsåtgärder utförs av operatören via en administratörsautentiserad endpoint. Endast identiteter som uttryckligen godkänts av operatören får utföra en borttagning.

UHRP är ett federerat lagringsprotokoll: andra oberoende operatörer kan lagra och annonsera kopior av samma innehåll utan denna servers inblandning. En borttagning på denna server återkallar denna servers annonsering och tar bort denna servers kopia; den påverkar inte kopior som oberoende lagras någon annanstans i nätverket av andra operatörer.

## 8. Lagringstid och tillgänglighet

Filer lagras under den lagringsperiod som anges vid uppladdningstillfället. Operatören gör rimliga ansträngningar för att säkerställa att innehållet förblir tillgängligt under sin angivna lagringsperiod, med förbehåll för dessa riktlinjer och tillämplig lag.

## 9. Ändringar av dessa riktlinjer

Dessa riktlinjer kan komma att uppdateras allteftersom tjänsten utvecklas. Väsentliga ändringar återspeglas i datumet "Senast uppdaterad" ovan.
