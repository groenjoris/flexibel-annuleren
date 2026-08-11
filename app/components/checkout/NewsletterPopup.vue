<script setup lang="ts">
// Nieuwsbrief-kortingspopup van de newsletter-flow (v11), gedeeld tussen
// de journey-homepage en de dealpagina. Twee varianten: 'simple'
// (invulformulier) en 'dopamine' (kraskaart), gekozen via ?popup=dopamine.
//
// - autoOpen: popup 1s na aankomst tonen (homepage), tenzij al
//   weggeklikt of afgerond.
// - showLabel: na het wegklikken een labeltje aan de rechterrand van het
//   scherm tonen; klikken daarop opent de popup opnieuw.
const props = withDefaults(defineProps<{ autoOpen?: boolean; showLabel?: boolean }>(), {
  autoOpen: false,
  showLabel: false,
})

const route = useRoute()

// Handgeschreven font (Oooh Baby) voor de groet op de Jan Wegenaar-foto.
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Oooh+Baby&display=swap' },
  ],
})

// Popup-variant reist mee door de flow (de dealpagina heeft de
// ?popup-query niet meer): eenmaal gezien op de URL -> gedeelde state.
const npVariant = useState<'simple' | 'dopamine' | 'huidige' | 'fotobg' | 'sweepstake' | 'vipmember' | 'hans'>('np-variant', () => 'simple')
if (route.query.popup === 'dopamine') npVariant.value = 'dopamine'
else if (route.query.popup === 'huidige') npVariant.value = 'huidige'
else if (route.query.popup === 'fotobg') npVariant.value = 'fotobg'
else if (route.query.popup === 'sweepstake') npVariant.value = 'sweepstake'
else if (route.query.popup === 'vipmember') npVariant.value = 'vipmember'
else if (route.query.popup === 'hans') npVariant.value = 'hans'
else if (route.query.popup === 'simple') npVariant.value = 'simple'
const isDopamine = computed(() => npVariant.value === 'dopamine')
const isHuidige = computed(() => npVariant.value === 'huidige')
const isFotobg = computed(() => npVariant.value === 'fotobg')
const isSweepstake = computed(() => npVariant.value === 'sweepstake')
// "VIP member" = huidige zonder usp's, met de disclaimer onderaan.
const isVipmember = computed(() => npVariant.value === 'vipmember')
// "Hans van der Togt": rad van fortuin i.p.v. kraskaart.
const isHans = computed(() => npVariant.value === 'hans')
// Sweepstake en Hans: gecentreerde weergave op een foto-achtergrond.
const isGamePhoto = computed(() => isSweepstake.value || isHans.value)
// Alle "gok"-varianten krijgen een feestelijke stap 2 (confetti).
const isGok = computed(() => isDopamine.value || isSweepstake.value || isHans.value)
// Confetti: deterministisch gegenereerde snippers (geen Math.random,
// dus SSR-veilig); CSS-animatie regent ze van boven naar beneden.
const CONFETTI_COLORS = ['#e97132', '#36c890', '#f0c85c', '#2b6cb0', '#e53e3e', '#7a5ea8']
const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  delay: `${((i * 13) % 26) / 10}s`,
  duration: `${2.6 + ((i * 7) % 18) / 10}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: `${6 + (i % 3) * 2}px`,
  h: `${10 + (i % 4) * 3}px`,
}))
// "Foto bg", "VIP member", Sweepstake en Hans delen het full-bleed frame.
const isPhotoLayout = computed(() => isHuidige.value || isFotobg.value || isVipmember.value || isGamePhoto.value)
// "Sweepstake" deelt de kraskaart-opbouw van "Dopamine".
const isScratchLayout = computed(() => isDopamine.value || isSweepstake.value)

// Gedeelde popup-status over pagina's heen.
const popupOpen = useState('np-open', () => false)
const npDismissed = useState('np-dismissed', () => false)
const npCompleted = useState('np-completed', () => false)
const npLabelHidden = useState('np-label-hidden', () => false)

// Vanaf het startscherm (knoppen dragen ?popup=...) begint alles opnieuw;
// het label verschijnt dus pas weer na de eerste dismissal.
if (route.query.popup) {
  popupOpen.value = false
  npDismissed.value = false
  npCompleted.value = false
  npLabelHidden.value = false
}

// Sluiten zonder afgeronde inschrijving: de popup morft naar het
// labeltje aan de rechterrand (krimpt + schuift ernaartoe), daarna
// verschijnt het label met een slide-in.
const npCardEl = ref<HTMLElement | null>(null)
const morphing = ref(false)
function closePopup() {
  if (morphing.value) return
  if (props.showLabel && !npCompleted.value && import.meta.client && npCardEl.value) {
    morphing.value = true
    const card = npCardEl.value
    const r = card.getBoundingClientRect()
    const tx = window.innerWidth - 24 - (r.left + r.width / 2)
    const ty = window.innerHeight * 0.45 - (r.top + r.height / 2)
    card.style.transition = 'transform 0.45s cubic-bezier(0.55, 0, 0.85, 0.36), opacity 0.45s ease'
    card.style.transform = `translate(${tx}px, ${ty}px) scale(0.05)`
    card.style.opacity = '0'
    // Afronden op transitionend (robuust, ook als timers throttlen),
    // met een timer als vangnet.
    let done = false
    const finish = () => {
      if (done) return
      done = true
      popupOpen.value = false
      npDismissed.value = true
      morphing.value = false
    }
    card.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, 600)
    return
  }
  popupOpen.value = false
  npDismissed.value = true
}

// Labeltje aan de rechterrand: alleen na wegklikken, zolang er nog niet
// is ingeschreven en het label zelf niet is weggeklikt.
const labelVisible = computed(
  () => props.showLabel && npDismissed.value && !npCompleted.value && !npLabelHidden.value && !popupOpen.value,
)

onMounted(() => {
  // De popup verschijnt op deze pagina altijd vanzelf na 1 seconde
  // (alle varianten); alleen na een afgeronde inschrijving niet meer.
  if (props.autoOpen && !npCompleted.value) {
    setTimeout(() => { popupOpen.value = true }, 1000)
  }
})

// Kraskaart (dopamine): gouden canvas-laag die je met de muis wegkrast.
const scratchCanvas = ref<HTMLCanvasElement | null>(null)
let scratching = false
function initScratch() {
  const c = scratchCanvas.value
  if (!c) return
  const w = c.offsetWidth
  const h = c.offsetHeight
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#e9c96b')
  grad.addColorStop(0.45, '#c9a437')
  grad.addColorStop(0.55, '#dfbd55')
  grad.addColorStop(1, '#f0d98c')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(109, 84, 15, 0.9)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '2px'
  ctx.font = '700 15px inherit, sans-serif'
  ctx.fillText('KRAS HIER', w / 2, h / 2)
}
// Zodra ~50% is weggekrast fadet de kraslaag weg en verschijnt het
// inschrijfformulier (e-mailveld + knop + disclaimer).
const scratchDone = ref(false)
let strokeCount = 0
function checkScratchProgress() {
  const c = scratchCanvas.value
  if (!c || scratchDone.value) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const data = ctx.getImageData(0, 0, c.width, c.height).data
  let clear = 0
  let total = 0
  for (let i = 3; i < data.length; i += 4 * 16) {
    total++
    if (data[i] === 0) clear++
  }
  if (clear / total > 0.5) scratchDone.value = true
}
function scratchAt(e: PointerEvent) {
  const c = scratchCanvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const r = c.getBoundingClientRect()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(e.clientX - r.left, e.clientY - r.top, 26, 0, Math.PI * 2)
  ctx.fill()
  if (++strokeCount % 10 === 0) checkScratchProgress()
}
function onScratchDown(e: PointerEvent) {
  scratching = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  scratchAt(e)
}
function onScratchMove(e: PointerEvent) {
  if (scratching) scratchAt(e)
}
function onScratchUp() {
  scratching = false
  checkScratchProgress()
}
// Canvas initialiseren zodra de popup (met kraskaart) in de DOM staat.
watch(popupOpen, (open) => {
  if (open && isScratchLayout.value && !scratchDone.value) nextTick(initScratch)
})

// Rad van fortuin (Hans van der Togt): 7 vakken, stopt op Mystery korting.
const WHEEL_SEGMENTS = [
  { label: '€5', color: '#36c890' },
  { label: 'Mystery korting', color: '#1a1e1e' },
  { label: '€10', color: '#e97132' },
  { label: '€1', color: '#2b6cb0' },
  { label: '€50', color: '#e53e3e' },
  { label: 'Mystery korting', color: '#7a5ea8' },
  { label: '€15', color: '#d8a92d' },
]
const WHEEL_SEG_DEG = 360 / WHEEL_SEGMENTS.length
function wheelSlicePath(i: number) {
  const r = 118
  const cx = 120
  const cy = 120
  const a0 = ((i * WHEEL_SEG_DEG - 90) * Math.PI) / 180
  const a1 = (((i + 1) * WHEEL_SEG_DEG - 90) * Math.PI) / 180
  return `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`
}
const wheelRotation = ref(0)
const wheelSpun = ref(false)
let wheelSpinning = false
function finishWheel() {
  if (wheelSpun.value) return
  wheelSpinning = false
  wheelSpun.value = true
}
function spinWheel() {
  if (wheelSpinning || wheelSpun.value) return
  wheelSpinning = true
  // Stopt altijd op het eerste Mystery korting-vak (index 1), na 4 rondjes.
  const mysteryIndex = 1
  wheelRotation.value = 4 * 360 - (mysteryIndex * WHEEL_SEG_DEG + WHEEL_SEG_DEG / 2)
  // Vangnet voor het geval transitionend niet vuurt (tab-throttling).
  setTimeout(finishWheel, 3600)
}

// Afbeeldingsvarianten (switcher rechts onderin de popup).
const POPUP_IMAGES = [
  '/images/pop-up/inntel-marina-beach.jpg',
  '/images/pop-up/welness.jpg',
  '/images/pop-up/FotoMetSMaak-8423.jpg',
  '/images/pop-up/Jan_Wegenaar_Via_Luxury_Crowdfunding_Campagne_d61420d1bc.jpg',
  '/images/pop-up/3-gangendiner.jpg',
  '/images/pop-up/des-indes-exterior.jpg',
  '/images/pop-up/istock-1270074974.jpg',
]
// Per-foto "camerapositie": translate verschuift de uitsnede, scale
// voorkomt gaten (cover heeft verticaal geen speling).
const POPUP_IMAGE_TRANSFORMS = [
  'none',                            // 1: Inntel Marina Beach
  'translateY(-100px) scale(1.35)', // 2: wellness, camera 100px omlaag
  'translateY(100px) scale(1.35)',  // 3: restaurant, camera 100px omhoog
  'none',                            // 4: Jan Wegenaar
  'none',                            // 5
  'none',                            // 6
  'none',                            // 7
]
// De Jan Wegenaar-foto krijgt een handgeschreven groet als overlay.
const isJanPhoto = computed(() => POPUP_IMAGES[popupImage.value].includes('Jan_Wegenaar'))
const popupImage = ref(0)

// Inschrijfformulier: e-mailvalidatie + succes-/al-bekend-melding.
const npEmail = ref('')
const npError = ref(false)
const npState = ref<'form' | 'loading' | 'success' | 'known'>('form')
function npSubmit() {
  const email = npEmail.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    npError.value = true
    return
  }
  npError.value = false
  // 2s laad-animatie tussen stap 1 en stap 2; bestaande leden (e-mail
  // eindigt op vialuxury.com) krijgen de "al bekend"-variant.
  npState.value = 'loading'
  setTimeout(() => {
    npState.value = email.toLowerCase().endsWith('vialuxury.com') ? 'known' : 'success'
    npCompleted.value = true
  }, 2000)
}
</script>

<template>
  <div>
    <!-- Kortingspopup -->
    <div v-if="popupOpen" class="np" :class="{ 'np--morph': morphing }" role="dialog" aria-modal="true" @click.self="closePopup">
      <div ref="npCardEl" class="np__card" :class="{ 'np__card--tall': isGamePhoto }">
        <!-- Confetti bij een gewonnen korting (gok-varianten, stap 2) -->
        <div v-if="npState === 'success' && isGok" class="np__confetti" aria-hidden="true">
          <span
            v-for="(piece, i) in confettiPieces"
            :key="i"
            class="np__confetti-piece"
            :style="{ left: piece.left, animationDelay: piece.delay, animationDuration: piece.duration, background: piece.color, width: piece.w, height: piece.h }"
          />
        </div>

        <button class="np__close" type="button" aria-label="Sluiten" @click="closePopup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>

        <!-- Variant "Huidige": full-bleed foto als achtergrond, alles
             gecentreerd in wit (naar de huidige live-site popup). -->
        <div v-if="isPhotoLayout" class="nph">
          <img class="nph__bg" :src="POPUP_IMAGES[popupImage]" alt="" />
          <div class="nph__scrim" />
          <p v-if="isJanPhoto" class="np__handnote np__handnote--bg">Leuk om je hier te zien!<span class="np__handnote-sig">— Jan Wegenaar, oprichter ViaLuxury</span></p>

          <div class="nph__inner" :class="{ 'nph__inner--top': isGamePhoto }">
            <img class="nph__logo" src="/images/logos/logo-vialuxury-horizontal-black.svg" alt="ViaLuxury" />

            <!-- Sweepstake / Hans van der Togt: spel gecentreerd op de foto -->
            <template v-if="npState === 'form' && isGamePhoto">
              <p class="nph__eyebrow">Nieuw bij ViaLuxury?</p>
              <h2 class="nph__title nph__title--normal">{{ isHans ? 'Draai voor welkomstkorting!' : 'Kras voor je welkomstgeschenk!' }}</h2>

              <div v-if="isSweepstake" class="np__scratch np__scratch--photo" :class="{ 'np__scratch--done': scratchDone }">
                <div class="np__scratch-under">
                  <p class="np__scratchtext">Gegarandeerd €5, €10 of €50</p>
                </div>
                <canvas
                  ref="scratchCanvas"
                  class="np__scratch-canvas"
                  :class="{ 'np__scratch-canvas--done': scratchDone }"
                  @pointerdown="onScratchDown"
                  @pointermove="onScratchMove"
                  @pointerup="onScratchUp"
                  @pointercancel="onScratchUp"
                />
              </div>

              <div v-else class="np__wheelwrap" :class="{ 'np__wheelwrap--done': wheelSpun }" @click="spinWheel">
                <div class="np__wheelpointer" aria-hidden="true" />
                <div class="np__wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }" @transitionend="finishWheel">
                  <svg viewBox="0 0 240 240" width="100%" height="100%">
                    <g v-for="(seg, i) in WHEEL_SEGMENTS" :key="i">
                      <path :d="wheelSlicePath(i)" :fill="seg.color" stroke="#fff" stroke-width="2" />
                      <g :transform="`rotate(${i * WHEEL_SEG_DEG + WHEEL_SEG_DEG / 2} 120 120)`">
                        <text
                          v-if="seg.label === 'Mystery korting'"
                          x="120"
                          y="38"
                          text-anchor="middle"
                          fill="#fff"
                          font-size="10.5"
                          font-weight="700"
                        >
                          <tspan x="120" dy="0">Mystery</tspan>
                          <tspan x="120" dy="12">korting</tspan>
                        </text>
                        <text v-else x="120" y="46" text-anchor="middle" fill="#fff" font-size="16" font-weight="800">{{ seg.label }}</text>
                      </g>
                    </g>
                    <circle cx="120" cy="120" r="16" fill="#fff" />
                  </svg>
                </div>
                <p v-if="!wheelSpun" class="np__wheelhint np__wheelhint--photo">Klik om te draaien</p>
              </div>

              <!-- Formulier verschijnt na het krassen/draaien (ruimte gereserveerd) -->
              <div class="np__reveal np__reveal--photo" :class="{ 'np__reveal--on': isHans ? wheelSpun : scratchDone }">
                <form class="nph__form nph__form--stacked" novalidate @submit.prevent="npSubmit">
                  <label class="nph__label" for="np-email-g">Type je e-mailadres</label>
                  <input
                    id="np-email-g"
                    v-model="npEmail"
                    class="nph__input"
                    :class="{ 'nph__input--invalid': npError }"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                  />
                  <p v-if="npError" class="nph__error nph__error--left">Vul een geldig e-mailadres in.</p>
                  <button class="np__cta nph__cta nph__cta--full" type="submit">Ontvang aanbiedingen en onthul je korting</button>
                </form>

                <p class="nph__terms">
                  Je ontvangt de kortingscode direct per e-mail en schrijft je daarmee in
                  voor onze e-mailupdates vol exclusieve aanbiedingen. Uitschrijven kan
                  altijd met één klik via de link onderaan elke mail. De welkomstkorting
                  geldt eenmalig en alleen voor nieuwe leden; niet geldig in combinatie
                  met andere kortingen. Zie onze actievoorwaarden en privacyverklaring.
                </p>
              </div>
            </template>

            <!-- "Foto bg": content van de simple-variant, gecentreerd op de foto -->
            <template v-else-if="npState === 'form' && isFotobg">
              <p class="nph__eyebrow">Nieuw bij ViaLuxury?</p>
              <h2 class="nph__title nph__title--normal">Ontvang €10 welkomstkorting!</h2>

              <form class="nph__form nph__form--stacked" novalidate @submit.prevent="npSubmit">
                <label class="nph__label" for="np-email-f">Type je e-mailadres</label>
                <input
                  id="np-email-f"
                  v-model="npEmail"
                  class="nph__input"
                  :class="{ 'nph__input--invalid': npError }"
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                />
                <p v-if="npError" class="nph__error nph__error--left">Vul een geldig e-mailadres in.</p>
                <button class="np__cta nph__cta nph__cta--full" type="submit">Claim mijn korting</button>
              </form>

              <p class="nph__terms">
                Je ontvangt de kortingscode direct per e-mail en schrijft je daarmee in
                voor onze e-mailupdates vol exclusieve aanbiedingen. Uitschrijven kan
                altijd met één klik via de link onderaan elke mail. De welkomstkorting
                geldt eenmalig en alleen voor nieuwe leden; niet geldig in combinatie
                met andere kortingen. Zie onze actievoorwaarden en privacyverklaring.
              </p>
            </template>

            <template v-else-if="npState === 'form'">
              <h2 class="nph__title">Word gratis VIP member!<br />Ontvang €10</h2>

              <ul v-if="!isVipmember" class="nph__usps">
                <li v-for="usp in ['Gratis upgrades', 'Secret deals tot -80% korting', 'Voorrang op hotelboekingen']" :key="usp" class="nph__usp">
                  <svg class="nph__star" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8L12 2.5z" /></svg>
                  <span>{{ usp }}</span>
                </li>
              </ul>

              <form class="nph__form" novalidate @submit.prevent="npSubmit">
                <input
                  v-model="npEmail"
                  class="nph__input"
                  :class="{ 'nph__input--invalid': npError }"
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                  aria-label="E-mailadres"
                />
                <button class="np__cta nph__cta" type="submit">Gratis Ontdekken</button>
              </form>
              <p v-if="npError" class="nph__error">Vul een geldig e-mailadres in.</p>

              <img class="nph__trust" src="/images/trustpilot-white.svg" alt="Trustpilot" />

              <!-- VIP member: disclaimer onderaan -->
              <p v-if="isVipmember" class="nph__terms">
                Je ontvangt de kortingscode direct per e-mail en schrijft je daarmee in
                voor onze e-mailupdates vol exclusieve aanbiedingen. Uitschrijven kan
                altijd met één klik via de link onderaan elke mail. De welkomstkorting
                geldt eenmalig en alleen voor nieuwe leden; niet geldig in combinatie
                met andere kortingen. Zie onze actievoorwaarden en privacyverklaring.
              </p>
            </template>

            <div v-else-if="npState === 'loading'" class="np__loading" aria-label="Bezig met verwerken">
              <span class="np__spinner" />
            </div>

            <template v-else>
              <template v-if="npState === 'success'">
                <h2 class="nph__title" :class="{ 'nph__title--normal': isGamePhoto }">{{ isGamePhoto ? 'Gefeliciteerd!' : 'Gelukt!' }}</h2>
                <p class="nph__para">{{ isGamePhoto ? 'Je krijgt €10 korting op je eerstvolgende boeking. Check je e-mail voor je kortingscode.' : 'Check je inbox voor de kortingscode.' }}</p>
              </template>
              <template v-else>
                <h2 class="nph__title">Welkom terug!</h2>
                <p class="nph__para">
                  <strong>{{ npEmail }}</strong> is al bekend — de korting is voor
                  nieuwe leden. Maar we zijn blij je weer te zien: check je mail
                  voor een surprise!
                </p>
              </template>
              <button class="np__cta nph__cta" type="button" @click="popupOpen = false">
                Terug naar de site
              </button>
            </template>
          </div>

          <!-- Variant-switcher (boven de voorwaardenbalk) -->
          <div class="np__switch nph__switchpos">
            <button
              v-for="(img, i) in POPUP_IMAGES"
              :key="img"
              class="np__switchnr"
              :class="{ 'np__switchnr--on': i === popupImage }"
              type="button"
              @click="popupImage = i"
            >
              {{ i + 1 }}
            </button>
          </div>

          <!-- Halftransparante voorwaardenbalk -->
          <div class="nph__footer">
            <a class="nph__footerlink" href="#">Algemene voorwaarden</a>
            <a class="nph__footerlink" href="#">Privacyvoorwaarden</a>
          </div>
        </div>

        <!-- Linkerhelft: stap 1 (formulier) of stap 2 (melding) op dezelfde plek -->
        <div v-else class="np__left">
          <template v-if="npState === 'form'">
            <p class="np__eyebrow">Nieuw bij ViaLuxury?</p>
            <h2 class="np__title">{{ isDopamine ? 'Kras voor je welkomstgeschenk!' : 'Ontvang €10 welkomstkorting!' }}</h2>

            <!-- Dopamine: kraskaart bedekt de kortingstekst; bij ~50%
                 weggekrast verschijnt het formulier eronder. -->
            <template v-if="isDopamine">
              <div class="np__scratch" :class="{ 'np__scratch--done': scratchDone }">
                <div class="np__scratch-under">
                  <p class="np__scratchtext">Je krijgt €10 korting!</p>
                </div>
                <canvas
                  ref="scratchCanvas"
                  class="np__scratch-canvas"
                  :class="{ 'np__scratch-canvas--done': scratchDone }"
                  @pointerdown="onScratchDown"
                  @pointermove="onScratchMove"
                  @pointerup="onScratchUp"
                  @pointercancel="onScratchUp"
                />
              </div>

              <!-- Formulier staat er vanaf het begin (onzichtbaar) zodat
                   het scherm niet verspringt na het krassen. -->
              <div class="np__reveal" :class="{ 'np__reveal--on': scratchDone }">
                <form class="np__form" novalidate @submit.prevent="npSubmit">
                  <label class="np__label" for="np-email-d">Type je e-mailadres</label>
                  <input
                    id="np-email-d"
                    v-model="npEmail"
                    class="np__input"
                    :class="{ 'np__input--invalid': npError }"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                  />
                  <p v-if="npError" class="np__errormsg">Vul een geldig e-mailadres in.</p>
                  <button class="np__cta" type="submit">Claim mijn korting</button>
                </form>

                <p class="np__terms">
                  Je ontvangt de kortingscode direct per e-mail en schrijft je daarmee in
                  voor onze e-mailupdates vol exclusieve aanbiedingen. Uitschrijven kan
                  altijd met één klik via de link onderaan elke mail. De welkomstkorting
                  geldt eenmalig en alleen voor nieuwe leden; niet geldig in combinatie
                  met andere kortingen. Zie onze actievoorwaarden en privacyverklaring.
                </p>
              </div>
            </template>

            <!-- Simple: formulier direct zichtbaar -->
            <template v-else>
              <form class="np__form" novalidate @submit.prevent="npSubmit">
                <label class="np__label" for="np-email">Type je e-mailadres</label>
                <input
                  id="np-email"
                  v-model="npEmail"
                  class="np__input"
                  :class="{ 'np__input--invalid': npError }"
                  type="email"
                  placeholder="naam@voorbeeld.nl"
                />
                <p v-if="npError" class="np__errormsg">Vul een geldig e-mailadres in.</p>
                <button class="np__cta" type="submit">Claim mijn korting</button>
              </form>

              <p class="np__terms">
                Je ontvangt de kortingscode direct per e-mail en schrijft je daarmee in
                voor onze e-mailupdates vol exclusieve aanbiedingen. Uitschrijven kan
                altijd met één klik via de link onderaan elke mail. De welkomstkorting
                geldt eenmalig en alleen voor nieuwe leden; niet geldig in combinatie
                met andere kortingen. Zie onze actievoorwaarden en privacyverklaring.
              </p>
            </template>
          </template>

          <div v-else-if="npState === 'loading'" class="np__loading" aria-label="Bezig met verwerken">
            <span class="np__spinner" />
          </div>

          <template v-else>
            <template v-if="npState === 'success'">
              <h2 class="np__title">{{ isDopamine ? 'Gefeliciteerd!' : 'Gelukt!' }}</h2>
              <p class="np__para">{{ isDopamine ? 'Je krijgt €10 korting op je eerstvolgende boeking. Check je e-mail voor je kortingscode.' : 'Check je inbox voor de kortingscode.' }}</p>
            </template>
            <template v-else>
              <h2 class="np__title">Welkom terug!</h2>
              <p class="np__para">
                <strong>{{ npEmail }}</strong> is al bekend — de korting is voor
                nieuwe leden. Maar we zijn blij je weer te zien: check je mail
                voor een surprise!
              </p>
            </template>
            <button class="np__cta np__cta--back" type="button" @click="popupOpen = false">
              Terug naar de site
            </button>
          </template>
        </div>

        <!-- Rechterhelft: afbeelding met variant-switcher -->
        <div v-if="!isPhotoLayout" class="np__right">
          <img class="np__img" :src="POPUP_IMAGES[popupImage]" :style="{ transform: POPUP_IMAGE_TRANSFORMS[popupImage] }" alt="" />
          <p v-if="isJanPhoto" class="np__handnote">Leuk om je hier te zien!<span class="np__handnote-sig">— Jan Wegenaar, oprichter ViaLuxury</span></p>
          <!-- Variant-switcher: kleine onderstreepte nummertjes rechts onderin -->
          <div class="np__switch">
            <button
              v-for="(img, i) in POPUP_IMAGES"
              :key="img"
              class="np__switchnr"
              :class="{ 'np__switchnr--on': i === popupImage }"
              type="button"
              @click="popupImage = i"
            >
              {{ i + 1 }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Heropen-label aan de rechterrand (na het wegklikken van de popup) -->
    <div v-if="labelVisible" class="npl">
      <button class="npl__x" type="button" aria-label="Label sluiten" @click="npLabelHidden = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
      </button>
      <button class="npl__body" type="button" @click="popupOpen = true">
        <span class="npl__text">Krijg €10 korting</span>
        <svg class="npl__icon" width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8" /><path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Kortingspopup */
.np {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(26, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: np-fade-in 0.25s ease;
}
@keyframes np-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Tijdens de morf naar het label: achtergrond wegfaden */
.np--morph {
  background: rgba(26, 30, 30, 0);
  transition: background 0.45s ease;
  pointer-events: none;
}
.np__card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  width: 960px;
  max-width: 100%;
  height: 640px;
  max-height: calc(100vh - 48px);
  display: flex;
  overflow: hidden;
}
.np__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a1e1e;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: background 0.15s ease;
}
.np__close:hover {
  background: #fff;
}
.np__left {
  flex: 1 1 50%;
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}
.np__eyebrow {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1e1e;
}
.np__title {
  font-size: 34px;
  line-height: 40px;
  font-weight: 700;
}
.np__para {
  font-size: 16px;
  line-height: 24px;
  color: #1a1e1e;
}
.np__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.np__label {
  font-size: 16px;
  font-weight: 600;
  color: #1a1e1e;
}
.np__input {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 14px 16px;
  font-family: inherit;
  font-size: 16px;
  color: #1a1e1e;
  width: 100%;
}
.np__input:focus {
  outline: none;
  border-color: #1a1e1e;
}
.np__input--invalid {
  border-color: #b3402e;
  background: #fff5f4;
}
.np__errormsg {
  font-size: 13px;
  color: #b3402e;
}
.np__cta {
  background: #e97132;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  padding: 16px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.np__cta:hover {
  background: #d4642a;
}
.np__terms {
  margin-top: 12px;
  font-size: 11.5px;
  line-height: 17px;
  color: #6b6b6b;
}
.np__right {
  position: relative;
  flex: 1 1 50%;
  overflow: hidden;
}
.np__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Variant-switcher: kleine onderstreepte nummertjes rechts onderin */
.np__switch {
  position: absolute;
  right: 14px;
  bottom: 10px;
  display: flex;
  gap: 10px;
}
.np__switchnr {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-decoration: underline;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  padding: 2px;
}
.np__switchnr--on {
  text-decoration: none;
  color: #e97132;
}
/* Stap 2: terug-CTA onder de melding */
.np__cta--back {
  margin-top: 8px;
  align-self: flex-start;
}
/* Formulier onder de kraskaart: neemt vanaf het begin ruimte in
   (geen layout-versprong), wordt zichtbaar na het krassen */
.np__reveal {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.np__reveal--on {
  visibility: visible;
  opacity: 1;
}

/* Kraskaart (dopamine-variant): stippellijn-contour als een coupon */
.np__scratch {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 2px dashed #9a9a9a;
}
.np__scratch-under {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px 18px;
  background: #fff;
}
.np__scratchtext {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
  color: #1a1e1e;
  text-align: center;
  white-space: nowrap;
}

.np__scratch-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Wijsvingertje tijdens het krassen */
  cursor: pointer;
  touch-action: none;
  transition: opacity 0.5s ease;
}
.np__scratch-canvas--done {
  opacity: 0;
  pointer-events: none;
}

/* Laad-animatie tussen stap 1 en 2 */
.np__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.np__spinner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 4px solid #e5e5e5;
  border-top-color: #e97132;
  animation: np-spin 0.8s linear infinite;
}
@keyframes np-spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 760px) {
  .np {
    padding: 14px;
  }
  /* Gestapeld: foto boven, formulier eronder; kaart schaalt met de
     inhoud en scrolt als het niet past. */
  .np__card {
    flex-direction: column-reverse;
    height: auto;
    max-height: calc(100vh - 28px);
    overflow-y: auto;
  }
  .np__right {
    flex: 0 0 auto;
    min-height: 170px;
  }
  /* Camera-shifts zijn getuned op de hoge desktopkolom; op de lage
     mobiele strook geven ze gaten — daar de standaard uitsnede. */
  .np__img {
    transform: none !important;
  }
  .np__left {
    flex: 0 0 auto;
    justify-content: flex-start;
    padding: 22px 20px 20px;
    gap: 12px;
  }
  .np__eyebrow {
    font-size: 13px;
  }
  .np__title {
    font-size: 24px;
    line-height: 30px;
  }
  .np__scratchtext {
    font-size: 20px;
  }
  .np__input {
    padding: 12px 14px;
  }
  .np__cta {
    padding: 14px 20px;
  }
  .np__terms {
    font-size: 10.5px;
    line-height: 15px;
  }
  .np__loading {
    min-height: 140px;
  }
  /* Variant "Huidige" op mobiel: usp's onder elkaar, formulier gestapeld */
  .nph__inner {
    padding: 40px 20px 64px;
    gap: 18px;
  }
  .nph__title {
    font-size: 24px;
    line-height: 31px;
  }
  .nph__usps {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .nph__form {
    flex-direction: column;
  }
  .nph__footer {
    gap: 18px;
  }
}

/* Variant "Huidige": full-bleed foto, alles gecentreerd in wit */
.nph {
  position: relative;
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
}
.nph__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.nph__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(15, 17, 17, 0.45), rgba(15, 17, 17, 0.55));
}
.nph__inner {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  text-align: center;
  color: #fff;
  padding: 48px 48px 72px;
}
.nph__logo {
  height: 22px;
  width: auto;
  /* Zwart woordmerk -> wit op de foto */
  filter: brightness(0) invert(1);
}
.nph__title {
  font-size: 34px;
  line-height: 42px;
  font-weight: 700;
  text-transform: uppercase;
  /* Expliciet wit: fr-scope headings erven anders donker */
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
}
/* "Foto bg": simple-titel zonder caps */
.nph__title--normal {
  text-transform: none;
}
.nph__eyebrow {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
.nph__label {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-align: left;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
.nph__terms {
  font-size: 11.5px;
  line-height: 17px;
  color: rgba(255, 255, 255, 0.88);
  max-width: 480px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
.nph__form--stacked {
  flex-direction: column;
  align-items: stretch;
}
.nph__cta--full {
  width: 100%;
}
.nph__error--left {
  text-align: left;
  align-self: flex-start;
}
.nph__para {
  font-size: 16px;
  line-height: 24px;
  max-width: 480px;
  overflow-wrap: anywhere;
}
.nph__usps {
  display: flex;
  gap: 26px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.nph__usp {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.nph__star {
  color: #fff;
  flex-shrink: 0;
}
.nph__form {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 480px;
}
.nph__input {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 14px 16px;
  font-family: inherit;
  font-size: 16px;
  color: #1a1e1e;
  background: #fff;
  min-width: 0;
}
.nph__input:focus {
  outline: 2px solid #e97132;
}
.nph__input--invalid {
  outline: 2px solid #b3402e;
  background: #fff5f4;
}
.nph__cta {
  flex-shrink: 0;
  white-space: nowrap;
}
.nph__error {
  font-size: 13px;
  font-weight: 600;
  color: #ffb4a8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
.nph__trust {
  height: 46px;
  width: auto;
}
/* Switcher boven de voorwaardenbalk */
.nph__switchpos {
  bottom: 46px;
}
/* Halftransparante witte voorwaardenbalk */
.nph__footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 10px 16px;
}
.nph__footerlink {
  font-size: 13px;
  color: #1a1e1e;
  text-decoration: underline;
}
.nph__footerlink:hover {
  color: #e97132;
}

/* Spelvarianten op foto-achtergrond: hogere kaart, content vanaf boven */
.np__card--tall {
  height: 800px;
}
.nph__inner--top {
  justify-content: flex-start;
  padding: 64px 48px 60px;
  gap: 16px;
  overflow-y: auto;
}
.np__scratch--photo {
  width: 440px;
  max-width: 100%;
  align-self: center;
  flex-shrink: 0;
}
.np__reveal--photo {
  width: 100%;
  max-width: 480px;
  align-self: center;
}
.np__wheelhint--photo {
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

/* Rad van fortuin */
.np__wheelwrap {
  position: relative;
  width: 240px;
  align-self: center;
  cursor: pointer;
}
.np__wheelwrap--done {
  cursor: default;
}
.np__wheelpointer {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 18px solid #1a1e1e;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}
.np__wheel {
  width: 240px;
  height: 240px;
  transition: transform 3.2s cubic-bezier(0.12, 0.8, 0.22, 1);
  will-change: transform;
}
.np__wheelhint {
  margin-top: 8px;
  text-align: center;
  font-size: 13px;
  color: #6b6b6b;
}

/* Handgeschreven groet op de Jan Wegenaar-foto */
.np__handnote {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-4deg);
  z-index: 3;
  font-family: 'Oooh Baby', cursive;
  font-size: 32px;
  line-height: 1.15;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
  white-space: nowrap;
  pointer-events: none;
}
.np__handnote-sig {
  display: block;
  font-size: 20px;
  margin-top: 2px;
}

/* Confetti (gok-varianten, stap 2) */
.np__confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 6;
}
.np__confetti-piece {
  position: absolute;
  top: -24px;
  border-radius: 2px;
  animation: np-confetti-fall linear infinite;
}
@keyframes np-confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(850px) rotate(660deg);
    opacity: 0;
  }
}

/* Heropen-label aan de rechterrand (zie Sklum-voorbeeld) */
.npl {
  position: fixed;
  right: 0;
  top: 45%;
  transform: translateY(-50%);
  z-index: 150;
  background: #1a1e1e;
  color: #fff;
  border-radius: 8px 0 0 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 14px;
  animation: npl-in 0.3s ease-out;
}
@keyframes npl-in {
  from { transform: translateY(-50%) translateX(110%); }
  to { transform: translateY(-50%) translateX(0); }
}
.npl__x {
  color: #fff;
  display: inline-flex;
  padding: 2px;
  cursor: pointer;
  opacity: 0.8;
}
.npl__x:hover {
  opacity: 1;
}
.npl__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #fff;
  cursor: pointer;
}
.npl__text {
  writing-mode: vertical-rl;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
