<script setup lang="ts">
import { rooms as roomsData, hotel, includes, pricing, trustpilot } from '~/data/deal'
import type { CancelChoice } from '~/data/cancellation'
import { pageVariants, defaultVariant } from '~/data/pageVariants'

// Reactive copy so quantity steppers drive the order summary live.
const roomList = reactive(roomsData.map((r) => ({ ...r })))
const flexibility = ref<CancelChoice>('flexible')

// Active page variant (from ?variant=).
const route = useRoute()
const variant = computed(() => {
  const q = route.query.variant
  const key = Array.isArray(q) ? q[0] : q
  return pageVariants.some((v) => v.key === key) ? (key as string) : defaultVariant
})

// Variant "twocards": every room becomes two rate cards (non-refundable + flexible),
// each with a complete price. Flexible = non-refundable + per-room flex surcharge.
const rateList = reactive(
  roomsData.flatMap((r) => [
    {
      ...r,
      id: `${r.id}-nonref`,
      baseId: r.id,
      rateKey: 'nonrefundable' as const,
      rateLabel: 'Niet-restitueerbaar',
      subtitle: 'Bij annuleren betaal je het volledige bedrag',
      priceNow: r.priceNow,
      quantity: r.id === 'junior' ? 1 : 0,
    },
    {
      ...r,
      id: `${r.id}-flex`,
      baseId: r.id,
      rateKey: 'flexible' as const,
      rateLabel: 'Flexibel annuleren',
      subtitle: 'Volledige teruggave van de arrangementsprijs bij annuleren voor 17 mei.',
      priceNow: r.priceNow + pricing.flexibilityPerRoom,
      quantity: 0,
    },
  ]),
)

// 1a/1b: cancellation policies can't be mixed within one booking — switching
// one room switches them all. The first time that happens we explain it once.
const mixPopupOpen = ref(false)
const mixExplained = ref(false)
function maybeExplainMix() {
  if (!mixExplained.value) {
    mixExplained.value = true
    mixPopupOpen.value = true
  }
}

// 1a: selecting a quantity on a rate card pulls every other selected room to
// that same cancellation policy (same room: policy swap; other rooms: move
// the quantity to their sibling card with the chosen rate).
function setRateQty(card: (typeof rateList)[number], qty: number) {
  card.quantity = qty
  if (qty === 0) return
  let switched = false
  for (const other of rateList) {
    if (other === card || other.quantity === 0 || other.rateKey === card.rateKey) continue
    if (other.baseId === card.baseId) {
      other.quantity = 0
    } else {
      const sibling = rateList.find((c) => c.baseId === other.baseId && c.rateKey === card.rateKey)
      if (sibling) sibling.quantity += other.quantity
      other.quantity = 0
    }
    switched = true
  }
  if (switched) maybeExplainMix()
}

// 1b: the in-card switch applies to ALL rooms at once.
function setIncardRate(rate: 'nonrefundable' | 'flexible') {
  let changed = false
  for (const r of incardList) {
    if (r.selectedRate !== rate) {
      r.selectedRate = rate
      changed = true
    }
  }
  if (changed) maybeExplainMix()
}

// Variant "incard": two rooms, each with an in-card rate switch. Non-refundable is
// €15 cheaper than the (standard) flexible price and selected by default.
const incardList = reactive(
  roomsData.map((r) => ({
    ...r,
    nonRefPrice: r.priceNow - pricing.flexibilityPerRoom,
    flexPrice: r.priceNow,
    selectedRate: 'nonrefundable' as 'nonrefundable' | 'flexible',
    quantity: r.id === 'junior' ? 1 : 0,
  })),
)

// Variant "forcedstep": after room selection an extra screen forces the
// cancellation choice. Nothing preselected; continue buttons stay disabled
// until the guest actively chooses.
const forcedStep = ref(1)
const forcedChoice = ref<CancelChoice>(null)
// Variant "forcedpopup": same forced choice, but as a modal after
// "Opslaan en doorgaan" instead of an extra step.
const popupOpen = ref(false)
watch(variant, () => {
  forcedStep.value = 1
  forcedChoice.value = null
  popupOpen.value = false
  mixPopupOpen.value = false
  mixExplained.value = false
})
function continueFromRooms() {
  if ((variant.value === 'forcedstep' || variant.value === 'laststep') && forcedStep.value === 1) {
    forcedStep.value = 2
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (variant.value === 'forcedpopup') {
    popupOpen.value = true
  }
}

// The three forced-choice variants share the same summary wiring.
const isForcedFamily = computed(() =>
  ['forcedstep', 'forcedpopup', 'laststep'].includes(variant.value),
)
function chooseFromPopup(choice: 'flexible' | 'nonrefundable') {
  forcedChoice.value = choice
  popupOpen.value = false
}

const forcedChoiceLabel = computed(() =>
  forcedChoice.value === 'flexible'
    ? 'Flexibel annuleren'
    : forcedChoice.value === 'nonrefundable'
      ? 'Niet-restitueerbaar'
      : undefined,
)

const summaryRooms = computed(() => {
  if (variant.value === 'twocards') {
    return rateList.map((r) => ({ ...r, cancelLabel: r.rateLabel }))
  }
  if (variant.value === 'incard') {
    return incardList.map((r) => ({
      ...r,
      priceNow: r.selectedRate === 'flexible' ? r.flexPrice : r.nonRefPrice,
      cancelLabel: r.selectedRate === 'flexible' ? 'Flexibel annuleren' : 'Niet-restitueerbaar',
    }))
  }
  if (isForcedFamily.value) {
    return roomList.map((r) => ({ ...r, cancelLabel: forcedChoiceLabel.value }))
  }
  return roomList
})
</script>

<template>
  <div class="page">
    <CheckoutTopNav />

    <div class="page__stepper">
      <CheckoutStepper :active="variant === 'laststep' && forcedStep === 2 ? 3 : 2" />
    </div>

    <main class="page__main container">
      <div class="page__grid">
        <!-- Form column -->
        <div v-if="variant === 'forcedstep' && forcedStep === 2" class="col-form">
          <!-- Forced-choice step: extra screen after room selection -->
          <h1 class="t-display">Kies extra's</h1>

          <CheckoutForcedChoice v-model="forcedChoice" />

          <div class="col-form__cta col-form__cta--split">
            <button class="btn-back t-body" type="button" @click="forcedStep = 1">← Terug naar kamers</button>
            <button class="btn-primary btn-primary--auto" type="button" :disabled="forcedChoice === null">
              {{ forcedChoice === null ? 'Maak eerst een keuze' : 'Verder' }}
            </button>
          </div>
        </div>

        <div v-else-if="variant === 'laststep' && forcedStep === 2" class="col-form">
          <!-- Last-step variant: forced choice at the top of the details form -->
          <h1 class="t-display">Gegevens en betaalwijze</h1>

          <CheckoutForcedChoice
            v-model="forcedChoice"
            title="1 — Hoe flexibel wil je zijn?"
            subtitle="Maak een keuze om je boeking af te ronden."
          />

          <CheckoutGegevensForm />

          <div class="col-form__cta col-form__cta--split">
            <button class="btn-back t-body" type="button" @click="forcedStep = 1">← Terug naar kamers</button>
            <button class="btn-primary btn-primary--auto" type="button" :disabled="forcedChoice === null">
              {{ forcedChoice === null ? 'Maak eerst een keuze' : 'Boek nu' }}
            </button>
          </div>
        </div>

        <div v-else class="col-form">
          <h1 class="t-display">Controleer je boeking</h1>

          <!-- Choose room -->
          <section class="card block">
            <header class="block__head">
              <h2 class="t-h1">Kies je kamer(s)</h2>
              <p class="t-body c-grey">Je krijgt één van de beste kamers, voor veel minder dan normaal!</p>
            </header>

            <div class="block__rooms">
              <template v-if="variant === 'twocards'">
                <CheckoutRoomCard
                  v-for="card in rateList"
                  :key="card.id"
                  :room="card"
                  :rate-label="card.rateLabel"
                  :subtitle="card.subtitle"
                  @update:quantity="setRateQty(card, $event)"
                />
              </template>
              <template v-else-if="variant === 'incard'">
                <CheckoutRoomCard
                  v-for="room in incardList"
                  :key="room.id"
                  :room="room"
                  :rates="{ nonRef: room.nonRefPrice, flex: room.flexPrice, deadline: 'Tot 23 mei 23:59' }"
                  :selected-rate="room.selectedRate"
                  @update:quantity="room.quantity = $event"
                  @update:rate="setIncardRate($event)"
                />
              </template>
              <template v-else>
                <CheckoutRoomCard
                  v-for="room in roomList"
                  :key="room.id"
                  :room="room"
                  @update:quantity="room.quantity = $event"
                />
              </template>
            </div>
          </section>

          <!-- Choose flexibility (only in the current, non-compliant version) -->
          <FlexibilityVariantBase v-if="variant === 'current'" v-model="flexibility" />

          <div class="col-form__cta">
            <button class="btn-primary btn-primary--auto" type="button" @click="continueFromRooms">
              Opslaan en doorgaan
            </button>
          </div>
        </div>

        <!-- Summary column -->
        <div class="col-summary">
          <CheckoutOrderSummary
            :hotel="hotel"
            :rooms="summaryRooms"
            :includes="includes"
            :pricing="pricing"
            :trustpilot="trustpilot"
            :selected="variant === 'current' ? flexibility : isForcedFamily ? forcedChoice : null"
            :show-flex-line="variant === 'current' || (isForcedFamily && forcedChoice === 'flexible')"
            :cta-disabled="(variant === 'forcedstep' || variant === 'laststep') && forcedStep === 2 && forcedChoice === null"
            :cta-label="variant === 'laststep' && forcedStep === 2 ? 'Boek nu' : undefined"
            @cta="continueFromRooms"
          />
        </div>
      </div>
    </main>

    <CheckoutSiteFooter />
    <CheckoutVariantSwitcher />

    <!-- Pop-up, forced choice -->
    <CheckoutForcedChoicePopup
      v-if="popupOpen"
      @choose="chooseFromPopup"
      @close="popupOpen = false"
    />

    <!-- 1a/1b: one-time explainer that the cancellation choice applies to all rooms -->
    <CheckoutMixInfoPopup v-if="mixPopupOpen" @close="mixPopupOpen = false" />
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.page__stepper {
  padding: 32px 24px;
}
.page__main {
  flex: 1;
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
.col-summary {
  position: relative;
  /* Align the summary's top with the room-choice card (below the h1 title):
     title line-height 48px + column gap 24px */
  padding-top: 72px;
}
</style>
