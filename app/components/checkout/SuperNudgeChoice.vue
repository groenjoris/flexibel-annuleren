<script setup lang="ts">
// "Yvette's Super Nudge": forced choice als vergelijking van twee kaarten
// met daarboven een geruststellingsbanner (social proof). Niets is
// voorgeselecteerd; de ouder houdt de CTA inactief tot er gekozen is.
import type { CancelChoice } from '~/data/cancellation'

// mobile: mobiele layout (blokken onder elkaar, kale usp-iconen, klein
// schild vóór de titel). De mobiele site rendert in een smalle kolom maar
// op desktop-vensterbreedte, dus dit wordt via een prop gestuurd i.p.v.
// een viewport-media-query.
defineProps<{ modelValue: CancelChoice; mobile?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: CancelChoice] }>()

// Sub-variant (switcher in de top nav): 'a' = groene banner (default),
// 'b' = neutrale banner zonder groene achtergrond.
const nudgeVariant = useState<'a' | 'b'>('nudge-variant', () => 'a')

// Variabele annuleerdatum: 2 dagen voor de gekozen aankomstdatum uit de
// kalenderstap; zonder keuze valt hij terug op de vaste deal-datum
// (di 20 mei 2026 -> 18 mei 2026).
const journeyDay = useState<{
  price: number
  checkInYmd?: { year: number; month: number; day: number }
} | null>('journey-day', () => null)
const MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const cancelUntil = computed(() => {
  const ymd = journeyDay.value?.checkInYmd ?? { year: 2026, month: 4, day: 20 }
  const d = new Date(ymd.year, ymd.month, ymd.day - 2)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
})
</script>

<template>
  <section class="card sn" :class="{ 'sn--plain': nudgeVariant === 'b', 'sn--mobile': mobile }">
    <!-- Banner: social proof + uitleg -->
    <div class="sn__banner">
      <h2 class="sn__bannertitle">Boek met een gerust gevoel</h2>
      <div class="sn__bannerrow">
        <svg class="sn__bannericon" width="72" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5l7.5 3v5.5c0 4.8-3.2 8.6-7.5 10-4.3-1.4-7.5-5.2-7.5-10V5.5l7.5-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M8.5 12l2.4 2.4 4.6-4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="sn__bannertext">
          <p class="sn__bannerlead">
            <span class="sn__green">Meer dan 60%</span> van onze gasten kiest voor Flexibel Annuleren.
          </p>
          <p class="sn__bannerbody">
            Voor slechts €15 per kamer boek je met extra zekerheid. Zo kun je je boeking
            tot 2 dagen voor aankomst annuleren of wijzigen en ontvang je de
            arrangementskosten terug.
          </p>
        </div>
      </div>
    </div>

    <!-- Vergelijkingskaarten -->
    <div class="sn__cards">
      <!-- Flexibel annuleren (genudged) -->
      <button
        type="button"
        class="sn__card sn__card--flex"
        :class="{ 'sn__card--on': modelValue === 'flexible' }"
        @click="emit('update:modelValue', 'flexible')"
      >
        <span class="sn__cardhead">
          <span class="sn__iconcircle sn__iconcircle--green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l6.5 2.6v4.8c0 4.1-2.7 7.4-6.5 8.6-3.8-1.2-6.5-4.5-6.5-8.6V5.6L12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              <path d="M9 11.5l2.1 2.1 3.9-4.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="sn__headmain">
            <span class="sn__titlerow">
              <span class="sn__cardtitle">Flexibel annuleren</span>
              <span class="sn__badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7L12 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>
                Aanbevolen
              </span>
            </span>
            <span class="sn__price">Voor slechts <strong class="sn__green">€15</strong> per kamer</span>
          </span>
        </span>

        <hr class="sn__hr" />

        <span class="sn__benefits">
          <span class="sn__benefit">
            <span class="sn__iconcircle sn__iconcircle--soft">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="5.5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </span>
            <span class="sn__benefittext">
              <span class="sn__benefittitle">Tot {{ cancelUntil }} annuleren</span>
              <span class="sn__benefitsub">Kosteloos je boeking wijzigen en/of annuleren.</span>
            </span>
          </span>
          <span class="sn__benefit">
            <span class="sn__iconcircle sn__iconcircle--soft">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17.5 7A6.5 6.5 0 1 0 17.5 17M5 10.5h9M5 13.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </span>
            <span class="sn__benefittext">
              <span class="sn__benefittitle">Arrangementskosten terug</span>
              <span class="sn__benefitsub">Je ontvangt de arrangementskosten retour.</span>
            </span>
          </span>
          <span class="sn__benefit">
            <span class="sn__iconcircle sn__iconcircle--soft">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l6.5 2.6v4.8c0 4.1-2.7 7.4-6.5 8.6-3.8-1.2-6.5-4.5-6.5-8.6V5.6L12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
            </span>
            <span class="sn__benefittext">
              <span class="sn__benefittitle">Extra zekerheid</span>
              <span class="sn__benefitsub">Ook handig als je plannen onverwacht wijzigen.</span>
            </span>
          </span>
        </span>

        <hr class="sn__hr" />

        <span class="sn__choose">
          <span class="sn__radio" :class="{ 'sn__radio--on': modelValue === 'flexible' }" />
          <span class="sn__choosetext">Kies deze optie</span>
          <!-- Mobiel: volledige-breedte knop i.p.v. radio -->
          <span class="sn__choosebtn sn__choosebtn--flex">
            <svg class="sn__choosecheck" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ modelValue === 'flexible' ? 'Flexibel gekozen' : 'Kies flexibel' }}
          </span>
        </span>
      </button>

      <!-- Niet-terugbetaalbaar -->
      <button
        type="button"
        class="sn__card"
        :class="{ 'sn__card--on': modelValue === 'nonrefundable' }"
        @click="emit('update:modelValue', 'nonrefundable')"
      >
        <span class="sn__cardhead">
          <span class="sn__iconcircle sn__iconcircle--grey">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12.6 3.5h6a1.9 1.9 0 0 1 1.9 1.9v6a1.9 1.9 0 0 1-.56 1.35l-7.2 7.2a1.9 1.9 0 0 1-2.68 0l-6-6a1.9 1.9 0 0 1 0-2.68l7.2-7.2a1.9 1.9 0 0 1 1.34-.57z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><circle cx="16.2" cy="7.8" r="1.2" fill="currentColor" /></svg>
          </span>
          <span class="sn__headmain">
            <span class="sn__cardtitle">Niet-terugbetaalbaar</span>
            <span class="sn__subtitle">Geen extra kosten</span>
          </span>
        </span>

        <hr class="sn__hr" />

        <span class="sn__benefits">
          <span class="sn__benefit">
            <span class="sn__iconcircle sn__iconcircle--check">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <span class="sn__benefittext">
              <span class="sn__benefittitle">Laagste prijs</span>
              <span class="sn__benefitsub">Je profiteert van het laagste tarief.</span>
            </span>
          </span>
          <span class="sn__benefit">
            <span class="sn__iconcircle sn__iconcircle--cross">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
            </span>
            <span class="sn__benefittext">
              <span class="sn__benefittitle">Geen terugbetaling</span>
              <span class="sn__benefitsub">Bij annuleren of het wijzigen van je boeking ontvang je geen bedrag retour.</span>
            </span>
          </span>
        </span>

        <hr class="sn__hr" />

        <span class="sn__choose">
          <span class="sn__radio" :class="{ 'sn__radio--on': modelValue === 'nonrefundable' }" />
          <span class="sn__choosetext">Kies deze optie</span>
          <!-- Mobiel: volledige-breedte knop i.p.v. radio -->
          <span class="sn__choosebtn">
            <svg class="sn__choosecheck" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ modelValue === 'nonrefundable' ? 'Niet-annuleerbaar gekozen' : 'Kies niet-annuleerbaar' }}
          </span>
        </span>
      </button>
    </div>

    <!-- Voetnoot -->
    <p class="sn__foot">
      <span class="sn__footinfo">
        <span class="sn__footicon">i</span>
        Je keuze geldt voor de gehele boeking.
      </span>
      <a class="sn__footlink" href="#">Meer informatie over onze annuleringsvoorwaarden</a>
    </p>
  </section>
</template>

<style scoped>
.sn {
  --sn-green: var(--c-via-green);
  --sn-green-soft: var(--c-green-soft);
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sn__green { color: var(--sn-green); }

/* Banner */
.sn__banner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--sn-green-soft);
  border-radius: var(--radius);
  padding: 28px 36px;
}
/* Sub-variant B: neutrale banner zonder groene achtergrond. Zonder de
   box lijnt de banner-inhoud uit met de kaartranden eronder. */
.sn--plain .sn__banner {
  background: none;
  border-radius: 0;
  padding: 0;
}
.sn__bannerrow {
  display: flex;
  align-items: center;
  gap: 28px;
}
.sn__bannericon {
  color: var(--sn-green);
  flex-shrink: 0;
}
.sn__bannertext {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
/* Even groot als de tweede titel ("Kies extra's", t-h1) */
.sn__bannertitle {
  font-size: var(--t-h1);
  line-height: var(--lh-h1);
  font-weight: var(--w-black);
}
.sn__bannerlead {
  font-size: var(--t-body);
  line-height: var(--lh-body);
  font-weight: var(--w-black);
}
.sn__bannerbody {
  font-size: var(--t-body);
  line-height: var(--lh-body);
}

/* Kaarten */
.sn__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;
  row-gap: 18px;
}
/* Subgrid: beide kaarten delen dezelfde rijhoogtes, zodat de dividers
   boven de usp's (en de radio-rij onderin) op gelijke hoogte staan. */
.sn__card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 5;
  align-items: start;
  text-align: left;
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 24px;
  cursor: pointer;
  font-family: inherit;
  /* Expliciete kleur: de kaart is een <button>, anders erven titels de
     blauwe UA-knopkleur (o.a. op iOS). */
  color: var(--c-via-black);
  transition: border-color 0.15s ease;
}
/* Zelfde borderpatroon als het bestaande keuzeblok: zonder selectie zijn
   beide kaarten gelijk (1px grijs); bij selectie 2px met padding-
   compensatie zodat de kaart niet verspringt. */
.sn__card--on {
  border-width: 2px;
  border-color: var(--c-via-black);
  padding: 23px;
}
.sn__card--flex.sn__card--on {
  border-color: var(--sn-green);
}
.sn__cardhead {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.sn__headmain {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
/* Titel + badge: gestapeld op desktop, naast elkaar op mobiel */
.sn__titlerow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.sn__cardtitle {
  font-size: var(--t-body-lg);
  line-height: var(--lh-body-lg);
  font-weight: var(--w-black);
}
.sn__subtitle {
  font-size: var(--t-body);
  color: var(--c-via-black);
}
.sn__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--sn-green-soft);
  color: var(--sn-green);
  font-size: var(--t-caption);
  font-weight: var(--w-black);
  border-radius: 999px;
  padding: 4px 12px;
}
.sn__price {
  color: var(--c-via-black);
  font-size: var(--t-body);
}
.sn__price strong {
  font-size: 1.25em;
  font-weight: var(--w-black);
}

/* Icoon-cirkels */
.sn__iconcircle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sn__iconcircle--green {
  background: var(--sn-green-soft);
  color: var(--sn-green);
}
.sn__iconcircle--grey {
  background: #efefef;
  color: var(--c-dark-grey);
}
.sn__iconcircle--soft {
  background: var(--sn-green-soft);
  color: var(--sn-green);
  width: 40px;
  height: 40px;
}
.sn__iconcircle--check {
  background: var(--sn-green-soft);
  color: var(--sn-green);
  width: 40px;
  height: 40px;
}
.sn__iconcircle--cross {
  background: #fbdddd;
  color: #d33c3c;
  width: 40px;
  height: 40px;
}

/* Voordelen-rijen */
.sn__hr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
  width: 100%;
}
.sn__benefits {
  display: flex;
  flex-direction: column;
  align-self: stretch;
}
.sn__benefit {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
}
.sn__benefit + .sn__benefit {
  border-top: 1px dashed var(--c-light-grey);
}
.sn__benefittext {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sn__benefittitle {
  font-size: var(--t-body);
  font-weight: var(--w-black);
}
.sn__benefitsub {
  font-size: var(--t-body);
  color: var(--c-via-black);
}

/* Radio */
.sn__choose {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sn__radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--c-dark-grey);
  flex-shrink: 0;
  position: relative;
}
.sn__radio--on {
  border-color: var(--sn-green);
}
.sn__radio--on::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--sn-green);
}
.sn__choosetext {
  font-size: var(--t-body);
  font-weight: var(--w-black);
}
/* Mobiele keuze-knop (desktop verborgen) */
.sn__choosebtn {
  display: none;
}

/* Voetnoot */
/* Tekst links uitgelijnd met het linkerblok, link rechts met het
   rechterblok erboven. */
.sn__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: var(--t-body);
}
.sn__footinfo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.sn__footicon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: var(--sn-green-soft);
  color: var(--sn-green);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--w-black);
  font-size: var(--t-body);
  font-style: italic;
  flex-shrink: 0;
}
.sn__footlink {
  color: var(--c-via-black);
  text-decoration: underline;
  font-weight: 500;
}
.sn__footlink:hover {
  color: var(--c-via-orange);
}

/* Mobiel: blokken onder elkaar (gestuurd via de `mobile` prop).
   Geen eigen padding/rand: de banner en kaarten lijnen zo uit met het
   "Kies extra's"-blok (dat op de pagina-marge van 20px staat). */
.sn--mobile {
  padding: 0;
  border: none;
  box-shadow: none;
}
.sn--mobile .sn__banner {
  gap: 12px;
  padding: 20px;
}
/* Banner zonder icoon: alleen de titel + tekst */
.sn--mobile .sn__bannericon { display: none; }
.sn--mobile .sn__bannerrow {
  gap: 14px;
}

/* Kaarten onder elkaar (subgrid vervalt) */
.sn--mobile .sn__cards {
  grid-template-columns: 1fr;
}
.sn--mobile .sn__card {
  grid-template-rows: none;
  grid-row: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 18px;
}

/* USP's: kale iconen zonder cirkel, boven uitgelijnd met de tekst */
.sn--mobile .sn__benefit {
  align-items: flex-start;
}
.sn--mobile .sn__benefit .sn__iconcircle {
  width: auto;
  height: auto;
  background: none;
  margin-top: 2px;
}

/* Neutrale banner blijft ook op mobiel zonder achtergrond */
.sn--mobile.sn--plain .sn__banner {
  padding: 0;
}

/* Mobiel: badge "Aanbevolen" naast de titel i.p.v. eronder */
.sn--mobile .sn__titlerow {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
/* Mobiel: kaart-iconen (schild / label) 1,5x zo groot */
.sn--mobile .sn__cardhead .sn__iconcircle {
  width: 66px;
  height: 66px;
}
.sn--mobile .sn__cardhead .sn__iconcircle svg {
  width: 34px;
  height: 34px;
}

/* Mobiel: radio vervangen door een volledige-breedte knop per kaart */
.sn--mobile .sn__radio,
.sn--mobile .sn__choosetext {
  display: none;
}
.sn--mobile .sn__choose {
  display: block;
}
.sn--mobile .sn__choosebtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  text-align: center;
  padding: 14px;
  border-radius: var(--radius);
  font-weight: var(--w-black);
  font-size: var(--t-body-lg);
  border: 1.5px solid var(--c-via-black);
  color: var(--c-via-black);
  background: var(--c-white);
}
.sn--mobile .sn__choosebtn--flex {
  background: var(--sn-green);
  border-color: var(--sn-green);
  color: var(--c-white);
}
/* Vinkje alleen tonen zodra de kaart gekozen is */
.sn__choosecheck {
  display: none;
  flex-shrink: 0;
}
.sn--mobile .sn__card--on .sn__choosecheck {
  display: inline-block;
}
/* Geselecteerde kaart: knop oogt 'disabled'/bevestigd (gedempt, met vinkje) */
.sn--mobile .sn__card--on .sn__choosebtn {
  background: var(--c-surface);
  border-color: var(--c-light-grey);
  color: var(--c-medium-grey);
  cursor: default;
}
.sn--mobile .sn__card--flex.sn__card--on .sn__choosebtn {
  background: var(--c-green-soft);
  border-color: var(--sn-green);
  color: var(--sn-green);
}
</style>
