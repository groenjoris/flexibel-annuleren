<script setup lang="ts">
// JOURNEY 1 — kopie van concept 1e (Room table hybrid), zodat we deze
// los kunnen optimaliseren zonder het originele concept te raken.
// Basis: 1c — Room table (Booking.com-style) in the checkout design system.
// Each room type gets two rate rows (non-refundable / free cancellation);
// the reservation panel lives in the last column instead of a sidebar.
// Cancellation policies can't be mixed: selecting a rate moves every other
// selected row to that same rate (one-time explainer popup).
import { rooms as roomsData, hotel, pricing } from '~/data/deal'

const props = withDefaults(defineProps<{
  // 1d: hide the built-in reservation column (the sidebar takes its place)
  showReserve?: boolean
  // 1d: start with the cheapest room preselected
  initialCheapest?: boolean
  // 1e: hybrid — grey header, white panel, hotel above the table,
  // includes always visible, booking costs in the final price
  hybrid?: boolean
}>(), {
  showReserve: true,
  initialCheapest: false,
  hybrid: true, // journey draait standaard in hybride (1e) modus
})

const emit = defineEmits<{
  'update:selection': [rows: {
    baseId: string
    rateKey: 'nonrefundable' | 'flexible'
    price: number
    priceWas: number
    quantity: number
  }[]]
}>()

interface TableRow {
  id: string
  baseId: string
  rateKey: 'nonrefundable' | 'flexible'
  priceWas: number
  price: number
  quantity: number
  scarcity?: string
}

interface TableRoom {
  id: string
  name: string
  image: string
  description: string
  facilities: { label: string; icon: string }[]
  rows: TableRow[]
}

const tableRooms = reactive<TableRoom[]>(
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

const allRows = computed(() => tableRooms.flatMap((room) => room.rows))

// 1d: start with the cheapest row selected.
if (props.initialCheapest) {
  const cheapest = allRows.value.reduce((min, r) => (r.price < min.price ? r : min))
  cheapest.quantity = 1
}

// Report every selection change to the parent (drives the sidebar in 1d).
watch(
  allRows,
  (rows) => {
    emit(
      'update:selection',
      rows
        .filter((r) => r.quantity > 0)
        .map(({ baseId, rateKey, price, priceWas, quantity }) => ({
          baseId,
          rateKey,
          price,
          priceWas,
          quantity,
        })),
    )
  },
  { deep: true, immediate: true },
)
const totalRows = computed(() => allRows.value.length)
const totalRooms = computed(() => allRows.value.reduce((s, r) => s + r.quantity, 0))
const totalPrice = computed(() => allRows.value.reduce((s, r) => s + r.quantity * r.price, 0))
const totalPeople = computed(() => totalRooms.value * 2)
const totalWas = computed(() => allRows.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const totalSaved = computed(() => totalWas.value - totalPrice.value)
const savedPct = computed(() =>
  totalWas.value ? Math.round((totalSaved.value / totalWas.value) * 100) : 0,
)
// Journey: zelfde prijsopbouw als stap 0 — boekingskosten €27,50 in de eindprijs.
const BOOKING_FEE = 27.5
const displayTotal = computed(() => totalPrice.value + (props.hybrid ? BOOKING_FEE : 0))
const displayWas = computed(() => totalWas.value + (props.hybrid ? BOOKING_FEE : 0))
const selectedRows = computed(() => allRows.value.filter((r) => r.quantity > 0))
function roomNameFor(baseId: string) {
  return tableRooms.find((r) => r.id === baseId)?.name ?? ''
}

// Truncate the description to max 300 characters.
function shortDescription(text: string) {
  return text.length > 300 ? `${text.slice(0, 297)}…` : text
}

// One cancellation policy per booking. Once a policy has a selection, the
// selectors of the other policy turn inactive; clicking one anyway opens a
// popup that lets the guest pick the policy for ALL rooms.
const activePolicy = computed<'nonrefundable' | 'flexible' | null>(() => {
  const selected = allRows.value.find((r) => r.quantity > 0)
  return selected ? selected.rateKey : null
})

function isInactive(row: TableRow) {
  return activePolicy.value !== null && row.rateKey !== activePolicy.value
}

const policyPopupOpen = ref(false)

function onDropdownMousedown(row: TableRow, event: Event) {
  if (!isInactive(row)) return
  // Laat Tab e.d. met rust; alleen interacties die het menu zouden openen.
  if (event instanceof KeyboardEvent) {
    const opens = ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)
    if (!opens) return
  }
  event.preventDefault()
  policyPopupOpen.value = true
}

// Popup choice: switch every selection to the chosen policy (or keep as is).
function applyPolicy(policy: 'flexible' | 'nonrefundable') {
  policyPopupOpen.value = false
  if (activePolicy.value === policy) return
  for (const row of allRows.value) {
    if (row.quantity === 0 || row.rateKey === policy) continue
    const sibling = allRows.value.find((c) => c.baseId === row.baseId && c.rateKey === policy)
    if (sibling) sibling.quantity += row.quantity
    row.quantity = 0
  }
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
</script>

<template>
  <div class="rt-wrap" :class="{ 'rt-wrap--hybrid': hybrid }">
    <!-- Datum-widget boven de tabel, met wijzig-link rechts ernaast
         (vervalt in 1d: de sidebar toont de data al) -->
    <div v-if="showReserve" class="rt__datesbar">
      <!-- 1e: hotel-thumb + naam links van de data -->
      <div v-if="hybrid" class="rt__hotel">
        <img class="rt__hotelthumb" :src="hotel.thumb" :alt="hotel.name" />
        <p class="t-body t-bold">{{ hotel.name }}</p>
      </div>
      <div class="rt__dates">
        <div class="rt__datecell">
          <p class="t-caption c-mgrey">Inchecken</p>
          <p class="t-body t-bold">{{ hotel.checkInDate }}</p>
        </div>
        <div class="rt__datecell">
          <p class="t-caption c-mgrey">Uitchecken</p>
          <p class="t-body t-bold">{{ hotel.checkOutDate }}</p>
        </div>
      </div>
      <a class="rt__changedates t-body" href="#">Wijzig data</a>
    </div>

    <div class="rt">
    <table class="rt__table">
      <thead>
        <tr>
          <th class="rt__th rt__th--type">Kamertype</th>
          <th class="rt__th rt__th--guests">Aantal gasten</th>
          <th class="rt__th">Prijs voor 2 nachten</th>
          <th class="rt__th rt__th--options">Je opties</th>
          <th class="rt__th rt__th--select">Kies kamers</th>
          <th v-if="showReserve" class="rt__th rt__th--reserve" />
        </tr>
      </thead>

      <!-- Eén tbody: het rowspan-paneel in de rechterkolom mag niet over een
           tbody-grens heen, anders stopt het bij het tweede kamertype. -->
      <tbody>
        <template v-for="(room, roomIndex) in tableRooms" :key="room.id">
        <tr
          v-for="(row, rowIndex) in room.rows"
          :key="row.id"
          :class="{ 'rt__tr--divide': roomIndex > 0 && rowIndex === 0 }"
        >
          <!-- Kamertype (één cel per kamertype) -->
          <td v-if="rowIndex === 0" class="rt__td" :rowspan="room.rows.length">
            <div class="rt__type">
              <button class="rt__name" type="button">{{ room.name }}</button>
              <img class="rt__img" :src="room.image" :alt="room.name" />
              <p class="rt__desc t-body c-grey">{{ shortDescription(room.description) }}</p>
              <div class="rt__facilities">
                <CheckoutFacilityItem
                  v-for="f in room.facilities"
                  :key="f.label"
                  :label="f.label"
                  :icon="f.icon"
                />
              </div>
            </div>
          </td>

          <!-- Aantal gasten -->
          <td class="rt__td rt__guests">
            <svg width="28" height="20" viewBox="0 0 34 24" fill="currentColor" aria-label="2 personen">
              <circle cx="9" cy="6" r="4" />
              <path d="M2 22c0-4.4 3.1-8 7-8s7 3.6 7 8z" />
              <circle cx="24" cy="6" r="4" />
              <path d="M17 22c0-4.4 3.1-8 7-8s7 3.6 7 8z" />
            </svg>
          </td>

          <!-- Prijs -->
          <td class="rt__td rt__price">
            <CheckoutPriceTag :value="row.priceWas" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
            <CheckoutPriceTag :value="row.price" :show-cents="false" size="md" bold color="var(--c-via-orange)" />
          </td>

          <!-- Je opties (1e: zonder de vaste vinkjes, begint met de voorwaarde) -->
          <td class="rt__td rt__options">
            <template v-if="!hybrid">
              <p class="rt__opt">
                <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                Dagelijks ontbijtbuffet
              </p>
              <p class="rt__opt">
                <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                Gebruik van wellness en zwembad
              </p>
            </template>
            <template v-if="row.rateKey === 'flexible'">
              <p class="rt__opt rt__opt--green">
                <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                Gratis annuleren vóór 17 mei
              </p>
            </template>
            <template v-else>
              <p class="rt__opt">
                <svg class="rt__check rt__check--nonref" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M8 8l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                Niet-terugbetaalbaar
              </p>
              <p class="rt__optsub">Je betaalt het volledige bedrag, ook als je annuleert.</p>
            </template>
            <p v-if="row.scarcity" class="rt__scarcity">
              <span class="rt__bullet" aria-hidden="true">•</span>
              {{ row.scarcity }}
            </p>
          </td>

          <!-- Kies kamers: dropdown 0-5. Bij een selectie van de andere policy
               wordt de dropdown inactief; klikken opent dan de keuze-popup. -->
          <td class="rt__td rt__select">
            <select
              class="rt__dropdown"
              :class="{ 'rt__dropdown--inactive': isInactive(row) }"
              :value="row.quantity"
              :aria-label="`Aantal kamers ${room.name}`"
              @mousedown="onDropdownMousedown(row, $event)"
              @keydown="onDropdownMousedown(row, $event)"
              @change="row.quantity = Number(($event.target as HTMLSelectElement).value)"
            >
              <!-- Het gesloten veld toont alleen het getal: het geselecteerde
                   option-label bevat geen bedrag, de rest in het menu wel. -->
              <option :value="0">0</option>
              <option v-for="n in 5" :key="n" :value="n">{{ row.quantity === n ? n : `${n} (€${n * row.price})` }}</option>
            </select>
          </td>

          <!-- Reserveringspaneel (één cel over de hele tabel) -->
          <td
            v-if="showReserve && roomIndex === 0 && rowIndex === 0"
            class="rt__td rt__reserve"
            :rowspan="totalRows"
          >
            <div class="rt__reserve-inner">
            <div class="rt__reserve-sticky">
            <div v-if="totalRooms > 0" class="rt__totals">
              <!-- Zelfde prijsopbouw als stap 0 (kalenderpagina) -->
              <div class="rt__details">
                <p class="t-body t-bold">Details</p>
                <div v-for="row in selectedRows" :key="row.id" class="rt__drow rt__drow--room">
                  <span class="rt__dqty t-body">{{ row.quantity }}x</span>
                  <div class="rt__dmain">
                    <p class="t-body t-bold">Arrangement</p>
                    <p class="t-caption c-mgrey">{{ roomNameFor(row.baseId) }}</p>
                  </div>
                  <CheckoutPriceTag :value="row.quantity * row.price" :show-cents="false" size="sm" />
                </div>
                <div class="rt__drow">
                  <span class="t-body">Boekingskosten</span>
                  <CheckoutPriceTag :value="BOOKING_FEE" size="sm" />
                </div>
              </div>

              <hr class="rt__hr" />

              <div class="rt__totalblock">
                <div class="rt__totalrow">
                  <span class="t-h2">Totaalprijs</span>
                  <div class="rt__totalprices">
                    <CheckoutPriceTag :value="displayWas" size="sm" strike color="var(--c-medium-grey)" />
                    <CheckoutPriceTag :value="displayTotal" size="lg" bold color="var(--c-via-green)" />
                  </div>
                </div>
                <p class="t-caption c-mgrey">{{ totalRooms }} {{ totalRooms === 1 ? 'kamer' : 'kamers' }} voor 2 nachten</p>
              </div>

              <p class="rt__saved">
                <CheckoutSmileyIcon />
                <span class="t-body">Je hebt al</span>
                <CheckoutPriceTag :value="totalSaved" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
                <span class="t-caption c-grey">({{ savedPct }}%)</span>
                <span class="t-body">bespaard.</span>
              </p>
              <p class="rt__smallprint">
                Je dient ter plaatse alleen de lokale belastingen, eventuele
                service-/administratiekosten van het hotel en parkeerkosten te betalen
                (indien dit niet is inbegrepen in het arrangement).
              </p>
            </div>

            <button class="btn-primary rt__book" type="button">Ik ga boeken</button>

            <!-- 1e: arrangement-includes staan er vanaf het begin -->
            <div v-if="hybrid || totalRooms > 0" class="rt__includes">
              <p class="t-body t-bold">Jouw arrangement bevat</p>
              <p v-for="item in arrangementIncludes" :key="item" class="rt__inc t-body">
                <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
            </div>
            </div>
            </div>
          </td>
        </tr>
        </template>
      </tbody>
    </table>
    </div>

    <CheckoutPolicyChoicePopup
      v-if="policyPopupOpen"
      @choose="applyPolicy"
      @close="policyPopupOpen = false"
    />
  </div>
</template>

<style scoped>
.rt-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rt__datesbar {
  display: flex;
  align-items: center;
  gap: 20px;
}
.rt__hotel {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
}
.rt__hotelthumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

/* 1e hybrid: grijze header, wit paneel, geen schaduwen */
.rt-wrap--hybrid .rt__th {
  background: var(--c-surface);
  color: var(--c-via-black);
  border-right-color: var(--c-light-grey);
}
.rt-wrap--hybrid .rt__reserve {
  background: var(--c-white);
}
.rt__datesbar .rt__dates {
  min-width: 300px;
}
.rt {
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  /* geen overflow:hidden — dat zou de sticky header breken */
}
.rt__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.rt__th {
  background: #00675f; /* donkergroene tabelheader */
  color: var(--c-white);
  text-align: left;
  vertical-align: top;
  font-size: var(--t-body-lg);
  font-weight: var(--w-black);
  padding: 14px 16px;
  /* Blend tussen headergroen (#00675F) en het grijs van de tabellijnen */
  border-right: 1px solid #6ca09c;
  /* Header blijft aan de bovenkant van het venster plakken bij scrollen */
  position: sticky;
  top: 0;
  z-index: 10;
}
.rt__th:first-child { border-top-left-radius: var(--radius); }
.rt__th:last-child { border-top-right-radius: var(--radius); }
.rt__th--type { width: 280px; }
.rt__th--guests { width: 90px; }
.rt__th--options { width: 22%; }
.rt__th--select { width: 96px; }
/* Rechterkolom: groene headercel (band loopt door), daaronder één
   doorlopend grijs paneel zonder dividers. */
.rt__th--reserve {
  width: 310px;
  border-right: none;
}
.rt__td {
  border: 1px solid var(--c-light-grey);
  padding: 16px;
  vertical-align: top;
}
/* Dikke divider tussen kamertypes */
.rt__tr--divide .rt__td {
  border-top: 3px solid var(--c-light-grey);
}

/* Kamertype */
.rt__type {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rt__name {
  font-size: 16px;
  line-height: 22px;
  font-weight: var(--w-black);
  color: var(--c-via-black);
  text-align: left;
  text-decoration: underline;
  cursor: pointer;
}
.rt__name:hover { color: var(--c-via-orange); }
.rt__img {
  width: 100%;
  border-radius: var(--radius-sm);
  aspect-ratio: 286 / 190;
  object-fit: cover;
}
.rt__desc {
  font-size: var(--t-body);
  line-height: var(--lh-body);
}
.rt__facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Gasten */
.rt__guests svg { color: var(--c-via-black); }

/* Prijs */
.rt__price {
  white-space: nowrap;
}
.rt__price .price { margin-right: 6px; }

/* Opties */
.rt__opt {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: var(--t-body);
  line-height: var(--lh-body);
  font-weight: var(--w-black);
  color: var(--c-via-black);
  margin-bottom: 6px;
}
.rt__opt--green { color: var(--c-via-green); }
.rt__check {
  color: var(--c-via-green);
  flex-shrink: 0;
  margin-top: 3px;
}
.rt__check--nonref { color: var(--c-dark-grey); }
.rt__optsub {
  font-size: var(--t-body);
  color: var(--c-dark-grey);
  margin: -2px 0 6px 20px;
}
.rt__scarcity {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: var(--t-body);
  font-weight: 500;
  color: #d32f2f;
  margin-top: 4px;
}
/* Bullet even breed als de optie-iconen zodat de teksten uitlijnen */
.rt__bullet {
  width: 14px;
  flex-shrink: 0;
  text-align: center;
}

/* Hoeveelheid-dropdown */
.rt__dropdown {
  border: 1px solid var(--c-dark-grey);
  border-radius: var(--radius-sm);
  padding: 8px 20px 8px 8px;
  font-family: inherit;
  font-size: var(--t-body);
  background-color: var(--c-white);
  width: 52px;
  /* Eigen chevron zodat er 4px marge tot de rechterrand zit */
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%231a1e1e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
}
/* Andere policy geselecteerd: uitgegrijsd, klik opent de keuze-popup */
.rt__dropdown--inactive {
  border-color: var(--c-light-grey);
  color: var(--c-medium-grey);
  background-color: var(--c-surface);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23888989' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  cursor: not-allowed;
}

/* Reserveringspaneel: absoluut gepositioneerd zodat de inhoud de
   rijhoogtes van de andere kolommen nooit beïnvloedt. */
.rt__reserve {
  background: var(--c-surface);
  position: relative;
  padding: 0;
  border-top: none; /* geen divider tussen headercel en paneel */
}
.rt__reserve-inner {
  /* Absolute shell: vult de kolom zonder de rijhoogtes te beïnvloeden */
  position: absolute;
  inset: 0;
}
.rt__reserve-sticky {
  /* Inhoud plakt onder de sticky header zodat de CTA zichtbaar blijft */
  position: sticky;
  top: 68px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rt__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-white);
}
.rt__datecell {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rt__datecell + .rt__datecell {
  border-left: 1px solid var(--c-light-grey);
}
.rt__changedates {
  color: var(--c-via-black);
  text-decoration: underline;
  white-space: nowrap;
}
.rt__pricerow {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 2px;
}
.rt__totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rt__details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rt__drow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.rt__drow--room {
  align-items: flex-start;
}
.rt__dqty {
  width: 24px;
  flex-shrink: 0;
}
.rt__dmain {
  flex: 1;
}
.rt__hr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
}
.rt__totalblock {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rt__totalrow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 8px;
}
.rt__totalprices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.rt__saved {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: var(--c-via-black);
  margin-top: 2px;
}
.rt__smallprint {
  font-size: 11px;
  line-height: 15px;
  color: var(--c-medium-grey);
  margin-top: 4px;
}
.rt__book {
  padding: 16px 20px;
}
.rt__includes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--c-light-grey);
  padding-top: 14px;
}
.rt__inc {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
</style>
