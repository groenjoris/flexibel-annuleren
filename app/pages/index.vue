<script setup lang="ts">
// Startscherm: ingangen naar de verschillende manieren om flexibel
// annuleren te implementeren. Voorlopig alleen "Concepts"; losse
// journey-knoppen volgen later.
import { JOURNEY_NAMES } from '~/data/journeys'

const entries = [
  {
    title: 'Concepts',
    description:
      'Alle losse concepten voor de flexibel-annuleren keuze, schakelbaar via de variant-switcher.',
    to: '/concepts',
  },
  ...Object.entries(JOURNEY_NAMES).map(([v, name]) => ({
    title: `Variant ${v} — ${name}`,
    description: 'Journey van dealpagina via datumkeuze naar de checkout.',
    to: `/journey/${v}/deal`,
  })),
]

// Op mobiel leidt de globale middleware automatisch naar de mobiele site.
</script>

<template>
  <div class="start">
    <main class="start__main">
      <img class="start__logo" src="/images/logos/logo-vialuxury-horizontal-black.svg" alt="ViaLuxury" />
      <h1 class="start__title">Flexibel annuleren</h1>
      <p class="start__sub t-body-lg c-grey">
        Prototypes van verschillende manieren om flexibel annuleren te implementeren.
        Kies een ingang:
      </p>

      <div class="start__buttons">
        <div v-for="entry in entries" :key="entry.to" class="start__btn">
          <div class="start__btn-main">
            <span class="start__btn-title">{{ entry.title }}</span>
            <span class="start__btn-desc t-body c-grey">{{ entry.description }}</span>
          </div>
          <NuxtLink :to="entry.to" class="start__btn-start">Start</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.start {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface);
  padding: 24px;
}
.start__main {
  width: 560px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.start__logo {
  height: 18px;
  width: auto;
  align-self: flex-start;
  margin-bottom: 16px;
}
.start__title {
  font-size: var(--t-display);
  line-height: var(--lh-display);
  font-weight: var(--w-black);
}
.start__sub {
  margin-bottom: 16px;
}
.start__buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.start__btn {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 20px 20px 20px 24px;
}
.start__btn-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.start__btn-title {
  font-size: var(--t-h2);
  font-weight: var(--w-black);
  color: var(--c-via-black);
}
.start__btn-start {
  flex-shrink: 0;
  background: var(--c-via-orange);
  color: var(--c-white);
  font-weight: var(--w-black);
  font-size: var(--t-body);
  border-radius: var(--radius-sm);
  padding: 10px 22px;
  transition: opacity 0.15s ease;
}
.start__btn-start:hover {
  opacity: 0.9;
}
</style>
