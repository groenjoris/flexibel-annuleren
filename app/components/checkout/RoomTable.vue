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

// One cancellation policy per booking (same rule as 1a/1b).
const mixPopupOpen = ref(false)
const mixExplained = ref(false)
function setRowQty(row: TableRow, qty: number) {
  row.quantity = qty
  if (qty === 0) return
  let switched = false
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
    switched = true
  }
  if (switched && !mixExplained.value) {
    mixExplained.value = true
    mixPopupOpen.value = true
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
            <p v-if="row.scarcity" class="rt__scarcity">{{ row.scarcity }}</p>
          </td>

          <!-- Kies kamers -->
          <td class="rt__td rt__select">
            <select
              class="rt__dropdown"
              :value="row.quantity"
              :aria-label="`Aantal kamers ${room.name}`"
              @change="setRowQty(row, Number(($event.target as HTMLSelectElement).value))"
            >
              <!-- Het gesloten veld toont alleen het getal: het geselecteerde
                   option-label bevat geen bedrag, de rest in het menu wel. -->
              <option :value="0">0</option>
              <option v-for="n in 5" :key="n" :value="n">{{ row.quantity === n ? n : `${n} (€${n * row.price})` }}</option>
            </select>
          </td>

          <!-- Reserveringspaneel (één cel over de hele tabel) -->
          <td
            v-if="roomIndex === 0 && rowIndex === 0"
            class="rt__td rt__reserve"
            :rowspan="totalRows"
          >
            <div class="rt__reserve-inner">
            <div class="rt__dates">
              <div>
                <p class="t-caption c-mgrey">Inchecken</p>
                <p class="t-body t-bold">{{ hotel.checkInDate }}</p>
              </div>
              <div>
                <p class="t-caption c-mgrey">Uitchecken</p>
                <p class="t-body t-bold">{{ hotel.checkOutDate }}</p>
              </div>
            </div>

            <div v-if="totalRooms > 0" class="rt__totals">
              <p class="t-body t-bold">{{ totalRooms }} {{ totalRooms === 1 ? 'kamer' : 'kamers' }} voor 2 nachten</p>
              <p class="t-body c-grey">Max {{ totalPeople }} personen</p>
              <CheckoutPriceTag :value="totalPrice" :show-cents="false" size="lg" bold color="var(--c-via-orange)" />
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

    <CheckoutMixInfoPopup v-if="mixPopupOpen" @close="mixPopupOpen = false" />
  </div>
</template>

<style scoped>
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
  border-top: 4px solid var(--c-via-black);
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
  font-size: var(--t-body);
  font-weight: 500;
  color: #d32f2f;
  margin-top: 4px;
}

/* Dropdown */
.rt__dropdown {
  border: 1px solid var(--c-dark-grey);
  border-radius: var(--radius-sm);
  padding: 8px 6px;
  font-family: inherit;
  font-size: var(--t-body);
  background: var(--c-white);
  width: 64px;
}

/* Reserveringspaneel */
.rt__reserve {
  background: var(--c-surface);
}
.rt__reserve-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rt__dates {
  display: flex;
  gap: 20px;
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
