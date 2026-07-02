<script setup lang="ts">
// One-time explainer (variants 1a/1b): cancellation policies can't be mixed
// within one booking, so the choice switches all rooms at once.
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="mix" role="dialog" aria-modal="true" aria-labelledby="mix-title" @click.self="emit('close')">
    <div class="mix__card">
      <span class="mix__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <circle cx="12" cy="7.5" r="0.5" fill="currentColor" />
        </svg>
      </span>
      <h2 id="mix-title" class="t-h2 mix__title">Eén annuleringsoptie voor je hele boeking</h2>
      <p class="t-body c-grey mix__text">
        Je annuleringskeuze geldt voor alle kamers in je boeking. Kamers met verschillende
        annuleringsvoorwaarden combineren is niet mogelijk — daarom passen we de keuze voor al je
        kamers tegelijk aan.
      </p>
      <button class="btn-primary mix__ok" type="button" @click="emit('close')">Oké</button>
    </div>
  </div>
</template>

<style scoped>
.mix {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(26, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.mix__card {
  background: var(--c-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-pop);
  width: 440px;
  max-width: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
.mix__icon {
  width: 40px;
  height: 40px;
  color: var(--c-via-green);
}
.mix__icon svg {
  width: 100%;
  height: 100%;
}
.mix__ok {
  margin-top: 8px;
}
</style>
