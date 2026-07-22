<script setup lang="ts">
// Pop-up variant of the forced choice: opens after "Opslaan en doorgaan".
// The guest must pick via one of the two buttons below; the closing cross
// returns to the page without choosing.
const emit = defineEmits<{
  choose: [value: 'flexible' | 'nonrefundable']
  close: []
}>()
</script>

<template>
  <div class="pop" role="dialog" aria-modal="true" aria-labelledby="pop-title" @click.self="emit('close')">
    <div class="pop__card">
      <button class="pop__close" type="button" aria-label="Sluiten" @click="emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>

      <h2 id="pop-title" class="t-h1 pop__title">Hoe flexibel wil je zijn?</h2>
      <p class="t-body c-grey pop__sub">Maak een keuze om je boeking af te ronden.</p>

      <!-- Nudged flexible option -->
      <div class="pop__flex">
        <span class="pop__label t-caption">Meest gekozen</span>
        <div class="pop__flexhead">
          <span class="t-body-lg t-bold c-green">Flexibel annuleren</span>
          <span class="t-body-lg t-bold c-green">+ €15 <span class="t-body c-grey">per kamer</span></span>
        </div>
        <ul class="pop__benefits">
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Gratis annuleren tot 23 mei 23:59
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Volledige teruggave van de arrangementsprijs
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Plannen gewijzigd? Geen zorgen
          </li>
        </ul>
      </div>

      <p class="pop__nonref t-body c-grey">
        Niet-terugbetaalbaar (+ €0): bij annuleren of wijzigen betaal je het volledige bedrag.
      </p>

      <!-- The two choice buttons -->
      <div class="pop__actions">
        <button class="pop__btn pop__btn--flex" type="button" @click="emit('choose', 'flexible')">
          Ja, ik wil flexibel zijn
        </button>
        <button class="pop__btn pop__btn--nonref" type="button" @click="emit('choose', 'nonrefundable')">
          Nee, ik boek niet-terugbetaalbaar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(26, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.pop__card {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-pop);
  width: 560px;
  max-width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pop__close {
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
.pop__close:hover {
  background: var(--c-surface);
}
.pop__title {
  padding-right: 40px;
}
.pop__sub {
  margin-top: -8px;
}
.pop__flex {
  position: relative;
  border: 1px solid var(--c-via-green);
  background: var(--c-green-soft);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.pop__label {
  position: absolute;
  top: -10px;
  left: 16px;
  background: var(--c-via-green);
  color: var(--c-white);
  font-weight: var(--w-black);
  padding: 2px 10px;
  border-radius: 100px;
}
.pop__flexhead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.pop__benefits {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pop__benefits li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--t-body);
  color: var(--c-via-black);
}
.pop__benefits svg {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.pop__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.pop__btn {
  width: 100%;
  padding: 18px 24px;
  border-radius: var(--radius);
  font-size: var(--t-body-lg);
  font-weight: var(--w-black);
  transition: background 0.15s ease, border-color 0.15s ease;
}
.pop__btn--flex {
  background: var(--c-via-green);
  color: var(--c-white);
}
.pop__btn--flex:hover {
  background: #2db07d;
}
.pop__btn--nonref {
  background: var(--c-white);
  color: var(--c-via-black);
  border: 1px solid var(--c-dark-grey);
  font-weight: 500;
}
.pop__btn--nonref:hover {
  background: var(--c-surface);
}
</style>
