<script setup lang="ts">
// Optioneel variant-label naast het logo (journey-pagina's).
// nudgeSwitcher: toont de sub-variant-switcher voor Yvette's Super Nudge
// (v12): variant A = groene banner, variant B = neutrale (witte) banner.
defineProps<{ label?: string; nudgeSwitcher?: boolean }>()
const nudgeVariant = useState<'a' | 'b'>('nudge-variant', () => 'a')
</script>

<template>
  <header class="nav">
    <div class="nav__inner">
      <div class="nav__brand">
        <NuxtLink to="/" aria-label="Naar het startscherm">
          <img
            class="nav__logo"
            src="/images/logos/logo-vialuxury-horizontal-black.svg"
            alt="ViaLuxury"
          />
        </NuxtLink>
        <span v-if="label" class="nav__label">{{ label }}</span>

        <div v-if="nudgeSwitcher" class="nav__switch" role="group" aria-label="Banner-variant">
          <span class="nav__switchlabel">Banner</span>
          <div class="nav__switchgroup">
            <button
              class="nav__switchbtn"
              :class="{ 'nav__switchbtn--on': nudgeVariant === 'a' }"
              type="button"
              @click="nudgeVariant = 'a'"
            >
              Groen
            </button>
            <button
              class="nav__switchbtn"
              :class="{ 'nav__switchbtn--on': nudgeVariant === 'b' }"
              type="button"
              @click="nudgeVariant = 'b'"
            >
              Neutraal
            </button>
          </div>
        </div>
      </div>

      <button class="nav__service" type="button">
        <span>Klantenservice</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="nav__safe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>Veilig afrekenen</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  background: var(--c-via-black);
  color: var(--c-white);
  height: 72px;
  display: flex;
  align-items: center;
}
.nav__inner {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
}
.nav__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-self: start;
}
.nav__logo {
  height: 15px;
  width: auto;
  /* Black wordmark -> white for the dark bar */
  filter: brightness(0) invert(1);
}
.nav__label {
  font-size: var(--t-caption);
  font-weight: 500;
  color: var(--c-white);
  background: rgba(255, 255, 255, 0.14);
  border-radius: 100px;
  padding: 4px 12px;
  white-space: nowrap;
}
/* Sub-variant switcher (v12): segmented control op de donkere balk */
.nav__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.nav__switchlabel {
  font-size: var(--t-caption);
  color: rgba(255, 255, 255, 0.6);
}
.nav__switchgroup {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  padding: 2px;
}
.nav__switchbtn {
  font-size: var(--t-caption);
  font-weight: 500;
  color: var(--c-white);
  padding: 4px 12px;
  border-radius: 100px;
  transition: background 0.15s ease, color 0.15s ease;
}
.nav__switchbtn--on {
  background: var(--c-white);
  color: var(--c-via-black);
}
.nav__service {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--c-white);
  font-size: var(--t-body);
  font-weight: 500;
  justify-self: center;
}
.nav__safe {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--t-body);
  font-weight: 500;
  justify-self: end;
}
</style>
