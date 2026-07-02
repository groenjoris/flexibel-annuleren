<script setup lang="ts">
// Info popup behind the "Meer over deze opties ⓘ" link: explains both
// cancellation policies.
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="pol" role="dialog" aria-modal="true" aria-labelledby="pol-title" @click.self="emit('close')">
    <div class="pol__card">
      <button class="pol__close" type="button" aria-label="Sluiten" @click="emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>

      <h2 id="pol-title" class="t-h1">Annuleringsvoorwaarden</h2>

      <div class="pol__section">
        <h3 class="t-body-lg t-bold">Niet-terugbetaalbaar tarief</h3>
        <p class="t-body c-grey">
          Als je je boeking wilt wijzigen of annuleren, ontvang je geen bedrag retour.
        </p>
      </div>

      <div class="pol__section">
        <h3 class="t-body-lg t-bold c-green">Flexibel annuleren</h3>
        <p class="t-body c-grey">
          Wanneer je vóór de vermelde datum annuleert, ontvang je het arrangementsbedrag plus
          eventueel bijgeboekte extra's terug.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pol {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(26, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.pol__card {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-pop);
  width: 520px;
  max-width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.pol__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-via-black);
  transition: background 0.15s ease;
}
.pol__close:hover {
  background: var(--c-surface);
}
.pol__section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
