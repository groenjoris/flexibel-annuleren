<script setup lang="ts">
// Forced choice between non-refundable (+€0) and flexible (+€15 per kamer).
// Nothing is preselected; the parent keeps its continue buttons disabled
// until a choice is made. Flexible is nudged (green, benefits, "Meest gekozen").
import type { CancelChoice } from '~/data/cancellation'

withDefaults(defineProps<{
  modelValue: CancelChoice
  title?: string
  subtitle?: string
  // 2d: compare complete arrangement totals instead of +€0 / +€15 deltas.
  totals?: { nonRef: number; flex: number }
}>(), {
  title: 'Hoe flexibel wil je zijn?',
  subtitle: 'Maak een keuze om verder te gaan.',
  totals: undefined,
})
const emit = defineEmits<{ 'update:modelValue': [value: CancelChoice] }>()
</script>

<template>
  <section class="card fc">
    <header class="fc__head">
      <h2 class="t-h1">{{ title }}</h2>
      <p class="t-body c-grey">{{ subtitle }}</p>
    </header>

    <div class="fc__opts">
      <!-- Non-refundable -->
      <button
        type="button"
        class="fc__opt"
        :class="{ 'fc__opt--on': modelValue === 'nonrefundable' }"
        @click="emit('update:modelValue', 'nonrefundable')"
      >
        <span class="fc__radio" :class="{ 'fc__radio--on': modelValue === 'nonrefundable' }" />
        <span class="fc__optmain">
          <span class="t-body-lg t-bold">Niet-restitueerbaar</span>
          <span class="t-body c-grey">Bij annuleren of wijzigen betaal je het volledige bedrag.</span>
        </span>
        <span v-if="totals" class="fc__price fc__price--total">
          <!-- Centen alleen tonen als het totaal geen rond bedrag is (extra's) -->
          <CheckoutPriceTag :value="totals.nonRef" :show-cents="totals.nonRef % 1 !== 0" size="lg" bold />
          <span class="t-caption c-mgrey">totaalprijs</span>
        </span>
        <span v-else class="fc__price t-body-lg t-bold">+ €0</span>
      </button>

      <!-- Flexible (nudged) -->
      <button
        type="button"
        class="fc__opt fc__opt--flex"
        :class="{ 'fc__opt--on': modelValue === 'flexible' }"
        @click="emit('update:modelValue', 'flexible')"
      >
        <span class="fc__label t-caption">Meest gekozen</span>
        <span class="fc__radio" :class="{ 'fc__radio--on': modelValue === 'flexible' }" />
        <span class="fc__optmain">
          <span class="t-body-lg t-bold c-green">Flexibel annuleren</span>
          <span class="fc__benefits">
            <span class="fc__benefit t-body">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Gratis annuleren tot 23 mei 23:59
            </span>
            <span class="fc__benefit t-body">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Volledige teruggave van de arrangementsprijs
            </span>
            <span class="fc__benefit t-body">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Plannen gewijzigd? Geen zorgen
            </span>
          </span>
        </span>
        <span v-if="totals" class="fc__price fc__price--total">
          <CheckoutPriceTag :value="totals.flex" :show-cents="totals.flex % 1 !== 0" size="lg" bold color="var(--c-via-green)" />
          <span class="t-caption c-mgrey">totaalprijs</span>
        </span>
        <span v-else class="fc__price t-body-lg t-bold c-green">+ €15 <span class="t-body c-grey">per kamer</span></span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.fc {
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.fc__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fc__opts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fc__opt {
  position: relative;
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: start;
  gap: 14px;
  text-align: left;
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 20px;
  transition: border-color 0.15s ease;
}
.fc__opt--flex {
  border-color: var(--c-via-green);
  background: var(--c-green-soft);
}
.fc__opt--on {
  border-width: 2px;
  border-color: var(--c-via-black);
  padding: 19px; /* compenseer dikkere rand zodat de kaart niet verspringt */
}
.fc__opt--flex.fc__opt--on {
  border-color: var(--c-via-green);
}
.fc__label {
  position: absolute;
  top: -10px;
  left: 16px;
  background: var(--c-via-green);
  color: var(--c-white);
  font-weight: var(--w-black);
  padding: 2px 10px;
  border-radius: 100px;
}
.fc__optmain {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fc__benefits {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fc__benefit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--c-via-black);
}
.fc__benefit svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.fc__price {
  white-space: nowrap;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 2px;
}
/* 2d: complete arrangement totals stacked above a small caption */
.fc__price--total {
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.fc__radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--c-dark-grey);
  position: relative;
  margin-top: 2px;
  flex-shrink: 0;
  background: var(--c-white);
}
.fc__radio--on {
  border-color: var(--c-via-black);
}
.fc__radio--on::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--c-via-black);
}
</style>
