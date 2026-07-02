<script setup lang="ts">
import type { Room } from '~/data/deal'

const props = defineProps<{
  room: Room
  rateLabel?: string // e.g. "Niet-restitueerbaar" / "Flexibel annuleren" (booking variant)
  subtitle?: string // cancellation policy line under the title (booking variant)
  rates?: { nonRef: number; flex: number; deadline: string } // in-card rate switch
  selectedRate?: 'nonrefundable' | 'flexible'
}>()
const emit = defineEmits<{
  'update:quantity': [value: number]
  'update:rate': [value: 'nonrefundable' | 'flexible']
}>()

// Per-room price = selected rate (in-card switch) or the plain room price.
const perRoomPrice = computed(() =>
  props.rates
    ? props.selectedRate === 'flexible'
      ? props.rates.flex
      : props.rates.nonRef
    : props.room.priceNow,
)
// Only show the switch once at least 1 room is selected; at 0 show the cheapest price.
const showSwitch = computed(() => !!props.rates && props.room.quantity > 0)

// "Jouw voordeel" derives from the strikethrough vs the effective price.
// In the in-card variant it scales with the selected number of rooms.
const benefitPct = computed(() =>
  Math.round(((props.room.priceWas - perRoomPrice.value) / props.room.priceWas) * 100),
)
const benefit = computed(() => {
  const per = props.room.priceWas - perRoomPrice.value
  return props.rates ? per * Math.max(props.room.quantity, 1) : per
})
</script>

<template>
  <article class="room card" :class="{ 'room--selected': room.quantity > 0 }">
    <!-- Booking (stacked) head: title, subtitle, then price + selector as one row below -->
    <div v-if="rateLabel" class="room__head room__head--stacked">
      <div class="room__headmain">
        <h3 class="room__name room__name--rate t-body-lg t-bold">{{ room.roomName }} – {{ rateLabel }}</h3>
        <p v-if="subtitle" class="room__subtitle t-body c-grey">{{ subtitle }}</p>

        <div class="room__priceqty">
          <div class="room__price">
            <CheckoutPriceTag :value="room.priceWas" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
            <CheckoutPriceTag :value="room.priceNow" :show-cents="false" size="lg" bold color="var(--c-via-orange)" />
          </div>
          <CheckoutRoomStepper :room="room" @update:quantity="emit('update:quantity', $event)" />
        </div>

        <p class="room__note">Prijs voor 2 nachten + compleet arrangement</p>

        <div v-if="room.upgradeText || room.stockBadge" class="room__badges">
          <span v-if="room.upgradeText" class="room__upgradetext t-body t-bold">{{ room.upgradeText }}</span>
          <span v-if="room.stockBadge" class="badge badge--stock">{{ room.stockBadge }}</span>
        </div>
      </div>
    </div>

    <!-- Standard head (current + in-card): selector as right column -->
    <div v-else class="room__head">
      <div class="room__headmain">
        <!-- With the switch visible the title sits compact; at 0 rooms it keeps the
             standard 80px spacing above the (left-aligned) price -->
        <h3 class="room__name t-body-lg t-bold" :class="{ 'room__name--incard': showSwitch }">{{ room.roomName }}</h3>

        <!-- In-card cancellation switch (only once ≥1 room is selected) -->
        <div v-if="showSwitch" class="rateswitch">
          <button class="rateopt" type="button" @click="emit('update:rate', 'nonrefundable')">
            <span class="rateradio" :class="{ 'rateradio--on': selectedRate !== 'flexible' }" />
            <span class="rateopt__text"><span class="t-body-lg t-bold">Niet-restitueerbaar</span></span>
            <span class="rateopt__price">
              <CheckoutPriceTag :value="room.priceWas * room.quantity" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
              <CheckoutPriceTag :value="rates!.nonRef * room.quantity" :show-cents="false" size="md" bold />
            </span>
          </button>
          <button class="rateopt" type="button" @click="emit('update:rate', 'flexible')">
            <span class="rateradio" :class="{ 'rateradio--on': selectedRate === 'flexible' }" />
            <span class="rateopt__text">
              <span class="t-body-lg t-bold c-green">Flexibel annuleren</span>
              <span class="t-body c-grey">{{ rates!.deadline }}</span>
            </span>
            <span class="rateopt__price">
              <CheckoutPriceTag :value="room.priceWas * room.quantity" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
              <CheckoutPriceTag :value="rates!.flex * room.quantity" :show-cents="false" size="md" bold color="var(--c-via-orange)" />
            </span>
          </button>
        </div>

        <!-- In-card variant at 0 rooms: show the cheapest price where the switch will appear -->
        <div v-else-if="rates" class="room__price room__price--incard0">
          <CheckoutPriceTag :value="room.priceWas" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
          <CheckoutPriceTag :value="rates.nonRef" :show-cents="false" size="lg" bold color="var(--c-via-orange)" />
        </div>

        <!-- Default price block -->
        <div v-else class="room__price">
          <CheckoutPriceTag :value="room.priceWas" :show-cents="false" size="sm" bold strike color="var(--c-medium-grey)" />
          <CheckoutPriceTag :value="room.priceNow" :show-cents="false" size="lg" bold color="var(--c-via-orange)" />
        </div>

        <p class="room__note">Prijs voor 2 nachten + compleet arrangement</p>

        <div v-if="room.upgradeText || room.stockBadge" class="room__badges">
          <span v-if="room.upgradeText" class="room__upgradetext t-body t-bold">{{ room.upgradeText }}</span>
          <span v-if="room.stockBadge" class="badge badge--stock">{{ room.stockBadge }}</span>
        </div>
      </div>

      <CheckoutRoomStepper :room="room" @update:quantity="emit('update:quantity', $event)" />
    </div>

    <hr class="room__divider" />

    <!-- Body -->
    <div class="room__body">
      <div class="room__left">
        <div class="room__img">
          <img :src="room.image" :alt="room.roomName" />
          <button class="room__maximize" type="button" aria-label="Vergroot foto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </div>
        <div class="room__saved">
          <CheckoutSmileyIcon />
          <span class="t-body">Jouw voordeel:</span>
          <CheckoutPriceTag :value="benefit" :show-cents="false" size="sm" bold color="var(--c-via-orange)" />
          <span class="t-caption c-grey">({{ benefitPct }}%)</span>
          <span class="t-bold">!</span>
        </div>
      </div>

      <div class="room__right">
        <p class="room__intro t-body">{{ room.facilitiesIntro }}</p>
        <div class="room__facilities">
          <CheckoutFacilityItem v-for="f in room.facilities" :key="f.label" :label="f.label" :icon="f.icon" />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.room {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid var(--c-light-grey);
}
/* Selected room card gets a thicker black stroke */
.room--selected {
  border: 2px solid var(--c-via-black);
}
.room__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* prijsblok + selector bottom-aligned */
  gap: 24px;
}
.room__head--stacked {
  display: block; /* booking: everything stacks; price + selector share one row */
}
.room__headmain {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.room__head--stacked .room__headmain {
  flex: 1; /* booking: fill the card width */
}
.room__name {
  font-size: 20px;
  line-height: 26px;
  margin-bottom: 64px; /* + 6px gap + 4px price margin + line-height slack ≈ 80px visueel */
}
/* Booking title sits compact above the subtitle */
.room__name--rate {
  margin-bottom: 0;
}
/* In-card title keeps some room above the switch/price */
.room__name--incard {
  margin-bottom: 12px;
}
.room__subtitle {
  margin-bottom: 8px;
  max-width: 46ch;
}
/* Booking: price and quantity selector on one row below the title/subtitle */
.room__priceqty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
}
/* In-card rate switch */
.rateswitch {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
  min-height: 76px;
}
/* At 0 rooms the single price sits left-aligned, like the current variant
   (the title keeps its standard 80px margin in that state) */
.room__price--incard0 {
  align-items: flex-start;
}
.rateopt {
  display: grid;
  grid-template-columns: 18px 200px auto;
  align-items: start;
  gap: 10px;
  text-align: left;
  width: 100%;
}
.rateopt__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rateopt__price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.rateradio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--c-dark-grey);
  position: relative;
  margin-top: 2px;
  flex-shrink: 0;
}
.rateradio--on {
  border-color: var(--c-via-black);
}
.rateradio--on::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--c-via-black);
}
.room__divider {
  border: none;
  border-top: 1px solid var(--c-light-grey);
  margin: 0;
}
.room__price {
  display: flex;
  align-items: flex-start; /* "van" prijs top-aligned met de finale prijs */
  gap: 8px;
  margin-top: 4px;
}
.room__note {
  font-size: 14px;
  line-height: 20px;
  color: var(--c-via-black);
}
.room__badges {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}
.room__upgradetext {
  color: var(--c-via-orange);
}
.badge {
  display: inline-flex;
  align-items: center;
  font-size: var(--t-caption);
  font-weight: 500;
  padding: 4px 12px;
  height: 24px;
  /* Figma: light-green background, black text */
  background: var(--c-green-pale);
  color: var(--c-via-black);
}
.badge--upgrade {
  border-radius: 8px;
}
.badge--stock {
  border-radius: 4px;
}
.room__body {
  display: grid;
  grid-template-columns: 284px 1fr;
  gap: 48px;
}
.room__img {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  aspect-ratio: 286 / 190;
}
.room__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.room__maximize {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: rgba(26, 30, 30, 0.55);
  color: var(--c-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.room__saved {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: var(--c-via-black);
}
.room__right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.room__facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
