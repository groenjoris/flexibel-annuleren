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

// Popup-variant reist mee door de flow (de dealpagina heeft de
// ?popup-query niet meer): eenmaal gezien op de URL -> gedeelde state.
const npVariant = useState<'simple' | 'dopamine'>('np-variant', () => 'simple')
if (route.query.popup === 'dopamine') npVariant.value = 'dopamine'
else if (route.query.popup === 'simple') npVariant.value = 'simple'
const isDopamine = computed(() => npVariant.value === 'dopamine')

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
    setTimeout(() => {
      popupOpen.value = false
      npDismissed.value = true
      morphing.value = false
    }, 450)
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
  ctx.font = '700 15px inherit, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '2px'
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
  if (open && isDopamine.value && !scratchDone.value) nextTick(initScratch)
})

// Afbeeldingsvarianten (switcher rechts onderin de popup).
const POPUP_IMAGES = [
  '/images/pop-up/welness.jpg',
  '/images/pop-up/FotoMetSMaak-8423.jpg',
  '/images/pop-up/Jan_Wegenaar_Via_Luxury_Crowdfunding_Campagne_d61420d1bc.jpg',
  '/images/pop-up/3-gangendiner.jpg',
  '/images/pop-up/des-indes-exterior.jpg',
  '/images/pop-up/inntel-marina-beach.jpg',
  '/images/pop-up/istock-1270074974.jpg',
]
// Per-foto "camerapositie": translate verschuift de uitsnede, scale
// voorkomt gaten (cover heeft verticaal geen speling).
const POPUP_IMAGE_TRANSFORMS = [
  'translateY(-100px) scale(1.35)', // 1: camera 100px omlaag
  'translateY(100px) scale(1.35)',  // 2: camera 100px omhoog
  'none',                            // 3
  'none',                            // 4
  'none',                            // 5
  'none',                            // 6
  'none',                            // 7
]
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
      <div ref="npCardEl" class="np__card">
        <button class="np__close" type="button" aria-label="Sluiten" @click="closePopup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>

        <!-- Linkerhelft: stap 1 (formulier) of stap 2 (melding) op dezelfde plek -->
        <div class="np__left">
          <template v-if="npState === 'form'">
            <p class="np__eyebrow">Nieuw bij ViaLuxury?</p>
            <h2 class="np__title">{{ isDopamine ? 'Kras voor korting!' : 'Ontvang €10 welkomstkorting!' }}</h2>

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
              <h2 class="np__title">{{ isDopamine ? 'Je krijgt €10 korting' : 'Gelukt!' }}</h2>
              <p class="np__para">{{ isDopamine ? 'Check je e-mail voor je kortingscode.' : 'Check je inbox voor de kortingscode.' }}</p>
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
        <div class="np__right">
          <img class="np__img" :src="POPUP_IMAGES[popupImage]" :style="{ transform: POPUP_IMAGE_TRANSFORMS[popupImage] }" alt="" />
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
  .np__card {
    flex-direction: column-reverse;
    min-height: 0;
  }
  .np__right {
    min-height: 200px;
  }
  .np__left {
    padding: 28px 24px 24px;
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
