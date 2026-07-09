<script setup lang="ts">
// Journey-checkout op basis van concept 1e (eigen kopie: JourneyRoomTable),
// bereikt via "Ik ga boeken" op de dealpagina of via de kalenderstap.
// Variant 3: room table zonder rechterkolom + sticky sidebar.
import { journeyKey, journeyLabel, JOURNEY_WAS_FACTOR } from '~/data/journeys'
import { hotel, trustpilot, rooms as roomsData, dealName, includes, pricing } from '~/data/deal'
import type { CancelChoice } from '~/data/cancellation'
import { useStickyFit } from '~/composables/useStickyFit'

const route = useRoute()
const jv = computed(() => journeyKey(route.params.v))
const label = computed(() => journeyLabel(jv.value))

// V3: kamer-selectie uit de tabel drijft de sidebar-prijzen (stap-0 layout).
interface SelRow {
  baseId: string
  rateKey: 'nonrefundable' | 'flexible'
  price: number
  priceWas: number
  quantity: number
}
const BOOKING_FEE = 27.5
const tableSelection = ref<SelRow[]>([])
const roomsSel = computed(() => tableSelection.value.reduce((s, r) => s + r.quantity, 0))
const roomsPrice = computed(() => tableSelection.value.reduce((s, r) => s + r.quantity * r.price, 0))
const roomsWas = computed(() => tableSelection.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const totalPrice = computed(() => roomsPrice.value + BOOKING_FEE)
const wasTotal = computed(() => roomsWas.value + BOOKING_FEE)
const saved = computed(() => roomsWas.value - roomsPrice.value)
const savedPct = computed(() => (roomsWas.value ? Math.round((saved.value / roomsWas.value) * 100) : 0))
function roomNameFor(baseId: string) {
  return roomsData.find((r) => r.id === baseId)?.roomName ?? ''
}

const arrangementIncludes = [
  '2 x Overnachting',
  'Dagelijks ontbijtbuffet',
  '3-Gangendiner (dag van aankomst)',
  'Tasting uurtje 17:00 - 18:00',
]

// Sidebar groeit na een kamerselectie: laat de sticky-offset meeschuiven
// zodat de CTA onderin zichtbaar blijft op lagere schermen.
const sideEl = ref<HTMLElement | null>(null)
const sideTop = useStickyFit(sideEl, 16)

// ---- Variant 5/6/7 + Final 8/9 + v11: room cards + extra stap met forced choice ----
// V6 toont in de keuzestap totaalprijzen i.p.v. +€0/+€15 (concept 2d).
// V7 = v6 + losse extra's onder het annuleringsblok ("Maak je booking compleet").
// FINAL: v8 = v5 (D, +€0/+€15 zonder extra's); v9 = v7 maar met +€0/+€15.
// V11 (Newsletter opt-in — Base) = v8 + gegevenspagina als laatste stap.
const isCardsVariant = computed(() => ['5', '6', '7', '8', '9', '11'].includes(jv.value))
// Varianten met het extra's-blok in de keuzestap.
const hasExtras = computed(() => jv.value === '7' || jv.value === '9')
// Final A (v8/v9) + v11: keuzestap heet "Maak je boeking compleet".
const isFinalA = computed(() => ['8', '9', '11'].includes(jv.value))
// V11: na de forced choice volgt nog de gegevenspagina.
const hasDetailsStep = computed(() => jv.value === '11')
const stepTwoTitle = computed(() =>
  isFinalA.value
    ? 'Maak je boeking compleet'
    : hasExtras.value
      ? 'Maak je booking compleet'
      : "Kies extra's",
)
// Kamerprijzen volgen de kalenderkeuze (zelfde patroon als de room table):
// het goedkoopste kamertype = de dagprijs, was-prijzen via de gedeelde factor.
const journeyDay = useState<{ price: number } | null>('journey-day', () => null)
const CHEAPEST_BASE = Math.min(...roomsData.map((r) => r.priceNow))
const priceDelta = computed(() => (journeyDay.value ? journeyDay.value.price - CHEAPEST_BASE : 0))
const v5Rooms = reactive(roomsData.map((r) => ({ ...r })))
const v5Cards = computed(() =>
  v5Rooms.map((r) => ({
    ...r,
    priceNow: r.priceNow + priceDelta.value,
    priceWas: journeyDay.value
      ? Math.round((r.priceNow + priceDelta.value) / JOURNEY_WAS_FACTOR)
      : r.priceWas,
  })),
)

// Extra stap: niets voorgeselecteerd, doorgaan pas na een actieve keuze.
const forcedStep = ref(1)
const forcedChoice = ref<CancelChoice>(null)
const forcedChoiceLabel = computed(() =>
  forcedChoice.value === 'flexible'
    ? 'Flexibel annuleren'
    : forcedChoice.value === 'nonrefundable'
      ? 'Niet-restitueerbaar'
      : undefined,
)
const v5SummaryRooms = computed(() =>
  v5Cards.value.map((r) => {
    // Variant A (v6/v7): na de keuze voor flexibel zit de toeslag in de
    // kamerprijs zelf i.p.v. als losse regel in de kassabon.
    const bakeFlex =
      (jv.value === '6' || jv.value === '7') && forcedChoice.value === 'flexible'
    const extra = bakeFlex ? pricing.flexibilityPerRoom : 0
    return {
      ...r,
      priceNow: r.priceNow + extra,
      priceWas: r.priceWas + extra,
      cancelLabel: forcedChoiceLabel.value,
    }
  }),
)
// Zelfde boekingskosten als stap 0 (€27,50) zodat de totalen kloppen.
const v5Pricing = { flexibilityPerRoom: pricing.flexibilityPerRoom, bookingFee: BOOKING_FEE }
// V7: losse extra's (max 2 per stuk); tellen mee in sidebar én keuzeblok.
const v7Extras = reactive([
  {
    id: 'wijn',
    title: 'Wijnarrangement bij 3-Gangendiner',
    price: 42,
    unit: 'Prijs per stuk',
    image: '/images/arrangement/diner.jpg',
    quantity: 0,
  },
  {
    id: 'lunch',
    title: '2-Gangenlunch in De Heeren van Harinxma (maandag t/m vrijdag beschikbaar)',
    price: 62.5,
    unit: 'Prijs per persoon',
    image: '/images/landingpages/culinair.jpg',
    quantity: 0,
  },
  {
    id: 'hightea',
    title: 'High tea',
    price: 50,
    unit: 'Prijs per stuk',
    image: '/images/hotel-ter-zand-food.jpg',
    quantity: 0,
  },
])
const EXTRA_MAX = 2
function setExtraQty(extra: (typeof v7Extras)[number], next: number) {
  extra.quantity = Math.max(0, Math.min(EXTRA_MAX, next))
}
function formatExtraPrice(price: number) {
  return `+ €${price.toFixed(2).replace('.', ',')}`
}

// V6/V7 (concept 2d): complete arrangementstotalen van de geselecteerde
// kamers in de keuzestap, o.b.v. de kalender-gekoppelde prijzen.
// Extra's (v7) tellen hier bewust NIET mee — alleen in de sidebar.
const v6Totals = computed(() => {
  const nonRef = v5Cards.value.reduce((s, r) => s + r.quantity * r.priceNow, 0)
  const roomCount = v5Cards.value.reduce((s, r) => s + r.quantity, 0)
  return { nonRef, flex: nonRef + roomCount * pricing.flexibilityPerRoom }
})
// V11: kamer-selectie + gekozen beleid delen met de gegevenspagina.
const journeySelection = useState<
  { baseId: string; rateKey: 'nonrefundable' | 'flexible'; price: number; priceWas: number; quantity: number }[]
>('journey-selection', () => [])
function goToDetails() {
  if (forcedChoice.value === null) return
  // Flex-toeslag in de rijprijs bakken (de gegevens-sidebar heeft geen losse regel).
  const extra = forcedChoice.value === 'flexible' ? pricing.flexibilityPerRoom : 0
  journeySelection.value = v5Cards.value
    .filter((r) => r.quantity > 0)
    .map((r) => ({
      baseId: r.id,
      rateKey: forcedChoice.value as 'nonrefundable' | 'flexible',
      price: r.priceNow + extra,
      priceWas: r.priceWas + extra,
      quantity: r.quantity,
    }))
  navigateTo(`/journey/${jv.value}/details`)
}
function v5Continue() {
  if (forcedStep.value === 1) {
    forcedStep.value = 2
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  // V7/V9: de CTA blijft actief; zonder keuze scrollen we terug naar het
  // keuzeblok en lichten we de subtitel op.
  if (hasExtras.value && forcedChoice.value === null) {
    v7TryContinue()
    return
  }
  // V11: na een gemaakte keuze door naar de gegevenspagina.
  if (hasDetailsStep.value && forcedChoice.value !== null) goToDetails()
}

// V7: geen inactieve knop — bij doorklikken zonder keuze terug omhoog.
const choiceHighlight = ref(false)
const fcBlock = ref<HTMLElement | null>(null)
function v7TryContinue() {
  if (forcedChoice.value !== null) return
  choiceHighlight.value = true
  // Instant scroll: smooth wordt door de focus-scroll van de knop afgebroken.
  setTimeout(() => fcBlock.value?.scrollIntoView({ block: 'start' }), 100)
}
watch(forcedChoice, (v) => {
  if (v !== null) choiceHighlight.value = false
})
</script>

<template>
  <!-- V5/V6 gebruiken de grijze paginakleur van de concepten (witte kaarten) -->
  <div class="page" :class="{ 'page--white': !isCardsVariant }">
    <CheckoutTopNav :label="label" />

    <div class="page__stepper">
      <CheckoutStepper :active="2" />
    </div>

    <main class="page__main container">
      <!-- Variant 3: tabel zonder rechterkolom + sticky sidebar -->
      <div v-if="jv === '3' || jv === '10'" class="page__grid">
        <div class="col-form">
          <h1 class="t-display">Kies je kamertype</h1>
          <CheckoutJourneyRoomTable
            :show-reserve="false"
            @update:selection="tableSelection = $event"
          />
        </div>

        <div class="col-summary">
          <aside ref="sideEl" class="card side" :style="{ top: `${sideTop}px` }">
            <div class="side__hotel">
              <img class="side__thumb" :src="hotel.thumb" :alt="hotel.name" />
              <div>
                <p class="t-body t-bold">{{ dealName }}</p>
                <p class="t-body c-mgrey">{{ hotel.name }}</p>
              </div>
            </div>

            <div class="side__dates">
              <div class="side__datecell">
                <p class="t-caption c-mgrey">Inchecken</p>
                <p class="t-body t-bold">{{ hotel.checkInDate }}</p>
              </div>
              <div class="side__datecell">
                <p class="t-caption c-mgrey">Uitchecken</p>
                <p class="t-body t-bold">{{ hotel.checkOutDate }}</p>
              </div>
            </div>
            <NuxtLink class="side__link side__link--center t-body" :to="`/journey/${jv}/date`">
              Verander data
            </NuxtLink>

            <div class="side__includes">
              <p class="t-body t-bold">Jouw arrangement bevat</p>
              <p v-for="item in arrangementIncludes" :key="item" class="side__inc t-body">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
              <a class="side__link side__link--center t-body" href="#">Bekijk je volledige arrangement</a>
            </div>

            <template v-if="roomsSel > 0">
              <hr class="side__hr" />

              <div class="side__details">
                <p class="t-body t-bold">Details</p>
                <div v-for="row in tableSelection" :key="`${row.baseId}-${row.rateKey}`" class="side__row side__row--room">
                  <span class="side__qty">{{ row.quantity }}x</span>
                  <div class="side__rowmain">
                    <p class="t-body t-bold">Arrangement</p>
                    <p class="t-caption c-mgrey">{{ roomNameFor(row.baseId) }}</p>
                    <p v-if="row.rateKey === 'flexible'" class="t-caption c-green">Flexibel annuleren</p>
                    <p v-else class="t-caption c-grey">Niet-terugbetaalbaar</p>
                  </div>
                  <CheckoutPriceTag :value="row.quantity * row.price" :show-cents="false" size="sm" />
                </div>
                <div class="side__row">
                  <span class="t-body">Boekingskosten</span>
                  <CheckoutPriceTag :value="BOOKING_FEE" size="sm" />
                </div>
              </div>

              <hr class="side__hr" />

              <div class="side__total">
                <div class="side__totalrow">
                  <span class="t-h2">Totaalprijs</span>
                  <div class="side__totalprices">
                    <CheckoutPriceTag :value="wasTotal" size="sm" strike color="var(--c-medium-grey)" />
                    <CheckoutPriceTag :value="totalPrice" size="lg" bold color="var(--c-via-green)" />
                  </div>
                </div>
                <p class="t-caption c-mgrey">{{ roomsSel }} {{ roomsSel === 1 ? 'kamer' : 'kamers' }} voor 2 nachten voor {{ roomsSel * 2 }} personen</p>
              </div>

              <p class="side__saved">
                <CheckoutSmileyIcon />
                <span class="t-body">Je hebt al</span>
                <CheckoutPriceTag :value="saved" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
                <span class="t-caption c-grey">({{ savedPct }}%)</span>
                <span class="t-body">bespaard.</span>
              </p>

              <p class="side__smallprint">
                Je dient ter plaatse alleen de lokale belastingen, eventuele
                service-/administratiekosten van het hotel en parkeerkosten te betalen
                (indien dit niet is inbegrepen in het arrangement).
              </p>
            </template>

            <button
              class="btn-primary"
              type="button"
              :disabled="roomsSel === 0"
              @click="navigateTo(`/journey/${jv}/details`)"
            >
              {{ roomsSel === 0 ? 'Selecteer een kamer' : 'Ik ga boeken' }}
            </button>

            <div class="side__trust">
              <img src="/images/trustpilot.svg" alt="Trustpilot" />
            </div>
          </aside>
        </div>
      </div>

      <!-- Variant 5/6 (concept 2a/2d): room cards + extra stap met forced choice -->
      <div v-else-if="isCardsVariant" class="page__grid">
        <div v-if="forcedStep === 2" class="col-form">
          <h1 class="t-display">{{ stepTwoTitle }}</h1>

          <!-- V6/V7: totaalprijzen i.p.v. meerprijs -->
          <div ref="fcBlock" class="fcblock">
            <CheckoutForcedChoice
              v-model="forcedChoice"
              :totals="jv === '6' || jv === '7' ? v6Totals : undefined"
              :highlight-subtitle="hasExtras && choiceHighlight"
            />
          </div>

          <!-- V7: losse extra's onder het annuleringsblok (optioneel) -->
          <section v-if="hasExtras" class="card block">
            <h2 class="t-h1">Kies extra's</h2>

            <div class="extras">
              <div v-for="extra in v7Extras" :key="extra.id" class="extra">
                <p class="extra__title t-body-lg t-bold">{{ extra.title }}</p>
                <img class="extra__img" :src="extra.image" :alt="extra.title" />
                <div class="extra__pricerow">
                  <span class="extra__price">{{ formatExtraPrice(extra.price) }}</span>
                  <span class="t-body c-via-black">{{ extra.unit }}</span>
                </div>
                <hr class="extra__hr" />
                <div class="extra__stepper">
                  <button
                    class="extra__btn extra__btn--minus"
                    type="button"
                    :disabled="extra.quantity === 0"
                    aria-label="Minder"
                    @click="setExtraQty(extra, extra.quantity - 1)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
                  </button>
                  <span class="extra__val">{{ extra.quantity }}</span>
                  <button
                    class="extra__btn extra__btn--plus"
                    type="button"
                    :disabled="extra.quantity >= EXTRA_MAX"
                    aria-label="Meer"
                    @click="setExtraQty(extra, extra.quantity + 1)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- V7: speciale wensen (optioneel) -->
          <section v-if="hasExtras" class="card block">
            <h2 class="t-h1">Speciale wensen (optioneel)</h2>
            <p class="t-body c-grey">
              Als je speciale wensen of behoeften hebt, zullen wij dit doorgeven aan het hotel.
              Het hotelpersoneel zal zijn best doen om aan je wensen te voldoen. Als je niets van
              de accommodatie hoort, kun je rechtstreeks contact met hen opnemen om dit te
              bevestigen. De accommodatie kan een toeslag in rekening brengen voor bepaalde
              speciale verzoeken.
            </p>
            <div class="wishes">
              <span class="wishes__optional t-caption c-mgrey">OPTIONEEL</span>
              <textarea class="wishes__field t-body" rows="6" placeholder="Beginnen met typen…" />
            </div>
          </section>

          <div class="col-form__cta col-form__cta--split">
            <button class="btn-back t-body" type="button" @click="forcedStep = 1">← Terug naar kamers</button>
            <!-- V7: knop blijft actief; zonder keuze scrollt hij terug omhoog -->
            <button
              v-if="hasExtras"
              class="btn-primary btn-primary--auto"
              type="button"
              @click="v7TryContinue"
            >
              Opslaan en doorgaan
            </button>
            <button v-else class="btn-primary btn-primary--auto" type="button" :disabled="forcedChoice === null" @click="v5Continue">
              {{ forcedChoice === null ? 'Maak eerst een keuze' : 'Verder' }}
            </button>
          </div>
        </div>

        <div v-else class="col-form">
          <h1 class="t-display">Controleer je boeking</h1>

          <section class="card block">
            <header class="block__head">
              <h2 class="t-h1">Kies je kamer(s)</h2>
              <p class="t-body c-grey">Je krijgt één van de beste kamers, voor veel minder dan normaal!</p>
            </header>

            <div class="block__rooms">
              <CheckoutRoomCard
                v-for="(room, i) in v5Cards"
                :key="room.id"
                :room="room"
                @update:quantity="v5Rooms[i]!.quantity = $event"
              />
            </div>
          </section>

          <div class="col-form__cta">
            <button class="btn-primary btn-primary--auto" type="button" @click="v5Continue">
              Opslaan en doorgaan
            </button>
          </div>
        </div>

        <div class="col-summary">
          <CheckoutOrderSummary
            :hotel="hotel"
            :rooms="v5SummaryRooms"
            :includes="includes"
            :pricing="v5Pricing"
            :trustpilot="trustpilot"
            :selected="['5', '8', '9', '11'].includes(jv) ? forcedChoice : null"
            :show-flex-line="['5', '8', '9', '11'].includes(jv) && forcedChoice === 'flexible'"
            :cta-disabled="!hasExtras && forcedStep === 2 && forcedChoice === null"
            :extras="hasExtras ? v7Extras : undefined"
            @cta="v5Continue"
          />
        </div>
      </div>

      <!-- Variant 1/2: volledige room table met reserveringskolom -->
      <div v-else class="page__table">
        <h1 class="t-display">Kies je kamer(s)</h1>
        <!-- V4: goedkoopste kamer voorgeselecteerd -->
        <CheckoutJourneyRoomTable
          :initial-cheapest="jv === '4'"
          :defer-policy-popup="jv === '4'"
          :book-to="`/journey/${jv}/details`"
        />
      </div>
    </main>

    <CheckoutSiteFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.page--white {
  background: var(--c-white);
}
.page__stepper {
  padding: 32px 24px;
}
.page__main {
  flex: 1;
}
.page__table {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 48px;
  align-items: start;
}
.col-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.col-summary {
  padding-top: 72px;
  align-self: stretch;
}

/* V5 (concept 2a): room cards in een kaartblok + forced-choice stap */
.block {
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
}
.block__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.block__rooms {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.block__rooms :deep(.room) {
  box-shadow: none;
}
.col-form__cta {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.fcblock {
  scroll-margin-top: 16px;
}
.col-form__cta--split {
  justify-content: space-between;
  align-items: center;
}
.btn-back {
  color: var(--c-via-black);
  text-decoration: underline;
}
.btn-primary--auto {
  width: auto;
  min-width: 254px;
}

/* V7: extra's in drie kaarten (screenshot-layout) */
.extras {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}
.extra {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.extra__title {
  line-height: 24px;
}
.extra__img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.extra__pricerow {
  /* Onderin uitlijnen zodat de prijsrijen van de drie kaarten gelijk lopen */
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.extra__price {
  background: var(--c-via-green);
  color: var(--c-white);
  font-weight: var(--w-black);
  font-size: var(--t-body);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.extra__hr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
}
.extra__stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}
.extra__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-via-black);
  color: var(--c-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
}
.extra__btn:hover { opacity: 0.85; }
.extra__btn:disabled {
  background: var(--c-medium-grey);
  cursor: not-allowed;
  opacity: 1;
}
.extra__val {
  min-width: 52px;
  text-align: center;
  border: 1px solid var(--c-via-black);
  border-radius: 100px;
  padding: 4px 0;
  font-weight: var(--w-black);
  font-size: var(--t-body-lg);
}

/* V7: speciale wensen */
.wishes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wishes__optional {
  align-self: flex-end;
  letter-spacing: 0.06em;
}
.wishes__field {
  width: 100%;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  resize: vertical;
  font-family: inherit;
  color: var(--c-via-black);
  background: var(--c-white);
}
.wishes__field:focus {
  outline: none;
  border-color: var(--c-via-black);
}
.wishes__field::placeholder {
  color: var(--c-medium-grey);
}

/* Sticky sidebar (zelfde patroon als de kalenderstap) */
.side {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 16px;
  box-shadow: none;
}
.side__hotel {
  display: flex;
  gap: 12px;
  align-items: center;
}
.side__thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.side__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.side__datecell {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.side__datecell + .side__datecell {
  border-left: 1px solid var(--c-light-grey);
}
.side__link {
  color: var(--c-via-black);
  text-decoration: underline;
  text-align: center;
}
.side__link--center {
  align-self: center;
}
.side__hr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
}
.side__includes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.side__inc {
  display: flex;
  align-items: center;
  gap: 8px;
}
.side__inc svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.side__details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.side__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.side__row--room {
  align-items: flex-start;
}
.side__qty {
  width: 24px;
  font-size: var(--t-body);
  flex-shrink: 0;
}
.side__rowmain {
  flex: 1;
}
.side__total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.side__totalrow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.side__totalprices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.side__saved {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: var(--c-via-black);
}
.side__smallprint {
  font-size: 11px;
  line-height: 15px;
  color: var(--c-medium-grey);
}
.side__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.side__trust img {
  height: 64px;
}
</style>
