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
    // Tweede testronde van de newsletter-popup: 1 = Claim je korting
    // (fotobg + veld-/tekstwijzigingen), 2 = Rad van Fortuin (zwart-wit
    // rad, uitkomst €10), 3 = Kraslot (oranje kraslaag, €10 eronder).
    heading: 'Newsletter opt-in, Second round',
    groups: [
      {
        title: 'Variant 1: Claim je korting',
        buttons: [{ label: 'Start', to: '/journey/11/home?popup=claim2' }],
      },
      {
        title: 'Variant 2: Rad van Fortuin',
        buttons: [{ label: 'Start', to: '/journey/11/home?popup=rad2' }],
      },
      {
        title: 'Variant 3: Kraslot',
        buttons: [{ label: 'Start', to: '/journey/11/home?popup=kras2' }],
      },
    ],
  },
  {
    // Nieuwe AB-test: A = room table (was Final B), B = Yvette's Super
    // Nudge (was onder Final variants), C = idee van Tijl (volgt nog).
    heading: 'Follow-up test flexible cancellation',
    groups: [
      {
        title: 'Variant A: Room table',
        buttons: [{ label: 'Start', to: '/journey/10/deal' }],
      },
      {
        title: 'Variant B: Yvette\u2019s Super Nudge',
        buttons: [{ label: 'Start', to: '/journey/12/deal' }],
      },
      {
        title: 'Variant C: Idee van Tijl',
        note: 'volgt nog',
        buttons: [],
      },
    ],
  },
  {
    heading: 'Newsletter opt-in',
    groups: [
      {
        // Newsletter-flow start op de homepage (met kortingspopup na 1s).
        // Twee popup-varianten: Simple (invulveld) en Dopamine (kraskaart).
        title: 'Base',
        // De ?popup-query markeert een verse start: alle popup-state reset.
        buttons: [
          { label: 'Simple', to: '/journey/11/home?popup=simple' },
          { label: 'Dopamine', to: '/journey/11/home?popup=dopamine' },
          { label: 'Huidige', to: '/journey/11/home?popup=huidige' },
          { label: 'Foto bg', to: '/journey/11/home?popup=fotobg' },
          { label: 'Sweepstake', to: '/journey/11/home?popup=sweepstake' },
          { label: 'VIP member', to: '/journey/11/home?popup=vipmember' },
          { label: 'Hans van der Togt', to: '/journey/11/home?popup=hans' },
        ],
      },
    ],
  },
  {
    heading: 'Forced choice variants',
    groups: [
      {
        title: 'Variant A: Forced choice (+€0 / +€15)',
        buttons: [
          { label: 'Zonder extra’s', to: '/journey/8/deal' },
          { label: 'Met extra’s', to: '/journey/9/deal' },
        ],
      },
    ],
  },
  {
    heading: 'Oorspronkelijk voorstel Joris',
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
