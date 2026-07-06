<script setup lang="ts">
import type { Room, Hotel } from '~/data/deal'
import type { CancelChoice } from '~/data/cancellation'

const props = defineProps<{
  hotel: Hotel
  rooms: Room[]
  includes: string[]
  pricing: { flexibilityPerRoom: number; bookingFee: number }
  trustpilot: { score: string; outOf: string }
  selected: CancelChoice
  showFlexLine?: boolean // hide when cancellation is baked into the room price
  ctaDisabled?: boolean // e.g. forced-choice step: continue only after choosing
  ctaLabel?: string // default "Opslaan en doorgaan"; last step uses "Boek nu"
  // v7: losse extra's (wijn, lunch, high tea) die meetellen in het totaal
  extras?: { id: string; title: string; price: number; quantity: number }[]
}>()
const emit = defineEmits<{ cta: [] }>()

const selectedRooms = computed(() => props.rooms.filter((r) => r.quantity > 0))
const totalRooms = computed(() => selectedRooms.value.reduce((s, r) => s + r.quantity, 0))
const roomsNow = computed(() => selectedRooms.value.reduce((s, r) => s + r.quantity * r.priceNow, 0))
const roomsWas = computed(() => selectedRooms.value.reduce((s, r) => s + r.quantity * r.priceWas, 0))
const flexibilityFee = computed(() =>
  props.selected === 'flexible' ? props.pricing.flexibilityPerRoom * totalRooms.value : 0,
)
// Extra's tellen mee in beide totalen (geen korting op extra's).
const selectedExtras = computed(() => (props.extras ?? []).filter((e) => e.quantity > 0))
const extrasTotal = computed(() =>
  selectedExtras.value.reduce((s, e) => s + e.quantity * e.price, 0),
)
const total = computed(
  () => roomsNow.value + extrasTotal.value + flexibilityFee.value + props.pricing.bookingFee,
)
const wasTotal = computed(
  () => roomsWas.value + extrasTotal.value + flexibilityFee.value + props.pricing.bookingFee,
)
const saved = computed(() => roomsWas.value - roomsNow.value)
const savedPct = computed(() => (roomsWas.value ? Math.round((saved.value / roomsWas.value) * 100) : 0))
</script>

<template>
  <aside class="summary card">
    <!-- Hotel -->
    <div class="summary__hotel">
      <img class="summary__thumb" :src="hotel.thumb" :alt="hotel.name" />
      <div>
        <p class="t-body t-bold">{{ hotel.name }}</p>
        <p class="summary__loc t-body c-mgrey">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" /></svg>
          {{ hotel.location }}
        </p>
      </div>
    </div>

    <!-- Dates -->
    <div class="summary__dates">
      <div class="summary__datecell">
        <p class="t-caption c-mgrey">{{ hotel.checkInLabel }}</p>
        <p class="t-body t-bold">{{ hotel.checkInDate }}</p>
      </div>
      <div class="summary__datecell">
        <p class="t-caption c-mgrey">{{ hotel.checkOutLabel }}</p>
        <p class="t-body t-bold">{{ hotel.checkOutDate }}</p>
      </div>
    </div>
    <a class="summary__link summary__link--center" href="#">Wijzig data</a>

    <hr class="summary__hr" />

    <!-- Includes -->
    <div class="summary__block">
      <p class="t-body t-bold">Inbegrepen in het arrangement</p>
      <ul class="summary__includes">
        <li v-for="item in includes" :key="item" class="summary__inc">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="t-body">{{ item }}</span>
        </li>
      </ul>
      <a class="summary__link" href="#">Bekijk het volledige arrangement</a>
    </div>

    <hr class="summary__hr" />

    <!-- Details -->
    <div class="summary__block">
      <p class="t-body t-bold">Details</p>
      <div v-for="room in selectedRooms" :key="room.id" class="summary__row summary__row--room">
        <span class="summary__qty">{{ room.quantity }}</span>
        <div class="summary__rowmain">
          <p class="t-body">Arrangement voor {{ room.maxPeople }} personen</p>
          <p class="t-caption c-mgrey">{{ room.roomName }}<template v-if="room.cancelLabel"> · {{ room.cancelLabel }}</template></p>
        </div>
        <CheckoutPriceTag :value="room.quantity * room.priceNow" :show-cents="false" size="sm" />
      </div>

      <div v-for="extra in selectedExtras" :key="extra.id" class="summary__row summary__row--room">
        <span class="summary__qty">{{ extra.quantity }}</span>
        <div class="summary__rowmain">
          <p class="t-body">{{ extra.title }}</p>
        </div>
        <CheckoutPriceTag :value="extra.quantity * extra.price" :show-cents="(extra.quantity * extra.price) % 1 !== 0" size="sm" />
      </div>

      <div v-if="showFlexLine !== false" class="summary__row">
        <span class="t-body">Flexibel annuleren</span>
        <CheckoutPriceTag v-if="flexibilityFee > 0" :value="flexibilityFee" :show-cents="false" size="sm" />
        <span v-else class="t-body c-mgrey">Inbegrepen</span>
      </div>

      <div class="summary__row">
        <span class="t-body">Reserveringskosten</span>
        <CheckoutPriceTag :value="pricing.bookingFee" size="sm" />
      </div>
    </div>

    <hr class="summary__hr" />

    <!-- Total -->
    <div class="summary__total">
      <div class="summary__totalrow">
        <span class="t-h2">Totaal</span>
        <div class="summary__totalprices">
          <CheckoutPriceTag :value="wasTotal" :show-cents="false" size="sm" strike color="var(--c-medium-grey)" />
          <CheckoutPriceTag :value="total" size="lg" bold color="var(--c-via-green)" />
        </div>
      </div>
      <p class="t-caption c-mgrey">Prijs voor {{ totalRooms * 2 }} personen, {{ hotel.nights }} nachten</p>
    </div>

    <div class="summary__saved">
      <CheckoutSmileyIcon />
      <span class="t-body">Je hebt al</span>
      <CheckoutPriceTag :value="saved" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
      <span class="t-caption c-grey">({{ savedPct }}%)</span>
      <span class="t-body">bespaard.</span>
    </div>

    <p class="summary__disclaimer t-caption c-mgrey">
      Bij aankomst in het hotel betaal je enkel de eventuele toeristenbelasting, borg of parkeerkosten (indien
      inbegrepen in het pakket).
    </p>

    <button class="btn-primary" type="button" :disabled="ctaDisabled" @click="emit('cta')">
      {{ ctaDisabled ? 'Maak eerst een keuze' : ctaLabel ?? 'Opslaan en doorgaan' }}
    </button>

    <div class="summary__trust">
      <img src="/images/trustpilot.svg" alt="Trustpilot" />
      <span class="t-body t-bold">{{ trustpilot.score }}/{{ trustpilot.outOf }}</span>
    </div>
  </aside>
</template>

<style scoped>
.summary {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 24px;
}
.summary__hotel {
  display: flex;
  gap: 12px;
  align-items: center;
}
.summary__thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.summary__loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.summary__loc svg { color: var(--c-medium-grey); }
.summary__dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.summary__datecell {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary__datecell + .summary__datecell {
  border-left: 1px solid var(--c-light-grey);
}
.summary__link {
  color: var(--c-via-black);
  font-weight: 500;
  font-size: var(--t-body);
  text-decoration: underline;
  align-self: flex-start;
}
.summary__link--center {
  align-self: center;
}
.summary__hr {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 4px 0;
}
.summary__block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary__includes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.summary__inc {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--c-via-black);
}
.summary__inc svg { color: var(--c-via-green); flex-shrink: 0; }
.summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.summary__row--room {
  align-items: flex-start;
}
.summary__qty {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  background: var(--c-surface);
  border: 1px solid var(--c-light-grey);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--t-caption);
  font-weight: var(--w-black);
  flex-shrink: 0;
}
.summary__rowmain {
  flex: 1;
}
.summary__total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary__totalrow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.summary__totalprices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.summary__saved {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--c-via-black);
}
.summary__disclaimer {
  color: var(--c-medium-grey);
}
.summary__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.summary__trust img { height: 40px; }
</style>
