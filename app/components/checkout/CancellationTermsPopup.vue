<script setup lang="ts">
// Annuleringsvoorwaarden-popup (Yvette's Super Nudge): opent via de
// voetnoot-link onder het keuzeblok. Zelfde afmetingen en scrollgedrag
// als de "Lees meer"-popup van de dealpagina (960px × 72vh, alleen de
// body scrolt; mobiel 88vh met sticky header), maar zonder foto — de
// checkout heeft de fr-variant-tokens van die popup niet, dus de stijl
// staat hier zelfstandig.
const emit = defineEmits<{ close: [] }>()

const open = ref(true)
useBodyScrollLock().bindTo(open)
onBeforeUnmount(() => { open.value = false })
</script>

<template>
  <Teleport to="body">
    <div class="tp" role="dialog" aria-modal="true" aria-labelledby="tp-title" @click.self="emit('close')">
      <div class="tp__card" data-scroll-lock-allow="true">
        <div class="tp__header">
          <h2 id="tp-title" class="tp__title">Annuleringsvoorwaarden</h2>
          <button type="button" class="tp__close" aria-label="Sluiten" @click="emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="tp__body">
          <h3>4. Boeking wijzigen</h3>
          <p>
            4.1 Indien je bij de annuleringsvoorwaarden-opties gekozen hebt voor
            &lsquo;Flexibel annuleren&rsquo; kan je jouw boeking wijzigen door de boeking te
            annuleren en opnieuw te boeken. Een boeking kan geannuleerd worden via
            de link in de bevestigingsmail.
          </p>
          <p>
            4.2 Bij annulering gelden de annuleringsvoorwaarden van het arrangement.
            Deze vind je gedurende het boekingsproces onder &ldquo;Soepel annuleren&rdquo;,
            vooraf aan de betaling.
          </p>

          <h3>5. Boeking annuleren binnen de annuleringstermijn</h3>
          <p>
            5.1 Indien je bij de annuleringsvoorwaarden-opties gekozen hebt voor
            &lsquo;Flexibel annuleren&rsquo; kan je jouw boeking via de link in de
            bevestigingsemail annuleren. Je ontvangt dan jouw geld minus de
            boekingskosten terug, mits je annuleert binnen de annuleringstermijn.
            Ter compensatie van de boekingskosten ontvang je een unieke code die in
            te wisselen is bij een nieuwe boeking. Deze code is beperkt geldig.
          </p>
          <p>5.2 Voor de arrangementen gelden meestal een van de drie volgende annuleringstermijnen:</p>
          <ul>
            <li>annuleren kan tot 24 uur voor de dag van aankomst.</li>
            <li>annuleren kan tot 48 uur voor de dag van aankomst.</li>
            <li>annuleren kan tot 72 uur voor de dag van aankomst.</li>
          </ul>
          <p>
            In uitzonderlijke gevallen gelden afwijkende annuleringsvoorwaarden.
            Dit wordt vermeld gedurende het boekingsproces onder &ldquo;Soepel
            annuleren&rdquo;, vooraf aan de betaling.
          </p>
          <p>
            5.3 In het geval van meerdere kamers binnen 1 boeking, zijn
            deelannuleringen niet mogelijk. Wil je een deel van je boeking
            annuleren, annuleer dan de gehele boeking en boek het gewenste
            arrangement opnieuw.
          </p>
          <p>
            5.4 Wanneer je tijdens het boeken bij de annuleringsvoorwaarden-opties
            gekozen hebt voor een &lsquo;Niet-terugbetaalbaar tarief&rsquo; profiteer je van
            het goedkoopst beschikbare tarief op onze website. Je ontvangt bij
            wijzigen of annuleren geen bedrag retour.
          </p>

          <h3 class="tp__chapter">De juridische finesse</h3>

          <h3>6. Bij gebruik van een kortingscode(s) &amp; cadeaukaart(en)</h3>
          <p>6.1 Als je gebruik maakt van een ViaLuxury kortingscode gelden de volgende spelregels:</p>
          <ul>
            <li>De geldigheidsduur staat vermeld in de e-mail of op de voucher waarin de kortingscode vermeld wordt.</li>
            <li>Je mag de kortingscode niet verkopen.</li>
            <li>Er kan 1 kortingscode per boeking worden gebruikt.</li>
            <li>De kortingscode is niet geldig in combinatie met andere aanbiedingen.</li>
            <li>
              Een kortingscode kan een vast kortingsbedrag of een percentuele
              korting op het arrangementsbedrag bevatten. De totale korting wordt
              tijdens het boekingsproces als reductiebedrag op de kassabon
              weergegeven en is altijd van toepassing op het arrangementsbedrag,
              exclusief boekingskosten en eventuele extra&rsquo;s.
            </li>
            <li>
              Heb je een boeking geannuleerd waarbij een kortingscode is gebruikt
              bij betaling. Dan kan het voorkomen dat de geldigheid van de
              kortingscode bij de annulering vervalt. Dit is afhankelijk van de
              voorwaarden waaronder de originele kortingscode is afgegeven.
            </li>
            <li>De kortingscode is niet geldig voor &lsquo;Kies je eigen verblijfsduur&rsquo; arrangementen.</li>
          </ul>
          <p>6.2 Als je gebruik maakt van een ViaLuxury cadeaukaart gelden de volgende spelregels:</p>
          <ul>
            <li>De ViaLuxury cadeaukaart is twee jaar geldig vanaf de dag van de aankoop.</li>
            <li>De ViaLuxury cadeaukaart is niet inwisselbaar voor geld.</li>
            <li>Cadeaukaarten kunnen niet geretourneerd worden.</li>
            <li>Je mag de cadeaukaart niet (door)verkopen, maar natuurlijk wel cadeau geven.</li>
            <li>Er kunnen meerdere cadeaukaarten per boeking worden gebruikt.</li>
            <li>Je kan gelijktijdig gebruik maken van een kortingscode en een cadeaukaart(en) voor de betaling van de boeking.</li>
            <li>
              Heb je een boeking geannuleerd die (voor een deel) is betaald met een
              ViaLuxury cadeaukaart? Dan krijg je een nieuwe ViaLuxury cadeaukaart
              per e-mail toegestuurd, nadat de annulering definitief is gemaakt.
              Het retourbedrag op de nieuwe cadeaukaart is conform de
              annuleringsvoorwaarden (zie art. 5).
            </li>
          </ul>
          <p>Zie <a href="#" @click.prevent>hier</a> voor de volledige cadeaukaart voorwaarden.</p>

          <h3>7. Gebruik van onze website</h3>
          <p>
            7.1 Door ons platform te gebruiken verklaar je 18 jaar of ouder te
            zijn. Daarnaast gebruik je onze website waarvoor deze bedoeld is: het
            boeken van luxe arrangementen en het kopen van producten. Je zult geen
            virussen versturen of inbreuk maken op de beveiliging van onze website.
          </p>

          <h3>8. Registratie</h3>
          <p>8.1 De gegevens die voor registratie gevraagd worden, worden naar waarheid ingevuld.</p>
          <p>
            8.2 Het gebruik en eventueel misbruik van je inloggegevens, komt voor
            eigen rekening en risico. ViaLuxury mag ervan uitgaan dat handelingen
            op de website verricht na registratie en invoering van inloggegevens,
            worden verricht door jou.
          </p>
          <p>
            8.3 Door registratie op ons platform ga je ermee akkoord dat je
            gegevens door ViaLuxury worden opgeslagen en door ViaLuxury mogen
            worden gebruikt voor het toezenden van aanbiedingen en nieuws van
            ViaLuxury. Je kunt je hiervoor te allen tijde afmelden door op de
            unsubscribe button te klikken in de e-mails.
          </p>

          <h3>9. Aansprakelijkheid</h3>
          <p>9.1 Wij zijn niet aansprakelijk voor:</p>
          <ul>
            <li>Directe, indirecte of gevolgschade die is ontstaan door gebruik van ons platform of voor, tijdens of na jouw verblijf in een van de hotels.</li>
            <li>Een tekortkoming in de nakoming van de overeenkomst tussen jou en het hotel.</li>
            <li>Directe, indirecte of gevolgschade die is ontstaan door gebruik van de betaaldienst van Online Payment Platform of Stripe.</li>
            <li>Kosten of prijsverhogingen die voortkomen uit wijzigingen in belastingen of btw, waaronder een eventuele verhoging van het btw-tarief voor hotelovernachtingen.</li>
          </ul>
          <p>
            9.2 Als wij, om wat voor reden dan ook, toch aansprakelijk zijn, dan is
            onze aansprakelijkheid beperkt tot maximaal 100% van de koopprijs van
            het door jou geboekte arrangement. Niets in deze voorwaarden zal de
            aansprakelijkheid van ViaLuxury uitsluiten of beperken, wanneer deze
            niet uitgesloten of beperkt kan worden onder toepasselijk recht.
          </p>

          <h3>10. Wijzigingen</h3>
          <p>10.1 Wij kunnen deze algemene voorwaarden wijzigen. Je vindt de meest recente versie op onze website.</p>

          <h3>11. Toepasselijk recht en bevoegde rechter</h3>
          <p>11.1 Op alle overeenkomsten tussen jou en ViaLuxury is Nederlands recht van toepassing. De Nederlandse rechter is bevoegd.</p>

          <h3>12. Overdracht van recht</h3>
          <p>12.1 Wij kunnen de rechten die voortvloeien uit de overeenkomst tussen jou en ViaLuxury overdragen in geval van een fusie of overname.</p>

          <p class="tp__colofon">
            Algemene Voorwaarden van ViaLuxury — handelsnaam van Advalley B.V. (KvK 34355881).
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tp {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
/* Zelfde maat als de deal-popup: 960px breed, 72vh hoog; header vast
   bovenin, alleen de body scrolt. */
.tp__card {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius);
  width: min(960px, calc(100vw - 32px));
  height: 72vh;
  max-width: calc(100vw - 32px);
  max-height: 72vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.tp__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  background: var(--c-white);
  border-bottom: 1px solid var(--c-light-grey);
}
.tp__title {
  font-size: 20px;
  font-weight: var(--w-black);
  min-width: 0;
}
.tp__close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-surface);
  color: var(--c-via-black);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.tp__close:hover {
  background: var(--c-light-grey);
}
.tp__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--c-via-black);
}
.tp__body h3 {
  font-size: var(--t-body-lg);
  font-weight: var(--w-black);
  margin: 20px 0 8px;
}
.tp__body h3:first-child {
  margin-top: 0;
}
/* Hoofdstukscheiding ("De juridische finesse") iets zwaarder aangezet */
.tp__body .tp__chapter {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--c-light-grey);
}
.tp__body p {
  margin: 0 0 12px;
}
.tp__body ul {
  margin: 0 0 12px;
  padding-left: 22px;
  list-style: disc;
}
.tp__body li {
  margin-bottom: 6px;
}
.tp__body a {
  color: var(--c-via-black);
  text-decoration: underline;
}
.tp__body a:hover {
  color: var(--c-via-orange);
}
.tp__colofon {
  margin-top: 24px;
  font-size: var(--t-caption);
  color: var(--c-grey);
}

/* Mobiel: zelfde gedrag als de deal-popup — de hele kaart scrolt, de
   header blijft sticky bovenin. */
@media (max-width: 800px) {
  .tp {
    padding: 16px;
  }
  .tp__card {
    display: block;
    width: 100%;
    height: auto;
    max-height: 88vh;
    overflow-y: auto;
  }
  .tp__header {
    position: sticky;
    top: 0;
    z-index: 5;
    border-radius: var(--radius) var(--radius) 0 0;
  }
  .tp__body {
    overflow: visible;
    padding: 20px;
  }
}
</style>
