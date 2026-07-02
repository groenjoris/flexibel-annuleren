<script setup lang="ts">
// 1c — Room table (Booking.com-style) in the checkout design system.
// Each room type gets two rate rows (non-refundable / free cancellation);
// the reservation panel lives in the last column instead of a sidebar.
// Cancellation policies can't be mixed: selecting a rate moves every other
// selected row to that same rate (one-time explainer popup).
import { rooms as roomsData, hotel, pricing } from '~/data/deal'

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
const totalRows = computed(() => allRows.value.length)
const totalRooms = computed(() => allRows.value.reduce((s, r) => s + r.quantity, 0))
const totalPrice = computed(() => allRows.value.reduce((s, r) => s + r.quantity * r.price, 0))
const totalPeople = computed(() => totalRooms.value * 2)
const totalWas = computed(() => allRows.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const totalSaved = computed(() => totalWas.value - totalPrice.value)
const savedPct = computed(() =>
  totalWas.value ? Math.round((totalSaved.value / totalWas.value) * 100) : 0,
)

// Truncate the description to max 300 characters.
function shortDescription(text: string) {
  return text.length > 300 ? `${text.slice(0, 297)}…` : text
}

// One cancellation policy per booking. Selecting a row deselects the same
// room's other-policy row; selections of other rooms move to their sibling
// row with the chosen policy. No explainer popup needed — the swap is
// directly visible in the table.
function selectRow(row: TableRow) {
  if (row.quantity === 0) row.quantity = 1
  for (const other of allRows.value) {
    if (other === row || other.quantity === 0 || other.rateKey === row.rateKey) continue
    if (other.baseId === row.baseId) {
      other.quantity = 0
    } else {
      const sibling = allRows.value.find(
        (c) => c.baseId === other.baseId && c.rateKey === row.rateKey,
      )
      if (sibling) sibling.quantity += other.quantity
      other.quantity = 0
    }
  }
}

function deselectRow(row: TableRow) {
  row.quantity = 0
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
  <div class="rt-wrap">
    <!-- Datum-widget boven de tabel, met wijzig-link rechts ernaast -->
    <div class="rt__datesbar">
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
          <th class="rt__th rt__th--reserve" />
        </tr>
      </thead>

      <tbody v-for="(room, roomIndex) in tableRooms" :key="room.id">
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

          <!-- Je opties -->
          <td class="rt__td rt__options">
            <p class="rt__opt">
              <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Dagelijks ontbijtbuffet
            </p>
            <p class="rt__opt">
              <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Gebruik van wellness en zwembad
            </p>
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

          <!-- Kies kamers: selecteer-knop; daarna verschijnt de hoeveelheid-dropdown -->
          <td class="rt__td rt__select">
            <button
              v-if="row.quantity === 0"
              class="rt__selectbtn"
              type="button"
              @click="selectRow(row)"
            >
              Selecteer
            </button>
            <template v-else>
              <button class="rt__selectbtn rt__selectbtn--on" type="button" @click="deselectRow(row)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                Gekozen
              </button>
              <select
                class="rt__dropdown"
                :value="row.quantity"
                :aria-label="`Aantal kamers ${room.name}`"
                @change="row.quantity = Number(($event.target as HTMLSelectElement).value)"
              >
                <!-- Het gesloten veld toont alleen het getal: het geselecteerde
                     option-label bevat geen bedrag, de rest in het menu wel. -->
                <option v-for="n in 5" :key="n" :value="n">{{ row.quantity === n ? n : `${n} (€${n * row.price})` }}</option>
              </select>
            </template>
          </td>

          <!-- Reserveringspaneel (één cel over de hele tabel) -->
          <td
            v-if="roomIndex === 0 && rowIndex === 0"
            class="rt__td rt__reserve"
            :rowspan="totalRows"
          >
            <div class="rt__reserve-inner">
            <div v-if="totalRooms > 0" class="rt__totals">
              <p class="t-body">{{ totalRooms }} {{ totalRooms === 1 ? 'kamer' : 'kamers' }} voor 2 nachten</p>
              <p class="t-body">Max {{ totalPeople }} personen</p>
              <div class="rt__pricerow">
                <CheckoutPriceTag :value="totalWas" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
                <CheckoutPriceTag :value="totalPrice" :show-cents="false" size="lg" bold color="var(--c-via-orange)" />
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
            <p class="t-caption c-mgrey">Er wordt nog niets in rekening gebracht</p>

            <div v-if="totalRooms > 0" class="rt__includes">
              <p class="t-body t-bold">Jouw arrangement bevat</p>
              <p v-for="item in arrangementIncludes" :key="item" class="rt__inc t-body">
                <svg class="rt__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ item }}
              </p>
            </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
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
.rt__datesbar .rt__dates {
  min-width: 300px;
}
.rt {
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  overflow: hidden;
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
  font-size: var(--t-body-lg);
  font-weight: var(--w-black);
  padding: 14px 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}
.rt__th--type { width: 280px; }
.rt__th--guests { width: 90px; }
.rt__th--options { width: 22%; }
.rt__th--select { width: 96px; }
.rt__th--reserve { width: 310px; }
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

/* Selecteer-knop + hoeveelheid-dropdown */
.rt__selectbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  background: var(--c-via-orange);
  color: var(--c-white);
  font-size: var(--t-body);
  font-weight: var(--w-black);
  transition: background 0.15s ease;
}
.rt__selectbtn:hover { background: var(--c-via-orange-hover); }
.rt__selectbtn--on {
  background: var(--c-via-green);
}
.rt__selectbtn--on:hover { background: #2db07d; }
.rt__dropdown {
  margin-top: 8px;
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

/* Reserveringspaneel: absoluut gepositioneerd zodat de inhoud de
   rijhoogtes van de andere kolommen nooit beïnvloedt. */
.rt__reserve {
  background: var(--c-surface);
  position: relative;
  padding: 0;
}
.rt__reserve-inner {
  position: absolute;
  inset: 0;
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
