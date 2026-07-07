<script setup lang="ts">
// MOBIELE site — kamer kiezen (room-table varianten 1/2/3/4).
// Geen tabel maar een lijst: per kamer foto, omschrijving en amenities,
// met daaronder een horizontale rij tariefkaarten (Booking.com-patroon,
// in de ViaLuxury-stijl). Boven de kamers een samenvatting van de boeking.
import { hotel, trustpilot, rooms as roomsData, dealName, pricing } from '~/data/deal'
import type { CancelChoice } from '~/data/cancellation'
import { journeyKey, JOURNEY_WAS_FACTOR } from '~/data/journeys'

const route = useRoute()
const jv = computed(() => journeyKey(route.params.v))
const isCardsVariant = computed(() => ['5', '6', '7', '8', '9'].includes(jv.value))
// Varianten met het extra's-blok in de keuzestap.
const hasExtras = computed(() => jv.value === '7' || jv.value === '9')
// Final A (v8/v9): keuzestap heet "Maak je boeking compleet" (met én zonder extra's).
const isFinalA = computed(() => jv.value === '8' || jv.value === '9')
const stepTwoTitle = computed(() =>
  isFinalA.value
    ? 'Maak je boeking compleet'
    : hasExtras.value
      ? 'Maak je booking compleet'
      : "Kies extra's",
)

// Kalenderkoppeling: zelfde state + delta-patroon als de desktop-table.
const journeyDay = useState<{ price: number; checkIn?: string; checkOut?: string } | null>(
  'journey-day',
  () => null,
)
const CHEAPEST_BASE = Math.min(...roomsData.map((r) => r.priceNow))
const priceDelta = computed(() =>
  journeyDay.value ? journeyDay.value.price - CHEAPEST_BASE : 0,
)

interface RateRow {
  id: string
  baseId: string
  rateKey: 'nonrefundable' | 'flexible'
  priceWas: number
  price: number
  quantity: number
  scarcity?: string
}

interface ListRoom {
  id: string
  name: string
  image: string
  description: string
  facilities: { label: string; icon: string }[]
  rows: RateRow[]
}

const listRooms = reactive<ListRoom[]>(
  roomsData.map((r) => ({
    id: r.id,
    name: r.roomName,
    image: r.image,
    description: r.facilitiesIntro,
    facilities: r.facilities,
    // Gratis annuleren vooraan (meest links in de scroll-rij).
    rows: [
      {
        id: `${r.id}-flex`,
        baseId: r.id,
        rateKey: 'flexible',
        priceWas: r.priceWas,
        price: r.priceNow + pricing.flexibilityPerRoom,
        quantity: 0,
        scarcity: r.id === 'junior' ? 'Nog 2 kamers over' : undefined,
      },
      {
        id: `${r.id}-nonref`,
        baseId: r.id,
        rateKey: 'nonrefundable',
        priceWas: r.priceWas,
        price: r.priceNow,
        quantity: 0,
        scarcity: r.id === 'junior' ? 'Nog 2 kamers over' : undefined,
      },
    ],
  })),
)

const allRows = computed(() => listRooms.flatMap((room) => room.rows))

// V4: goedkoopste kamer voorgeselecteerd.
if (jv.value === '4') {
  const cheapest = allRows.value.reduce((min, r) => (r.price < min.price ? r : min))
  cheapest.quantity = 1
}

function rowPrice(row: RateRow) {
  return row.price + priceDelta.value
}
function rowWas(row: RateRow) {
  return journeyDay.value
    ? Math.round(rowPrice(row) / JOURNEY_WAS_FACTOR)
    : row.priceWas
}

// Eén annuleringsbeleid per boeking (zelfde regels als de room table).
// V4: vrij mixen, popup pas bij "Ik ga boeken".
const deferPolicyPopup = computed(() => jv.value === '4')
const activePolicy = computed<'nonrefundable' | 'flexible' | null>(() => {
  const sel = allRows.value.find((r) => r.quantity > 0)
  return sel ? sel.rateKey : null
})
function isInactive(row: RateRow) {
  if (deferPolicyPopup.value) return false
  return activePolicy.value !== null && row.rateKey !== activePolicy.value
}

const policyPopupOpen = ref(false)

function setQty(row: RateRow, next: number) {
  if (isInactive(row) && next > row.quantity) {
    policyPopupOpen.value = true
    return
  }
  row.quantity = Math.max(0, Math.min(5, next))
}

function applyPolicy(policy: 'flexible' | 'nonrefundable') {
  policyPopupOpen.value = false
  for (const row of allRows.value) {
    if (row.quantity === 0 || row.rateKey === policy) continue
    const sibling = allRows.value.find((c) => c.baseId === row.baseId && c.rateKey === policy)
    if (sibling) sibling.quantity += row.quantity
    row.quantity = 0
  }
}

const mixedPolicies = computed(() => {
  const keys = new Set(allRows.value.filter((r) => r.quantity > 0).map((r) => r.rateKey))
  return keys.size > 1
})

function onBook() {
  if (deferPolicyPopup.value && mixedPolicies.value) policyPopupOpen.value = true
}

// Kassabon.
const BOOKING_FEE = 27.5
const selectedRows = computed(() => allRows.value.filter((r) => r.quantity > 0))
const totalRooms = computed(() => allRows.value.reduce((s, r) => s + r.quantity, 0))
const totalPrice = computed(() => allRows.value.reduce((s, r) => s + r.quantity * rowPrice(r), 0))
const totalWas = computed(() => allRows.value.reduce((s, r) => s + r.quantity * rowWas(r), 0))
const displayTotal = computed(() => totalPrice.value + BOOKING_FEE)
const displayWas = computed(() => totalWas.value + BOOKING_FEE)
const totalSaved = computed(() => totalWas.value - totalPrice.value)
const savedPct = computed(() =>
  totalWas.value ? Math.round((totalSaved.value / totalWas.value) * 100) : 0,
)
function roomNameFor(baseId: string) {
  return listRooms.find((r) => r.id === baseId)?.name ?? ''
}

const arrangementIncludes = [
  '2 x Overnachting',
  'Dagelijks ontbijtbuffet',
  '3-Gangendiner (dag van aankomst)',
  'Tasting uurtje 17:00 - 18:00',
  'Welkomstdrankje',
  'Gebruik van zwembad',
  'Gebruik van wellness & fitness',
  'Late check-out tot 12:00',
]

const checkInLabel = computed(() => journeyDay.value?.checkIn || hotel.checkInDate)
const checkOutLabel = computed(() => journeyDay.value?.checkOut || hotel.checkOutDate)

// ---- Forced-choice varianten (5/6/7): huidig ViaLuxury mobiel design ----
// Kamerselectie met room typecards onder elkaar (zonder tariefvarianten);
// de annuleringskeuze (en extra's bij v7) volgt in een kale extra stap.
const fcRooms = reactive(roomsData.map((r) => ({ ...r })))
const fcCards = computed(() =>
  fcRooms.map((r) => ({
    ...r,
    priceNow: r.priceNow + priceDelta.value,
    priceWas: journeyDay.value
      ? Math.round((r.priceNow + priceDelta.value) / JOURNEY_WAS_FACTOR)
      : r.priceWas,
  })),
)
function setFcQty(room: (typeof fcRooms)[number], next: number) {
  room.quantity = Math.max(0, Math.min(room.maxPeople, next))
}
const readMoreOpen = reactive<Record<string, boolean>>({})
const availabilityBadge: Record<string, string> = {
  junior: 'Nog 2 beschikbaar',
  senior: 'Nog 4 beschikbaar',
}

const forcedStep = ref(1)
const forcedChoice = ref<CancelChoice>(null)
function fcContinue() {
  forcedStep.value = 2
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// V7: geen inactieve knop — bij doorklikken zonder keuze scrollt de pagina
// terug naar het keuzeblok en licht de subtitel op.
const choiceHighlight = ref(false)
const fcBlock = ref<HTMLElement | null>(null)
function v7TryContinue() {
  if (forcedChoice.value !== null) return
  choiceHighlight.value = true
  // Instant scroll: smooth wordt hier afgebroken (focus-scroll van de knop
  // + de scroll-snap containers op de pagina).
  setTimeout(() => fcBlock.value?.scrollIntoView({ block: 'start' }), 100)
}
watch(forcedChoice, (v) => {
  if (v !== null) choiceHighlight.value = false
})

// Kassabon stap 1 (zonder annuleringskeuze — die volgt in de extra stap).
const fcRoomCount = computed(() => fcRooms.reduce((s, r) => s + r.quantity, 0))
const fcSelected = computed(() => fcCards.value.filter((r) => r.quantity > 0))
const fcRoomsTotal = computed(() => fcSelected.value.reduce((s, r) => s + r.quantity * r.priceNow, 0))
const fcRoomsWas = computed(() => fcSelected.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const fcDisplayTotal = computed(() => fcRoomsTotal.value + BOOKING_FEE)
const fcDisplayWas = computed(() => fcRoomsWas.value + BOOKING_FEE)
const fcSaved = computed(() => fcRoomsWas.value - fcRoomsTotal.value)
const fcSavedPct = computed(() =>
  fcRoomsWas.value ? Math.round((fcSaved.value / fcRoomsWas.value) * 100) : 0,
)

// V7: losse extra's (max 2 per stuk), tellen mee in de keuzestap-totalen.
const fcExtras = reactive([
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
function setExtraQty(extra: (typeof fcExtras)[number], next: number) {
  extra.quantity = Math.max(0, Math.min(EXTRA_MAX, next))
}
function formatExtraPrice(price: number) {
  return `+ €${price.toFixed(2).replace('.', ',')}`
}

// V6/V7: totaalprijzen in het keuzeblok. Extra's (v7) tellen hier
// bewust NIET mee.
const fcTotals = computed(() => {
  const nonRef = fcRoomsTotal.value
  return { nonRef, flex: nonRef + fcRoomCount.value * pricing.flexibilityPerRoom }
})
</script>

<template>
  <div class="mpage">
    <CheckoutMobileHeader :step="2" />

    <main class="mpage__main">
      <!-- Forced-choice varianten (5/6/7): extra stap zonder samenvatting -->
      <template v-if="isCardsVariant && forcedStep === 2">
        <h1 class="mtitle">{{ stepTwoTitle }}</h1>

        <div ref="fcBlock" class="mfcblock">
          <CheckoutForcedChoice
            v-model="forcedChoice"
            :totals="jv === '6' || jv === '7' ? fcTotals : undefined"
            :highlight-subtitle="hasExtras && choiceHighlight"
          />
        </div>

        <!-- V7: losse extra's (optioneel), gestapeld op mobiel -->
        <section v-if="hasExtras" class="mextras">
          <h2 class="msectiontitle">Kies extra's</h2>
          <div v-for="extra in fcExtras" :key="extra.id" class="mextra">
            <p class="mextra__title">{{ extra.title }}</p>
            <img class="mextra__img" :src="extra.image" :alt="extra.title" />
            <div class="mextra__pricerow">
              <span class="mextra__price">{{ formatExtraPrice(extra.price) }}</span>
              <span class="t-body">{{ extra.unit }}</span>
            </div>
            <hr class="mhr" />
            <div class="mextra__stepper">
              <button
                class="mrate__btn"
                type="button"
                :disabled="extra.quantity === 0"
                aria-label="Minder"
                @click="setExtraQty(extra, extra.quantity - 1)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
              </button>
              <span class="mrate__val">{{ extra.quantity }}</span>
              <button
                class="mrate__btn"
                type="button"
                :disabled="extra.quantity >= EXTRA_MAX"
                aria-label="Meer"
                @click="setExtraQty(extra, extra.quantity + 1)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
              </button>
            </div>
          </div>
        </section>

        <!-- V7: speciale wensen (optioneel) -->
        <section v-if="hasExtras" class="mwishes">
          <h2 class="msectiontitle">Speciale wensen (optioneel)</h2>
          <p class="t-body c-grey">
            Als je speciale wensen of behoeften hebt, zullen wij dit doorgeven aan het hotel.
            Het hotelpersoneel zal zijn best doen om aan je wensen te voldoen.
          </p>
          <textarea class="mwishes__field t-body" rows="5" placeholder="Beginnen met typen…" />
        </section>

        <div class="mfcnav">
          <button class="mfcnav__back t-body" type="button" @click="forcedStep = 1">← Terug naar kamers</button>
          <div class="mcta">
            <!-- V7: knop blijft actief; zonder keuze scrollt hij terug omhoog -->
            <button
              v-if="hasExtras"
              class="btn-primary mcta__btn"
              type="button"
              @click="v7TryContinue"
            >
              Opslaan en doorgaan
            </button>
            <button v-else class="btn-primary mcta__btn" type="button" :disabled="forcedChoice === null">
              {{ forcedChoice === null ? 'Maak eerst een keuze' : 'Verder' }}
            </button>
          </div>
        </div>
      </template>

      <!-- Forced-choice varianten: stap 1 = huidig ViaLuxury mobiel design -->
      <template v-else-if="isCardsVariant">
        <h1 class="mtitle">Controleer je boeking</h1>

        <section class="msum">
          <div class="msum__hotel">
            <img class="msum__thumb" :src="hotel.thumb" :alt="hotel.name" />
            <div class="msum__hotelmain">
              <p class="msum__name">{{ hotel.name }}</p>
              <p class="msum__loc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" /></svg>
                {{ hotel.location }}
              </p>
              <div class="msum__dates">
                <div class="msum__datecell">
                  <span class="t-caption c-mgrey">Check in</span>
                  <span class="t-body t-bold">{{ checkInLabel }}</span>
                </div>
                <div class="msum__datecell">
                  <span class="t-caption c-mgrey">Check out</span>
                  <span class="t-body t-bold">{{ checkOutLabel }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr class="mhr" />

        <section class="mincl">
          <h2 class="msectiontitle">Jouw arrangement</h2>
          <p v-for="item in arrangementIncludes" :key="item" class="mincl__item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ item }}
          </p>
        </section>

        <hr class="mhr" />

        <!-- Room typecards onder elkaar (zonder tariefvarianten) -->
        <section class="mrooms">
          <div>
            <h2 class="msectiontitle">Kies je kamer(s)</h2>
            <p class="t-body c-grey">Je krijgt één van de beste kamers, voor veel minder dan normaal!</p>
          </div>

          <article v-for="room in fcCards" :key="room.id" class="mfcroom">
            <div class="mfcroom__head">
              <h3 class="mfcroom__name">{{ room.roomName }}</h3>
              <img class="mfcroom__img" :src="room.image" :alt="room.roomName" />
            </div>

            <div class="mfcroom__facilities">
              <p class="t-body t-bold">Kamerfaciliteiten:</p>
              <div class="mfcroom__pills">
                <span v-for="f in room.facilities" :key="f.label" class="mroom__pill">{{ f.label }}</span>
              </div>
              <button class="mfcroom__more t-body" type="button" @click="readMoreOpen[room.id] = !readMoreOpen[room.id]">
                Lees meer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :style="{ transform: readMoreOpen[room.id] ? 'rotate(180deg)' : '' }"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              <p v-if="readMoreOpen[room.id]" class="t-body c-grey">{{ room.facilitiesIntro }}</p>
            </div>

            <div class="mfcroom__pricing">
              <p class="mfcroom__pricelabel">Prijs voor 2 nachten + compleet arrangement</p>
              <div class="mfcroom__pricerow">
                <div class="mfcroom__priceleft">
                  <p class="mrate__prices">
                    <CheckoutPriceTag :value="room.priceWas" :show-cents="false" size="sm" strike color="var(--c-medium-grey)" />
                    <CheckoutPriceTag :value="room.priceNow" :show-cents="false" size="lg" bold />
                  </p>
                  <span class="mfcroom__badge">{{ availabilityBadge[room.id] }}</span>
                  <p v-if="room.upgradeText" class="mfcroom__upgrade t-caption">{{ room.upgradeText }}</p>
                </div>
                <div class="mfcroom__qty">
                  <span class="t-caption">Aantal kamers</span>
                  <div class="mfcroom__stepper">
                    <button
                      class="mrate__btn mrate__btn--sm"
                      type="button"
                      :disabled="room.quantity === 0"
                      aria-label="Minder kamers"
                      @click="setFcQty(fcRooms.find((r) => r.id === room.id)!, room.quantity - 1)"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
                    </button>
                    <span class="mfcroom__val">{{ room.quantity }}</span>
                    <button
                      class="mrate__btn mrate__btn--sm"
                      type="button"
                      :disabled="room.quantity >= room.maxPeople"
                      aria-label="Meer kamers"
                      @click="setFcQty(fcRooms.find((r) => r.id === room.id)!, room.quantity + 1)"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
                    </button>
                  </div>
                  <span class="t-caption c-mgrey">(max.) {{ room.maxPeople }} personen</span>
                </div>
              </div>
            </div>
          </article>
        </section>

        <hr class="mhr" />

        <!-- Kassabon (zonder annuleringskeuze: die volgt in de extra stap) -->
        <section class="mdetails">
          <template v-if="fcRoomCount > 0">
            <h2 class="msectiontitle">Details</h2>
            <div v-for="room in fcSelected" :key="room.id" class="mdetails__row mdetails__row--room">
              <span class="mdetails__qty">{{ room.quantity }}x</span>
              <div class="mdetails__main">
                <p class="t-body t-bold">Arrangement</p>
                <p class="t-caption c-mgrey">{{ room.roomName }}</p>
              </div>
              <CheckoutPriceTag :value="room.quantity * room.priceNow" :show-cents="false" size="sm" />
            </div>
            <div class="mdetails__row">
              <span class="t-body">Boekingskosten</span>
              <CheckoutPriceTag :value="BOOKING_FEE" size="sm" />
            </div>

            <hr class="mhr" />

            <div class="mtotal">
              <div class="mtotal__row">
                <span class="mtotal__label">Totaalprijs</span>
                <div class="mtotal__prices">
                  <CheckoutPriceTag :value="fcDisplayWas" size="sm" strike color="var(--c-medium-grey)" />
                  <CheckoutPriceTag :value="fcDisplayTotal" size="lg" bold color="var(--c-via-green)" />
                </div>
              </div>
              <p class="t-caption c-mgrey">{{ fcRoomCount }} {{ fcRoomCount === 1 ? 'kamer' : 'kamers' }} voor 2 nachten</p>
            </div>

            <p class="msaved">
              <CheckoutSmileyIcon />
              <span class="t-body">Je hebt al</span>
              <CheckoutPriceTag :value="fcSaved" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
              <span class="t-caption c-grey">({{ fcSavedPct }}%)</span>
              <span class="t-body">bespaard.</span>
            </p>

            <p class="msmallprint">
              Je dient ter plaatse alleen de lokale belastingen, eventuele
              service-/administratiekosten van het hotel en parkeerkosten te betalen
              (indien dit niet is inbegrepen in het arrangement).
            </p>
          </template>

          <div class="mcta">
            <button class="btn-primary mcta__btn" type="button" :disabled="fcRoomCount === 0" @click="fcContinue">
              {{ fcRoomCount === 0 ? 'Selecteer een kamer' : 'Opslaan en doorgaan' }}
            </button>
          </div>

          <div class="mtrust">
            <img src="/images/trustpilot.svg" alt="Trustpilot" />
          </div>
        </section>
      </template>

      <template v-else>
        <h1 class="mtitle">Controleer je boeking</h1>

        <!-- Samenvatting van de boeking -->
        <section class="msum">
          <div class="msum__hotel">
            <img class="msum__thumb" :src="hotel.thumb" :alt="hotel.name" />
            <div class="msum__hotelmain">
              <p class="msum__name">{{ hotel.name }}</p>
              <p class="msum__loc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" /></svg>
                {{ hotel.location }}
              </p>
              <div class="msum__dates">
                <div class="msum__datecell">
                  <span class="t-caption c-mgrey">Check in</span>
                  <span class="t-body t-bold">{{ checkInLabel }}</span>
                </div>
                <div class="msum__datecell">
                  <span class="t-caption c-mgrey">Check out</span>
                  <span class="t-body t-bold">{{ checkOutLabel }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr class="mhr" />

        <!-- Arrangement -->
        <section class="mincl">
          <h2 class="msectiontitle">Jouw arrangement</h2>
          <p v-for="item in arrangementIncludes" :key="item" class="mincl__item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ item }}
          </p>
        </section>

        <hr class="mhr" />

        <!-- Kamerlijst -->
        <section class="mrooms">
          <div>
            <h2 class="msectiontitle">Kies je kamer(s)</h2>
            <p class="t-body c-grey">Je krijgt één van de beste kamers, voor veel minder dan normaal!</p>
          </div>

          <article v-for="room in listRooms" :key="room.id" class="mroom">
            <h3 class="mroom__name">{{ room.name }}</h3>
            <img class="mroom__img" :src="room.image" :alt="room.name" />
            <p class="t-body c-grey">{{ room.description }}</p>
            <div class="mroom__pills">
              <span v-for="f in room.facilities" :key="f.label" class="mroom__pill">{{ f.label }}</span>
            </div>

            <!-- Horizontale rij tariefkaarten (Booking.com-patroon) -->
            <div class="mrates">
              <div
                v-for="row in room.rows"
                :key="row.id"
                class="mrate"
                :class="{
                  'mrate--on': row.quantity > 0,
                  'mrate--inactive': isInactive(row),
                }"
              >
                <p class="mrate__title" :class="{ 'c-green': row.rateKey === 'flexible' }">
                  {{ row.rateKey === 'flexible' ? 'Gratis annuleren' : 'Niet-terugbetaalbaar' }}
                </p>
                <p v-if="row.rateKey === 'flexible'" class="mrate__line mrate__line--green">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  Gratis annuleren vóór 17 mei
                </p>
                <p v-else class="mrate__line">Je betaalt het volledige bedrag, ook als je annuleert.</p>
                <p v-if="row.scarcity" class="mrate__line mrate__line--red">· {{ row.scarcity }}</p>

                <div class="mrate__pricing">
                  <p class="mrate__prices">
                    <CheckoutPriceTag :value="rowWas(row)" :show-cents="false" size="sm" strike color="var(--c-medium-grey)" />
                    <CheckoutPriceTag :value="rowPrice(row)" :show-cents="false" size="lg" bold color="var(--c-via-orange)" />
                    <FirstReleasePriceInfoTooltip variant="deal" />
                  </p>
                  <p class="t-caption c-mgrey">Prijs voor 2 nachten + compleet arrangement</p>
                </div>

                <!-- Eerst een "Kies"-knop; na de keuze de aantal-selector (op 1)
                     met een prullenbak om terug te gaan naar de beginstand. -->
                <button
                  v-if="row.quantity === 0"
                  class="btn-primary mrate__choose"
                  type="button"
                  @click="setQty(row, 1)"
                >
                  Kies
                </button>
                <template v-else>
                  <div class="mrate__stepper">
                    <button
                      class="mrate__btn"
                      type="button"
                      aria-label="Minder kamers"
                      @click="setQty(row, row.quantity - 1)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
                    </button>
                    <span class="mrate__val">{{ row.quantity }}</span>
                    <button
                      class="mrate__btn"
                      type="button"
                      :disabled="row.quantity >= 5"
                      aria-label="Meer kamers"
                      @click="setQty(row, row.quantity + 1)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
                    </button>
                    <button
                      class="mrate__trash"
                      type="button"
                      aria-label="Selectie verwijderen"
                      @click="setQty(row, 0)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                  </div>
                  <!-- Max personen schaalt mee met het aantal kamers (2 p.p. kamer) -->
                  <p class="mrate__max t-caption c-mgrey">(Max) {{ row.quantity * 2 }} personen</p>
                </template>
              </div>
            </div>

            <!-- Zodra in deze kaart een optie is gekozen klapt de kaart uit
                 met de volledige kassabon (alle kamers + boekingskosten,
                 totaalprijs en de doorgaan-knop) — Booking.com-patroon. -->
            <template v-if="room.rows.some((r) => r.quantity > 0)">
              <hr class="mhr" />

              <div class="mroomsum">
                <h3 class="mroomsum__title">Prijsopbouw</h3>
                <div v-for="row in selectedRows" :key="row.id" class="mdetails__row mdetails__row--room">
                  <span class="mdetails__qty">{{ row.quantity }}x</span>
                  <div class="mdetails__main">
                    <p class="t-body t-bold">Arrangement</p>
                    <p class="t-caption c-mgrey">{{ roomNameFor(row.baseId) }}</p>
                  </div>
                  <!-- Prijs met daaronder het annuleringslabel, rechts uitgelijnd
                       op de regel van de kamernaam -->
                  <div class="mdetails__right">
                    <CheckoutPriceTag :value="row.quantity * rowPrice(row)" :show-cents="false" size="sm" />
                    <p v-if="row.rateKey === 'flexible'" class="t-caption c-green">Gratis annuleren</p>
                    <p v-else class="t-caption c-grey">Niet-terugbetaalbaar</p>
                  </div>
                </div>
                <div class="mdetails__row">
                  <span class="t-body">Boekingskosten</span>
                  <CheckoutPriceTag :value="BOOKING_FEE" size="sm" />
                </div>

                <hr class="mhr" />

                <div class="mtotal">
                  <div class="mtotal__row">
                    <span class="mtotal__label">Totaalprijs</span>
                    <div class="mtotal__prices">
                      <CheckoutPriceTag :value="displayWas" size="sm" strike color="var(--c-medium-grey)" />
                      <CheckoutPriceTag :value="displayTotal" size="lg" bold color="var(--c-via-green)" />
                    </div>
                  </div>
                  <p class="t-caption c-mgrey">{{ totalRooms }} {{ totalRooms === 1 ? 'kamer' : 'kamers' }} voor 2 nachten</p>
                </div>

                <p class="msaved">
                  <CheckoutSmileyIcon />
                  <span class="t-body">Je hebt al</span>
                  <CheckoutPriceTag :value="totalSaved" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
                  <span class="t-caption c-grey">({{ savedPct }}%)</span>
                  <span class="t-body">bespaard.</span>
                </p>

                <p class="msmallprint">
                  Je dient ter plaatse alleen de lokale belastingen, eventuele
                  service-/administratiekosten van het hotel en parkeerkosten te betalen
                  (indien dit niet is inbegrepen in het arrangement).
                </p>

                <div class="mcta">
                  <button class="btn-primary mcta__btn" type="button" @click="onBook">
                    Opslaan en doorgaan
                  </button>
                </div>
              </div>
            </template>
          </article>
        </section>

        <div class="mtrust">
          <img src="/images/trustpilot.svg" alt="Trustpilot" />
        </div>
      </template>
    </main>

    <CheckoutSiteFooter />

    <CheckoutPolicyChoicePopup
      v-if="policyPopupOpen"
      @choose="applyPolicy"
      @close="policyPopupOpen = false"
    />
  </div>
</template>

<style scoped>
.mpage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--c-white);
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}
.mpage__main {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.mtitle {
  font-size: 34px;
  line-height: 42px;
  font-weight: var(--w-black);
}
.msectiontitle {
  font-size: 24px;
  line-height: 32px;
  font-weight: var(--w-black);
  margin-bottom: 8px;
}
.mhr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
}

/* Samenvatting */
.msum__hotel {
  display: flex;
  gap: 14px;
}
.msum__thumb {
  width: 96px;
  height: 120px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.msum__hotelmain {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.msum__name {
  font-size: 18px;
  font-weight: var(--w-black);
  line-height: 24px;
}
.msum__loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--c-grey);
  font-size: 15px;
}
.msum__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}
.msum__datecell {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.msum__datecell + .msum__datecell {
  border-left: 1px solid var(--c-light-grey);
  align-items: flex-end;
  text-align: right;
}

/* Arrangement */
.mincl {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mincl__item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}
.mincl__item svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}

/* Kamerlijst */
.mrooms {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.mroom {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mroom__name {
  font-size: 20px;
  font-weight: var(--w-black);
}
.mroom__img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.mroom__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mroom__pill {
  border: 1px solid var(--c-light-grey);
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 13px;
  white-space: nowrap;
}

/* Tariefkaarten: horizontale scroll-rij. De rij steekt tot 4px van de
   kaartrand uit (kamerkaart-padding 16px − 12px marge = 4px). */
.mrates {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  margin: 0 -12px;
  padding: 4px 0 8px;
}
.mrate {
  flex: 0 0 78%;
  scroll-snap-align: start;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mrate--on {
  border-color: var(--c-via-black);
  border-width: 2px;
  padding: 15px;
}
.mrate--inactive {
  background: var(--c-surface);
  opacity: 0.75;
}
.mrate__title {
  font-size: 17px;
  font-weight: var(--w-black);
}
.mrate__line {
  font-size: 14px;
  color: var(--c-grey);
  display: flex;
  align-items: center;
  gap: 6px;
}
.mrate__line--green {
  color: var(--c-via-green);
}
.mrate__line--red {
  color: #d64541;
}
.mrate__pricing {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
}
.mrate__prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.mrate__stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid var(--c-light-grey);
  padding-top: 12px;
  margin-top: 4px;
}
.mrate__choose {
  margin-top: 4px;
  padding: 12px 24px;
  font-size: 17px;
}
.mrate__trash {
  width: 38px;
  height: 38px;
  border: 1px solid #d64541;
  border-radius: var(--radius-sm);
  color: #d64541;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 4px;
}
.mrate__max {
  text-align: center;
  margin-top: 6px;
}
/* Prijs + annuleringslabel rechts uitgelijnd naast de kamernaam */
.mdetails__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.mrate__btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--c-via-black);
  color: var(--c-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.mrate__btn:disabled {
  background: var(--c-medium-grey);
  cursor: not-allowed;
}
.mrate__val {
  min-width: 56px;
  text-align: center;
  border: 1px solid var(--c-via-black);
  border-radius: 100px;
  padding: 5px 0;
  font-weight: var(--w-black);
  font-size: 17px;
}

/* Kassabon in de uitgeklapte kamerkaart (room-table varianten) */
.mroomsum {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mroomsum__title {
  font-size: 20px;
  font-weight: var(--w-black);
}
.mroomsum .mcta__btn {
  font-size: 18px;
  padding: 15px 24px;
}

/* Kassabon */
.mdetails {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mdetails__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.mdetails__row--room {
  align-items: flex-start;
}
.mdetails__qty {
  font-weight: 500;
  flex-shrink: 0;
}
.mdetails__main {
  flex: 1;
}
.mtotal {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mtotal__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.mtotal__label {
  font-size: 22px;
  font-weight: var(--w-black);
}
.mtotal__prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.msaved {
  display: flex;
  align-items: center;
  gap: 6px;
}
.msmallprint {
  font-size: 13px;
  line-height: 19px;
  color: var(--c-medium-grey);
}
.mcta {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}
.mcta__btn {
  width: 100%;
  font-size: 20px;
  padding: 18px 32px;
}
.mtrust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-bottom: 8px;
}
.mtrust img {
  height: 88px;
}

/* Forced-choice varianten: room typecards (huidig ViaLuxury mobiel design) */
.mfcroom {
  border: 1px solid var(--c-via-black);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mfcroom__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.mfcroom__name {
  font-size: 21px;
  font-weight: var(--w-black);
  line-height: 28px;
}
.mfcroom__img {
  width: 110px;
  height: 84px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.mfcroom__facilities {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mfcroom__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mfcroom__more {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: underline;
  color: var(--c-via-black);
}
.mfcroom__more svg {
  transition: transform 0.15s ease;
}
.mfcroom__pricing {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mfcroom__pricelabel {
  font-size: 15px;
  font-weight: var(--w-black);
}
.mfcroom__pricerow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.mfcroom__priceleft {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.mfcroom__badge {
  background: #d8f3e7;
  color: var(--c-via-black);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
}
.mfcroom__upgrade {
  color: var(--c-via-orange);
  font-weight: 500;
}
.mfcroom__qty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.mfcroom__stepper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.mrate__btn--sm {
  width: 30px;
  height: 30px;
}
.mfcroom__val {
  min-width: 42px;
  text-align: center;
  border: 1px solid var(--c-via-black);
  border-radius: 100px;
  padding: 3px 0;
  font-weight: var(--w-black);
  font-size: 16px;
}

.mfcblock {
  scroll-margin-top: 16px;
}

/* Annuleringskeuze zonder kader: de twee opties over de hele breedte */
.mpage :deep(.fc) {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* Extra stap (v7): gestapelde extra's + wensen */
.mextras {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mextra {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mextra__title {
  font-size: 17px;
  font-weight: var(--w-black);
  line-height: 24px;
}
.mextra__img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.mextra__pricerow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.mextra__price {
  background: var(--c-via-green);
  color: var(--c-white);
  font-weight: var(--w-black);
  font-size: 15px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.mextra__stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
}
.mwishes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mwishes__field {
  width: 100%;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  resize: vertical;
  font-family: inherit;
  color: var(--c-via-black);
  background: var(--c-white);
}
.mwishes__field:focus {
  outline: none;
  border-color: var(--c-via-black);
}
.mfcnav {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding-bottom: 8px;
}
.mfcnav__back {
  text-decoration: underline;
  color: var(--c-via-black);
}
.mfcnav .mcta {
  width: 100%;
  padding-top: 0;
}
</style>
