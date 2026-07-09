<script setup lang="ts">
// Startscherm: gegroepeerde ingangen. "Voorstel Joris" bovenaan (A/B),
// daaronder de alternatieve varianten (C/D) en de losse concepten.
// Op mobiel leidt de globale middleware automatisch naar de mobiele site;
// desktop-only ingangen verdwijnen daar of wijzen naar een alternatief.

const isMobile = ref(false)
onMounted(() => {
  isMobile.value = /iPhone|iPod|Windows Phone|Android.*Mobile/i.test(navigator.userAgent)
})

interface StartButton {
  label: string
  to: string
}
interface StartGroup {
  title: string
  note?: string
  buttons: StartButton[]
}
interface StartSection {
  heading: string
  groups: StartGroup[]
}

const sections = computed<StartSection[]>(() => [
  {
    heading: 'Newsletter opt-in',
    groups: [
      {
        title: 'Base',
        buttons: [{ label: 'Start', to: '/journey/11/deal' }],
      },
    ],
  },
  {
    heading: 'Final variants',
    groups: [
      {
        title: 'Variant A: Forced choice (+€0 / +€15)',
        buttons: [
          { label: 'Zonder extra’s', to: '/journey/8/deal' },
          { label: 'Met extra’s', to: '/journey/9/deal' },
        ],
      },
      {
        title: 'Variant B: Room table met sidebar, zonder prijs in kalenderstap',
        buttons: [{ label: 'Start', to: '/journey/10/deal' }],
      },
    ],
  },
  {
    heading: 'Voorstel Joris',
    groups: [
      {
        title: 'Variant A: Forced choice',
        buttons: [
          { label: 'Zonder extra’s', to: '/journey/6/deal' },
          { label: 'Met extra’s', to: '/journey/7/deal' },
        ],
      },
      {
        title: 'Variant B: Room table + sidebar + kalender',
        note: 'alleen desktop',
        // Op mobiel start deze knop variant 6 (de tabel+kalender-combinatie
        // is een desktop-concept).
        buttons: [{ label: 'Start', to: isMobile.value ? '/journey/6/deal' : '/journey/3/deal' }],
      },
    ],
  },
  {
    heading: 'Alternatieve varianten',
    groups: [
      {
        title: 'Variant C: Complete room table zonder sidebar',
        buttons: [
          { label: 'Prijs wel tonen in kalenderstap', to: '/journey/1/deal' },
          { label: 'Prijs niet tonen in kalenderstap', to: '/journey/2/deal' },
          ...(isMobile.value
            ? []
            : [{ label: 'Goedkoopste voorgeselecteerd', to: '/journey/4/deal' }]),
        ],
      },
      {
        title: 'Variant D: Forced choice €15 i.p.v. totaalprijs',
        buttons: [{ label: 'Start', to: '/journey/5/deal' }],
      },
    ],
  },
])
</script>

<template>
  <div class="start">
    <main class="start__main">
      <img class="start__logo" src="/images/logos/logo-vialuxury-horizontal-black.svg" alt="ViaLuxury" />
      <h1 class="start__title">Flexibel annuleren</h1>

      <template v-for="section in sections" :key="section.heading">
        <h2 class="start__heading">{{ section.heading }}</h2>
        <div class="start__buttons">
          <div v-for="group in section.groups" :key="group.title" class="start__card">
            <p class="start__card-title">
              {{ group.title }}
              <span v-if="group.note" class="start__note">{{ group.note }}</span>
            </p>
            <div class="start__card-actions">
              <NuxtLink v-for="btn in group.buttons" :key="btn.to + btn.label" :to="btn.to" class="start__btn-start">
                {{ btn.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>

      <!-- Losse concepten: alleen op desktop, onderaan -->
      <div v-if="!isMobile" class="start__buttons start__buttons--last">
        <div class="start__card">
          <p class="start__card-title">Earlier concepts</p>
          <div class="start__card-actions">
            <NuxtLink to="/concepts" class="start__btn-start">Start</NuxtLink>
          </div>
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
  padding: 40px 24px;
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
  margin-bottom: 8px;
}
.start__heading {
  font-size: var(--t-h1);
  font-weight: var(--w-black);
  margin-top: 16px;
}
.start__buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.start__buttons--last {
  margin-top: 28px;
}
.start__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--c-white);
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 20px 24px;
}
.start__card-title {
  font-size: var(--t-h2);
  font-weight: var(--w-black);
  color: var(--c-via-black);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.start__note {
  font-size: var(--t-caption);
  font-weight: 500;
  color: var(--c-grey);
  background: var(--c-surface);
  border: 1px solid var(--c-light-grey);
  border-radius: 100px;
  padding: 3px 10px;
  white-space: nowrap;
}
.start__card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.start__btn-start {
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
