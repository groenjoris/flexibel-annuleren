<script setup lang="ts">
import { cancellation, type CancelChoice } from '~/data/cancellation'

defineProps<{ modelValue: CancelChoice }>()
const emit = defineEmits<{ 'update:modelValue': [value: CancelChoice] }>()

// "Meer over deze opties ⓘ" opens the cancellation-policy explainer.
const showPolicyInfo = ref(false)
</script>

<template>
  <section class="card flexi">
    <header class="flexi__head">
      <h2 class="t-h1">Kies je flexibiliteit</h2>
      <button class="flexi__learn t-body" type="button" @click="showPolicyInfo = true">
        <span>Meer over deze opties</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
          <path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="12" cy="7.5" r="1.1" fill="currentColor" />
        </svg>
      </button>
    </header>

    <div class="opts">
      <button
        class="opt"
        type="button"
        @click="emit('update:modelValue', 'flexible')"
      >
        <span class="radio" :class="{ 'radio--on': modelValue === 'flexible' }" />
        <span class="opt__label t-body-lg t-bold c-green">Flexibel annuleren</span>
        <span class="opt__meta t-body c-grey">{{ cancellation.deadline }}</span>
        <span class="opt__price t-body t-bold c-green">Aanbevolen</span>
      </button>

      <button
        class="opt"
        type="button"
        @click="emit('update:modelValue', 'nonrefundable')"
      >
        <span class="radio" :class="{ 'radio--on': modelValue === 'nonrefundable' }" />
        <span class="opt__label t-body-lg">Niet-restitueerbaar</span>
        <span class="opt__meta" />
        <span class="opt__price t-body c-grey">- <CheckoutPriceTag :value="cancellation.upgradeDelta" :show-cents="false" size="sm" /> per kamer</span>
      </button>
    </div>
    <CheckoutPolicyInfoPopup v-if="showPolicyInfo" @close="showPolicyInfo = false" />
  </section>
</template>

<style scoped>
.flexi {
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
}
.flexi__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.flexi__learn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--c-via-black);
  align-self: flex-start;
}
.flexi__learn svg { color: var(--c-medium-grey); }
.opts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.opt {
  display: grid;
  grid-template-columns: 16px auto 1fr auto;
  align-items: center;
  gap: 8px;
  text-align: left;
  padding: 4px 0;
  width: 100%;
}
.opt__price {
  justify-self: end;
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}
.radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--c-dark-grey);
  flex-shrink: 0;
  position: relative;
}
.radio--on {
  border-color: var(--c-via-green);
}
.radio--on::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--c-via-green);
}
</style>
