<script setup lang="ts">
// Journey-checkout op basis van concept 1e (eigen kopie: JourneyRoomTable),
// bereikt via "Ik ga boeken" op de dealpagina of via de kalenderstap.
import { journeyKey, journeyLabel } from '~/data/journeys'

const route = useRoute()
const jv = computed(() => journeyKey(route.params.v))
const label = computed(() => journeyLabel(jv.value))
</script>

<template>
  <div class="page page--white">
    <CheckoutTopNav :label="label" />

    <div class="page__stepper">
      <CheckoutStepper :active="2" />
    </div>

    <main class="page__main container">
      <div class="page__table">
        <h1 class="t-display">Kies je kamer(s)</h1>
        <CheckoutJourneyRoomTable />
      </div>
    </main>

    <CheckoutSiteFooter />
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.page--white {
  background: var(--c-white);
}
.page__stepper {
  padding: 32px 24px;
}
.page__main {
  flex: 1;
}
.page__table {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
