<script setup lang="ts">
// Startscherm: ingangen naar de verschillende manieren om flexibel
// annuleren te implementeren. Voorlopig alleen "Concepts"; losse
// journey-knoppen volgen later.
const entries = [
  {
    title: 'Concepts',
    description:
      'Alle losse concepten voor de flexibel-annuleren keuze, schakelbaar via de variant-switcher.',
    to: '/concepts',
  },
  {
    title: 'Journey 1',
    description: 'Van dealpagina naar checkout met de hybride room table (concept 1e).',
    to: '/journey1/deal',
  },
]
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
        <NuxtLink v-for="entry in entries" :key="entry.to" :to="entry.to" class="start__btn">
          <span class="start__btn-title">{{ entry.title }}</span>
          <span class="start__btn-desc t-body c-grey">{{ entry.description }}</span>
          <svg class="start__btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </NuxtLink>
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 24px 56px 24px 24px;
  transition: border-color 0.15s ease;
}
.start__btn:hover {
  border-color: var(--c-via-black);
}
.start__btn-title {
  font-size: var(--t-h2);
  font-weight: var(--w-black);
  color: var(--c-via-black);
}
.start__btn-arrow {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-via-orange);
}
</style>
