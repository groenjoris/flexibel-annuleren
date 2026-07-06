<script setup lang="ts">
// MOBIELE site — kamer kiezen (room-table varianten 1/2/3/4).
// Geen tabel maar een lijst: per kamer foto, omschrijving en amenities,
// met daaronder een horizontale rij tariefkaarten (Booking.com-patroon,
// in de ViaLuxury-stijl). Boven de kamers een samenvatting van de boeking.
import { hotel, trustpilot, rooms as roomsData, dealName, pricing } from '~/data/deal'
import { journeyKey, JOURNEY_WAS_FACTOR } from '~/data/journeys'

const route = useRoute()
const jv = computed(() => journeyKey(route.params.v))
const isCardsVariant = computed(() => jv.value === '5' || jv.value === '6' || jv.value === '7')

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
    rows: [
      {
        id: `${r.id}-nonref`,
        baseId: r.id,
        rateKey: 'nonrefundable',
        priceWas: r.priceWas,
        price: r.priceNow,
        quantity: 0,
        scarcity: r.id === 'junior' ? 'Nog 2 kamers over' : undefined,
      },
      {
        id: `${r.id}-flex`,
        baseId: r.id,
        rateKey: 'flexible',
        priceWas: r.priceWas,
        price: r.priceNow + pricing.flexibilityPerRoom,
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
</script>

<template>
  <div class="mpage">
    <CheckoutMobileHeader :step="2" />

    <main class="mpage__main">
      <!-- Forced-choice varianten: mobiele versie volgt -->
      <template v-if="isCardsVariant">
        <h1 class="mtitle">Controleer je boeking</h1>
        <p class="t-body c-grey">
          De mobiele versie van deze variant volgt nog. Bekijk voorlopig de
          desktopversie via het startscherm.
        </p>
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
                  </p>
                  <p class="t-caption c-mgrey">Prijs voor 2 nachten + compleet arrangement</p>
                </div>

                <div class="mrate__stepper">
                  <button
                    class="mrate__btn"
                    type="button"
                    :disabled="row.quantity === 0"
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
                </div>
              </div>
            </div>
          </article>
        </section>

        <hr class="mhr" />

        <!-- Kassabon -->
        <section class="mdetails">
          <template v-if="totalRooms > 0">
            <h2 class="msectiontitle">Details</h2>
            <div v-for="row in selectedRows" :key="row.id" class="mdetails__row mdetails__row--room">
              <span class="mdetails__qty">{{ row.quantity }}x</span>
              <div class="mdetails__main">
                <p class="t-body t-bold">Arrangement</p>
                <p class="t-caption c-mgrey">{{ roomNameFor(row.baseId) }}</p>
                <p v-if="row.rateKey === 'flexible'" class="t-caption c-green">Gratis annuleren</p>
              </div>
              <CheckoutPriceTag :value="row.quantity * rowPrice(row)" :show-cents="false" size="sm" />
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
          </template>

          <div class="mcta">
            <button class="btn-primary mcta__btn" type="button" :disabled="totalRooms === 0" @click="onBook">
              {{ totalRooms === 0 ? 'Selecteer een kamer' : 'Opslaan en doorgaan' }}
            </button>
          </div>

          <div class="mtrust">
            <img src="/images/trustpilot.svg" alt="Trustpilot" />
            <span class="t-body t-bold">{{ trustpilot.score }}/{{ trustpilot.outOf }}</span>
          </div>
        </section>
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

/* Tariefkaarten: horizontale scroll-rij */
.mrates {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  margin: 0 -16px;
  padding: 4px 16px 8px;
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
  border-top: 1px solid var(--c-light-grey);
  padding-top: 12px;
  margin-top: 4px;
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
  height: 44px;
}
</style>
