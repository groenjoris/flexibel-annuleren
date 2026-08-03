<template>
  <div class="home fr-scope">
    <!-- Hero with full-bleed background image -->
    <section class="home-hero">
      <!-- <img> + object-fit gives identical cropping in every browser
           (Edge / Firefox / Safari handle background-size: cover with
           subtly different subpixel rounding). The wrapper keeps the
           ::after gradient overlay. -->
      <div
        class="home-hero__bg"
        :class="{
          /* Pills 1 and 8 sit a bit too high in the default
             `object-position: center bottom` crop — push them 200 px
             DOWN within the same crop window so more of the upper
             portion shows. */
          'home-hero__bg--shift-down': heroPhotoIndex === 0 || heroPhotoIndex === 7,
        }"
      >
        <img class="home-hero__bg-img" :src="heroPhotoUrl" alt="" />
      </div>
      <!-- Help / phone block + pay-off both removed — both now live
           inside SiteHeader's row 2. -->

      <FirstReleaseSiteHeader variant="overlay">
        <template #hero>
          <div class="home-hero__content container">
            <div class="home-hero__eyebrow">
              <span class="home-hero__eyebrow-dot" aria-hidden="true" />
              <span>SPRING 2026</span>
            </div>
            <h1 class="home-hero__title">
              Experience<span class="home-hero__title-em"> more</span>
            </h1>
            <p class="home-hero__tagline">
              Onze experience creators stellen complete verblijven samen met luxe extra's en exclusieve voordelen, zodat jij meer beleeft voor een scherpere prijs.
            </p>
          </div>
        </template>
      </FirstReleaseSiteHeader>

    </section>


    <!-- Persuasion block — three short claims directly below the hero
         photo. Trustpilot on the left, social-proof in the middle,
         flexibility on the right. -->
    <section class="home-persuasion">
      <div class="container home-persuasion__inner">
        <div class="home-persuasion__col home-persuasion__col--trust">
          <img src="/images/trustpilot.svg" alt="Trustpilot" class="home-persuasion__trustpilot" />
          <p class="home-persuasion__text">15.294 gasten beoordelen ons met een 9 uit 10</p>
        </div>
        <div class="home-persuasion__col">
          <span class="home-persuasion__award" aria-hidden="true">
            <!-- Award / medal icon (Lucide-style). Same visual height as
                 the Trustpilot logo so the three columns sit on a line. -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              <!-- "1M" centred inside the medal disc. Font-size 6 fits
                   comfortably inside the r=6 circle; stroke is removed
                   so the letters render as solid currentColor fill. -->
              <text x="12" y="8" text-anchor="middle" dominant-baseline="central" font-size="6" font-weight="700" font-family="var(--font-heading)" stroke="none" fill="currentColor">1M</text>
            </svg>
          </span>
          <p class="home-persuasion__text">Al meer dan 1 miljoen gasten verwelkomt</p>
        </div>
        <div class="home-persuasion__col">
          <!-- "Flexibel annuleren" — Lucide `arrow-left-right` icon
               (two parallel arrows, top → right, bottom → left). Common
               glyph for reversibility / "swap / undo your booking". -->
          <span class="home-persuasion__award" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 3 4 4-4 4"/>
              <path d="M20 7H4"/>
              <path d="m8 21-4-4 4-4"/>
              <path d="M4 17h16"/>
            </svg>
          </span>
          <p class="home-persuasion__text">Flexibel annuleren</p>
        </div>
      </div>
    </section>

    <!-- Two-column band: press logos on the left, quick-pick filters on
         the right (in a 2-column grid). -->
    <section class="home-popular">
      <div class="container home-popular__inner">
        <div class="home-popular__col home-popular__col--press">
          <h3 class="home-popular__heading">Uitgelicht</h3>
          <div v-if="featuredDesIndes && featuredDesIndesDeal" class="home-popular__featured-wrap" @click.capture.stop.prevent="goJourneyDeal()">
            <FirstReleaseDealCard
              class="home-popular__featured"
              :hotel="featuredDesIndes"
              :deal="featuredDesIndesDeal"
              :grid-mode="true"
              :hide-bar="true"
              :cta-label="isMobile ? 'Bekijk' : 'Bekijk arrangement'"
            />
          </div>
        </div>
        <div class="home-popular__col home-popular__col--quick">
          <h3 class="home-popular__heading">Snel zoeken</h3>
          <div class="home-popular__pills">
            <div class="home-popular__pill-row">
              <button type="button" class="home-pill home-pill--partner" @click="goPartnerActie('hema')">
                <img src="/images/partners/hema.png" alt="HEMA" class="home-pill__logo" />
                <span class="home-pill__label">HEMA actie</span>
              </button>
            </div>
            <div
              v-for="(row, ri) in homeFilterRows"
              :key="ri"
              class="home-popular__pill-row"
            >
              <button
                v-for="f in row"
                :key="f.id"
                type="button"
                class="home-pill"
                @click="pickFilter(f.id)"
              >
                <span class="home-pill__icon" v-html="POPULAR_FILTER_ICONS[ICON_FOR[f.id]] || POPULAR_FILTER_ICONS.star" />
                <span class="home-pill__label">{{ f.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- "Gezien in:" press-logos band — decoupled from the Uitgelicht
         card so it reads as its own credibility row beneath the
         quick-filter pills. -->
    <section class="home-press-banner">
      <div class="container home-press-banner__inner">
        <span class="home-press-banner__label">Gezien in:</span>
        <div class="home-press-banner__logos">
          <img src="/images/logos/nrc.png" alt="NRC" class="home-press-banner__logo" />
          <img src="/images/logos/volkskrant.svg" alt="de Volkskrant" class="home-press-banner__logo" />
          <img src="/images/logos/nu.svg" alt="NU.nl" class="home-press-banner__logo" />
        </div>
      </div>
    </section>

    <!-- Super Hotel Deals: 3 hand-picked luxury hotels -->
    <section class="home-deals">
      <div class="container">
        <h2 class="home-deals__title">Eerder bekeken</h2>
        <div class="home-deals__grid home-deals__grid--3" @click.capture.stop.prevent="goJourneyDeal()">
          <FirstReleaseDealCard
            v-for="hotel in superDeals"
            :key="hotel.id"
            :hotel="hotel"
            :deal="pickPrimaryDeal(hotel.deals)"
            :grid-mode="true"
            :hide-bar="true"
          />
        </div>
      </div>
    </section>

    <!-- Category banners: 3 clickable banners below "Eerder bekeken" -->
    <section class="home-categories">
      <div class="container home-categories__grid">
        <button type="button" class="home-category" :style="{ backgroundImage: `url('/images/categories/bikepackages.jpg')` }" @click="pickFilter('fiets')">
          <span class="home-category__title">FIETSVAKANTIE 2026</span>
          <span class="home-category__btn">Bekijk</span>
        </button>
        <button type="button" class="home-category" :style="{ backgroundImage: `url('/images/categories/seapackages.png')` }" @click="pickFilter('aan-zee')">
          <span class="home-category__title">ONTSPANNEN
AAN ZEE</span>
          <span class="home-category__btn">Bekijk</span>
        </button>
        <button type="button" class="home-category" :style="{ backgroundImage: `url('/images/categories/hotelexperiencepackages.jpeg')` }" @click="pickFilter('unique-stay')">
          <span class="home-category__title">HOTEL
EXPERIENCES</span>
          <span class="home-category__btn">Bekijk</span>
        </button>
      </div>
    </section>

    <!-- Actuele Deals: 3x3 grid of current hotel cards -->
    <section class="home-deals home-deals--alt">
      <div class="container">
        <h2 class="home-deals__title">Actuele deals</h2>
        <div class="home-deals__grid home-deals__grid--3" @click.capture.stop.prevent="goJourneyDeal()">
          <FirstReleaseDealCard
            v-for="hotel in actueleDeals"
            :key="hotel.id"
            :hotel="hotel"
            :deal="pickPrimaryDeal(hotel.deals)"
            :grid-mode="true"
            :hide-bar="true"
          />
        </div>
      </div>
    </section>

    <FirstReleaseSiteFooter />

    <!-- Journey-variantlabel naast het logo (zoals op de dealpagina) -->
    <span class="journey-badge">{{ journeyBadge }}</span>

    <!-- Kortingspopup voor nieuwe bezoekers: verschijnt 1s na aankomst.
         Inhoud volgt (void). -->
    <div v-if="popupOpen" class="np" role="dialog" aria-modal="true" @click.self="popupOpen = false">
      <div class="np__card">
        <button class="np__close" type="button" aria-label="Sluiten" @click="popupOpen = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>

        <!-- Linkerhelft: stap 1 (formulier) of stap 2 (melding) op dezelfde plek -->
        <div class="np__left">
          <template v-if="npState === 'form'">
            <p class="np__eyebrow">Nieuw bij ViaLuxury?</p>
            <h2 class="np__title">{{ isDopamine ? 'Kras om je korting te zien' : 'Ontvang 10% welkomstkorting' }}</h2>

            <!-- Dopamine: kraskaart bedekt alleen de kortingstekst. Krassen
                 activeert de "Claim nu"-knop (met aflopende timer); die knop
                 maakt plaats voor het e-mailveld + "Toon mijn korting". -->
            <template v-if="isDopamine">
              <div class="np__scratch" :class="{ 'np__scratch--done': scratchDone }">
                <div class="np__scratch-under">
                  <p class="np__scratchtext">Je krijgt 5%, 10% of 25% korting!</p>
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

              <button
                v-if="dopStep === 'claim'"
                class="np__cta np__cta--claim"
                type="button"
                :disabled="!scratchDone"
                @click="dopStep = 'email'"
              >
                <span>Claim nu</span>
                <span v-if="scratchDone" class="np__timer">{{ claimTimer }}</span>
              </button>

              <template v-else>
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
                  <button class="np__cta" type="submit">Toon mijn korting</button>
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
              <h2 class="np__title">{{ isDopamine ? 'Je krijgt 10% korting' : 'Gelukt!' }}</h2>
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
          <img class="np__img" :src="POPUP_IMAGES[popupImage]" alt="" />
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
  </div>
</template>

<script setup lang="ts">
import { POPULAR_FILTER_ICONS } from '~/utils-first-release/popularFilterIcons'
import { mappedHotels } from '~/data/deals-mapper'
import type { SearchHotel } from '~/types/searchHotel'
import { pickPrimaryDeal } from '~/utils-first-release/primaryDeal'
import { useFirstReleaseIsMobile } from '~/composables-first-release/useFirstReleaseIsMobile'

// Uitgelicht CTA: "Bekijk arrangement" on desktop (more room),
// "Bekijk" on mobile (compact).
const isMobile = useFirstReleaseIsMobile()


// Super deals: top 3 hotels by star rating (then highest discount within the same tier)
const superDeals: SearchHotel[] = [...mappedHotels]
  .sort((a, b) => {
    if (b.starRating !== a.starRating) return b.starRating - a.starRating
    const da = Math.max(...a.deals.map(d => d.discountPercentage))
    const db = Math.max(...b.deals.map(d => d.discountPercentage))
    return db - da
  })
  .slice(0, 3)

// Actuele deals: next 9 hotels after the super-three
const superIds = new Set(superDeals.map(h => h.id))
const actueleDeals: SearchHotel[] = mappedHotels.filter(h => !superIds.has(h.id)).slice(0, 9)


// Home filter pills come from the unified FILTER_TAGS config so they stay
// in sync with the filter sidebar everywhere else.
import { FILTER_TAGS } from '~/utils-first-release/filterTags'

const homeFilters = FILTER_TAGS

// Mobile lays the quick-search pills out in 3 horizontally-scrolling rows.
// Splitting them into explicit rows (rather than a column-flow grid) lets
// each row pack its chips left-to-right on its own, so a pill's position
// depends only on the previous pill in THAT row — no shared-width columns.
const homeFilterRows = computed(() => {
  const per = Math.ceil(homeFilters.length / 3)
  return [
    homeFilters.slice(0, per),
    homeFilters.slice(per, per * 2),
    homeFilters.slice(per * 2),
  ]
})

// Featured Hotel Des Indes "culinair verblijf" card for the "Gezien in"
// column on /home. Pick the specific culinair deal so the hero pic + price
// match the right arrangement.
const featuredDesIndes = mappedHotels.find(h => /des.indes/i.test(h.name)) ?? null
const featuredDesIndesDeal = featuredDesIndes
  ? featuredDesIndes.deals.find(d => /culinair-verblijf/.test(d.slug)) ?? pickPrimaryDeal(featuredDesIndes.deals)
  : null

// Filter id → POPULAR_FILTER_ICONS key. Renders a black Lucide-style SVG
// in place of the previous emoji glyph.
const ICON_FOR: Record<string, string> = {
  wellness: 'bath',
  'jacuzzi-room': 'bath',
  pool: 'waves',
  'with-dinner': 'utensils',
  'dog-friendly': 'dog',
  'mini-trip': 'backpack',
  'aan-zee': 'waves',
  natuur: 'leaf',
  romantisch: 'sparkles',
  culinair: 'wine',
  fiets: 'bike',
  steden: 'building',
  kasteel: 'castle',
  'unique-stay': 'sparkles',
  'five-star': 'crown',
  exclusive: 'crown',
  'best-price': 'euro',
  'new-hotels': 'star',
}

const {
  toggleFilterTag,
  clearFilterTags,
  clearDestinations,
  clearArrivalDate,
  clearDuration,
  resetBudget,
} = useFirstReleaseSearchState()

function pickFilter(tagId: string) {
  // Rule #1: arriving on /search via a home theme button starts with a
  // clean slate — every other filter wiped, only the picked tag applied.
  clearFilterTags()
  clearDestinations()
  clearArrivalDate()
  clearDuration()
  resetBudget()
  toggleFilterTag(tagId)
  goJourneyDeal()
}

/** Partner co-brand entry (e.g. "HEMA actie"): start clean and land on the
 *  search results with a `?partner=` flag so that page shows the partner
 *  logo card next to Trustpilot. */
function goPartnerActie(partner: string) {
  clearFilterTags()
  clearDestinations()
  clearArrivalDate()
  clearDuration()
  resetBudget()
  goJourneyDeal()
}

// Persist this home's nav variant so internal pages render the same nav.
import { useFirstReleaseHomeVariant } from '~/composables-first-release/useFirstReleaseHomeVariant'
const { setFrNavVariant, heroPhotoUrl, heroPhotoIndex, restoreHeroPhotoIndex, restoreHomeLayoutVariant } = useFirstReleaseHomeVariant()

// Journey-context: dit is de startstap van de newsletter-flow (v11).
import { journeyKey, journeyLabel } from '~/data/journeys'
const route = useRoute()
const jv = computed(() => journeyKey(route.params.v))
const journeyBadge = computed(() => journeyLabel(jv.value))

// Alle deal-/zoek-CTA's leiden in deze flow naar de journey-dealpagina.
function goJourneyDeal() {
  navigateTo(`/journey/${jv.value}/deal`)
}

// Kortingspopup: 1 seconde na aankomst tonen.
// Twee varianten: 'simple' (default) en 'dopamine' (kraskaart), gekozen
// via ?popup=dopamine op de URL (startscherm heeft een knop per variant).
const popupOpen = ref(false)
const isDopamine = computed(() => route.query.popup === 'dopamine')

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
// Dopamine-fase: eerst "Claim nu" (na het krassen), daarna het e-mailveld.
const dopStep = ref<'claim' | 'email'>('claim')
// Urgentie-timer in de Claim nu-knop: start zodra er gekrast is.
const claimSecs = ref(600)
let claimInterval: ReturnType<typeof setInterval> | null = null
const claimTimer = computed(() => {
  const m = Math.floor(claimSecs.value / 60)
  const sec = String(claimSecs.value % 60).padStart(2, '0')
  return `${m}:${sec}`
})
// Zodra ~40% is weggekrast fadet de kraslaag weg en gaat de knop aan.
const scratchDone = ref(false)
watch(scratchDone, (done) => {
  if (done && !claimInterval) {
    claimInterval = setInterval(() => {
      if (claimSecs.value > 0) claimSecs.value -= 1
    }, 1000)
  }
})
onUnmounted(() => {
  if (claimInterval) clearInterval(claimInterval)
})
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
  if (clear / total > 0.4) scratchDone.value = true
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
  if (open && isDopamine.value) nextTick(initScratch)
})
// Afbeeldingsvarianten (switcher rechts onderin de popup).
const POPUP_IMAGES = [
  '/images/pop-up/welness.jpg',
  '/images/pop-up/FotoMetSMaak-8423.jpg',
  '/images/pop-up/Boutique_Hotel_Ter_Zand_-42.jpg',
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
  }, 2000)
}
onMounted(() => {
  setFrNavVariant('1')
  restoreHeroPhotoIndex()
  restoreHomeLayoutVariant()
  setTimeout(() => { popupOpen.value = true }, 1000)
})
</script>

<style scoped>
.home {
  background: #fff;
}

/* Flex-only banner directly below the hero */
.home-flexbanner {
  background: var(--color-discount, #00b67a);
  color: #fff;
}
.home-flexbanner__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 14px;
  padding-bottom: 14px;
}
.home-flexbanner__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.home-flexbanner__icon svg {
  width: 100%;
  height: 100%;
}
.home-flexbanner__text {
  font-size: 16px;
  line-height: 1.4;
}
.home-flexbanner__text strong {
  font-weight: 700;
}

/* Pay-off below the logo (matches /home-v2). Absolutely positioned
   inside .home-hero so it overlays the navbar without disrupting the
   flex flow. top:100 = 34 (overlay padding-top) + 56 (logo bottom
   centred in 88px nav) + 10 gap. */
.hotel-first__tagline {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  z-index: 600;
  pointer-events: none;
}

.hotel-first__tagline-text {
  font-family: 'Biro Script', cursive;
  font-size: 22px;
  font-weight: 400;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1;
  white-space: nowrap;
}

/* ===== HERO ===== */
/* Don't stretch the SiteHeader to fill the hero — let it size to its
   natural nav+padding height (same as on /search) so the absolute-
   positioned search dock lands at the SAME Y on every page. */
.home-hero :deep(.site-header) {
  flex: 0 0 auto;
  align-self: stretch;
  display: block;
  position: relative;
  /* Match internal pages' padding-bottom so the half-protrude trick
     puts the bar's vertical centre at the SiteHeader's bottom edge —
     i.e. exactly where the bar sits on /search, /deal, /hotel. */
  padding-bottom: 38px;
}
/* Use the same absolute-anchored / half-overlap dock that internal
   pages use. Replaces the previous overlay rule (`position: relative;
   margin-top: auto; padding: 0 0 32px`) which pinned the bar to the
   bottom of the hero. */
.home-hero :deep(.site-header--overlay .site-header__search-dock) {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 0;
  padding: 0;
  transform: translateY(50%);
}

.home-hero {
  position: relative;
  isolation: isolate;
  height: 640px;  /* v1: crop 68 px off the bottom; the search bar half-overlaps the nav so the hero stays balanced */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-hero__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}

.home-hero__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  display: block;
}

/* Pills 1 and 8 — shift the cover-fit image 200 px DOWN within the
   same 708-px crop window so more of the upper portion of the photo
   shows. Same trick v4/v5 used with `background-position` — adapted
   to `object-position` (the post-cover image's bottom edge is pushed
   200 px below the container's bottom edge). */
.home-hero__bg--shift-down .home-hero__bg-img {
  object-position: center calc(100% + 200px);
}

.home-hero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.15) 40%, rgba(0, 0, 0, 0.7) 100%);
}

/* Hero credit line — right-aligned with the hamburger / nav-actions */
.home-hero__location {
  position: absolute;
  top: 184px;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.home-hero__location-line {
  display: inline-block;
  width: 18px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Right-aligned help / phone block — sits a few px under the location
   credit line, on top of the hero photo. Stays clickable (pointer
   events on) so calling the number works in-place. */
.home-hero__help {
  position: absolute;
  top: 124px;
  left: 0;
  right: 0;
  /* Sit ABOVE the SiteHeader (z-index 500) so clicks reach the button. */
  z-index: 600;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 6px;
  /* Container itself shouldn't capture clicks — only the phone button
     does — otherwise the whole row would intercept events that should
     reach SiteHeader controls (hamburger, etc.). */
  pointer-events: none;
  color: #fff;
  text-decoration: none;
  font-family: var(--font-body);
}

.home-hero__help-phone {
  pointer-events: auto;
}

.home-hero__help-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  align-self: center;
}

.home-hero__help-label {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.2px;
}

.home-hero__help-phone {
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: color 150ms ease;
}

.home-hero__help-phone:hover,
.home-hero__help-phone:focus-visible {
  color: var(--color-primary);
  text-decoration: underline;
}

.home-hero__help-popover {
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 14px 18px;
  min-width: 200px;
  color: var(--color-text-primary);
}

.home-hero__help-popover-title {
  margin: 0 0 6px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
}

.home-hero__help-popover-row {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.home-hero__help-popover-row--bold {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* Slot content (eyebrow + heading + tagline) — left-aligned, pushed toward
   the bottom of the hero so the photo gets more breathing room above. */
.home-hero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  padding-bottom: 32px;
  /* Anchor the slot's TOP edge to a fixed Y from the top of the hero
     (= browser top). Independent of nav height so v1 and v2 line up
     pixel-perfectly. */
  position: absolute;
  top: 300px;
  left: 0;
  right: 0;
  z-index: 1;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 1.54px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.home-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e97132;
}

.home-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(64px, 10vw, 128px);
  line-height: 0.9;
  font-weight: 400;
  letter-spacing: -3.24px;
  color: #fff;
  margin: 0;
}

.home-hero__title-em {
  font-style: normal;
  font-weight: 600;
}

.home-hero__tagline {
  max-width: 640px;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.1px;
  color: #fff;
  margin: 0;
}

/* Trust row under the search bar — flex-row inside its own .container wrap.
   The flex row itself is width:100% so the first/last items pin to the
   container content edges = the search bar's visible white-card edges. */
.home-hero__trust-wrap {
  /* Explicit positioning identical to the search bar's .container wrapper —
     don't rely on .container alone in case any rule overrides it. */
  width: 100%;
  max-width: var(--container-max);
  margin: 16px auto 0;
  padding: 0 var(--space-lg) 32px;
  box-sizing: border-box;
}

.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 16px;
  width: 100%;
  font-size: 14px;
  letter-spacing: 0.12px;
}

.home-hero__trust-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.home-hero__trust-item--soft {
  color: #fff;
}

.home-hero__trust-star {
  color: #00b57e;
  font-size: 13px;
}

.home-hero__trust-check {
  color: #00b57e;
  font-size: 13px;
}

.home-hero__trust-link {
  color: #fff;
}

/* ===== PERSUASION BAND (directly under the hero) ===== */
.home-persuasion {
  background: #fff;
  padding: 30px 0;  /* −10 px top padding: 40px 0; bottom */
}

.home-persuasion__inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-lg);
}

.home-persuasion__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 var(--space-md);
  text-align: center;
  position: relative;
}

/* All three columns center their icon over the caption text for a
   tidy, symmetrical USP bar — no edge-hugging overrides on first /
   last child anymore. */

/* Vertical divider between columns (skip first). */
.home-persuasion__col + .home-persuasion__col::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12%;
  bottom: 12%;
  width: 1px;
  background: var(--color-border-light);
}

/* All three logos in the USP bar share the same visual height so the
   row reads as a tidy band. */
.home-persuasion__trustpilot {
  height: 56px;
  width: auto;
  display: block;
  object-fit: contain;
}

.home-persuasion__award {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  color: #00B67A;
}

.home-persuasion__award svg {
  height: 56px;
  width: auto;
}

.home-persuasion__text {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.35;
  color: var(--color-text-primary);
  max-width: 320px;
}

@media (max-width: 800px) {
  .home-persuasion__inner {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  .home-persuasion__col + .home-persuasion__col::before { display: none; }
  /* Drop the medal "1M arrangementen" + "Flexibel annuleren" columns —
     only the Trustpilot block stays on mobile. */
  .home-persuasion__col + .home-persuasion__col { display: none; }
}

/* ===== POPULAR FILTERS BAND ===== */
.home-popular {
  background: var(--color-background-secondary, #faf9f6);
  padding: 28px 0;
}

.home-popular__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.home-popular__col {
  display: flex;
  flex-direction: column;
}

.home-popular__heading {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 var(--space-xl);
  color: var(--color-text-primary);
  line-height: 1.1;
}

/* Featured card + "Gezien in" press footer are wrapped as one visual
   card: the wrap owns the shadow + rounded corners + clipping; the
   DealCard inside loses its own frame so it blends in. The press
   footer sits flush below the deal content, separated by a thin grey
   divider only. */
.home-popular__featured-wrap {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Drop the inner DealCard's own frame so the wrap's frame wins. Uses
   :deep because DealCard is scoped to its own component. */
.home-popular__featured-wrap :deep(.deal-card-v2) {
  border-radius: 0;
  box-shadow: none;
}

/* Override the small-card image height (224px) so the featured photo
   keeps the same aspect ratio as the small cards (~12/7) when the
   featured card is rendered at the wider half-container width. */
.home-popular__featured-wrap :deep(.deal-card-v2__image) {
  min-height: 0;
  max-height: none;
  aspect-ratio: 12 / 7;
}

/* "Gezien in:" + three press logos. Label on the left, logos distributed
   evenly across the remaining width via a 1fr-per-logo grid track. */
.home-popular__featured-press {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-md);
}

/* Grey divider above the press footer, inset from the card edges so it
   doesn't run flush to the corners. */
.home-popular__featured-press::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-md);
  right: var(--space-md);
  height: 1px;
  background: var(--color-border-light);
}

.home-popular__featured-press-label {
  /* Match the deal-title typography (Recoleta, 18px/700) so the press
     label reads at the same visual weight as the card title above. */
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.home-popular__logos {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

/* Logos as tall as the cap-height of the "G" in "Gezien in".
   At 24 px heading font-size, cap-height ≈ 18 px. */
.home-popular__logo {
  height: 22px;
  max-height: 22px;
  width: auto;
  object-fit: contain;
  display: block;
  /* Centre each logo inside its 1fr grid cell so the three press logos
     sit at evenly spaced positions across the press footer. */
  justify-self: center;
}

/* Featured Marriott deal under the heading row. Width is bounded by the
   left column so the card fills the available space. */
.home-popular__featured {
  width: 100%;
}

/* Quick-pick pills become a 2-column grid so the right block is ~half
   as wide and roughly twice as tall as the previous full-row layout. */
.home-popular__pills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
/* Desktop: the 3 row-wrappers vanish from layout so the pills become direct
   children of the 2-column grid above (unchanged desktop look). Mobile turns
   each wrapper into its own flex row. */
.home-popular__pill-row {
  display: contents;
}

@media (max-width: 800px) {
  /* Uitgelicht is hidden on mobile, so the 2-col grid isn't needed; a plain
     block also stops the grid track from growing to the pills' content width
     (which broke the horizontal pill scroll). */
  .home-popular__inner {
    display: block;
  }
  .home-popular__col {
    min-width: 0;   /* allow the pill row to shrink + scroll instead of overflowing */
  }
  /* Pills override (3-row horizontal swipe) lives in the larger mobile block below. */
}

.home-pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 13px 17px;
  width: 100%;
  background: #fff;
  border: 1px solid #e5e2da;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: #1a1411;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.home-pill:hover {
  /* Consistent neutral hover: the fill darkens (clearly darker than the
     white base), no stroke change. */
  background: var(--color-border);
}

.home-pill__icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: #1a1411;
  margin-right: 2px;
}

.home-pill__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Partner pill (e.g. "HEMA actie") — the brand logo replaces the icon. */
.home-pill__logo {
  height: 16px;
  width: auto;
  display: block;
  margin-right: 2px;
  flex-shrink: 0;
}

.home-pill__count {
  color: #9a9a93;
}

/* ===== HOTEL DEALS SECTIONS ===== */
.home-deals {
  background: #fff;
  padding: 56px 0;
}

.home-deals--alt {
  background: var(--color-background-secondary, #faf9f6);
}

.home-deals__title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1;
  font-weight: 400;
  letter-spacing: -0.88px;
  color: #0e0e0c;
  margin: 0 0 32px;
}

.home-deals__grid {
  display: grid;
  gap: var(--space-lg);
}

/* Homepage-only: bottom-align the CTA button with the price text's
   bottom edge (default is baseline). `line-height: 1` on the price
   elements collapses the line-box padding below the glyphs so the
   price's box-bottom = glyph-bottom; combined with flex-end on the
   row, the button's bottom border lines up with the price text's
   bottom edge exactly. */
.home-deals :deep(.deal-card-v2__grid-price-row) {
  align-items: flex-end;
}
.home-deals :deep(.deal-card-v2__price-line),
.home-deals :deep(.deal-card-v2__price),
.home-deals :deep(.deal-card-v2__price-prefix),
.home-deals :deep(.deal-card-v2__original) {
  line-height: 1;
}

.home-deals__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1024px) {
  .home-deals__grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  /* Slightly earlier collapse to 1 col so the cards have room on
     small-tablet portrait too. */
  .home-deals__grid--3 { grid-template-columns: 1fr; }
}

/* ==========================================================
   Mobile tweaks (< 800 px) — matches the breakpoint used by
   the SiteHeader compact searchbar swap.
   ========================================================== */
@media (max-width: 800px) {
  /* "Gezien in" press-banner — hidden on mobile per spec. */
  .home-press-banner { display: none; }

  /* "Eerder bekeken" + "Actuele deals" — convert the 3-column grid
     into a horizontal swipe carousel. Each card spans 80 % of the
     viewport width with ~20 vw of the next card peeking at the
     right edge so the user knows it's scrollable. */
  .home-deals__grid--3 {
    display: flex !important;
    flex-direction: row;
    flex-wrap: nowrap;
    grid-template-columns: none;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    gap: 12px;
    /* Negative inline margin escapes the .container's 16 px padding
       so the first card aligns flush-left at 16 px AND the row
       bleeds to the right edge. */
    margin-left: -16px;
    margin-right: -16px;
    padding: 0 16px 8px;
  }
  .home-deals__grid--3 > * {
    flex: 0 0 80vw;
    max-width: 80vw;
    scroll-snap-align: start;
  }
  /* "Actuele deals" (only) stacks vertically — one card under another —
     instead of the horizontal swipe carousel kept for "Eerder bekeken". */
  .home-deals--alt .home-deals__grid--3 {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 16px !important;
    overflow-x: visible !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding: 0 !important;
  }
  .home-deals--alt .home-deals__grid--3 > * {
    flex: initial !important;
    width: auto !important;
    max-width: none !important;
  }

  /* Hero — keep the photo visible (top-aligned), but let the hero
     section grow to fit the searchbar + content below. */
  .home-hero {
    /* Height becomes content-driven; min-height trimmed by 30 px
       (480 → 450) so the hero feels less tall on phones. */
    height: auto;
    min-height: 450px;
  }
  /* Photo top-aligned with container — `center top` (= 0 offset)
     keeps the image fully covering the section with no grey
     strip at the top, while still showing the top portion of
     the photo where the woman's face sits. */
  .home-hero__bg-img,
  .home-hero__bg--shift-down .home-hero__bg-img {
    object-position: center top;
  }

  /* Hero copy: flow naturally below the SiteHeader's mobile search
     trigger instead of absolute-positioned at top: 300 px. Extra
     left padding (24 px vs the standard 16 px content edge) gives
     "SPRING 2026 / Experience more / tagline" some breathing room
     from the viewport edge so the headline doesn't feel pinched. */
  .home-hero__content {
    position: static;
    top: auto;
    left: auto;
    right: auto;
    padding: 24px 16px 32px 28px;
    gap: 16px;
  }

  /* Mobile home layout reorder (search bar below the hero copy) is
     variant-gated in app/assets/css/fr-home-variants.css — variant 1
     keeps the natural order (search pill in the nav, copy below). */
  .home-hero__title {
    font-size: clamp(40px, 12vw, 64px);
    line-height: 1;
    letter-spacing: -1.5px;
  }
  .home-hero__tagline {
    font-size: 16px;
    line-height: 1.45;
  }
  .home-hero__location {
    top: 60px;
    right: 16px;
  }
  .home-hero__trust {
    gap: 16px;
    padding-bottom: 24px;
  }
  /* Hide "Uitgelicht" (the featured-deal column) on mobile. Kept in the
     DOM (incl. its mobile "Bekijk" CTA) so it can be re-enabled later. */
  .home-popular__col--press {
    display: none;
  }

  /* Below the hero the whole page is one continuous grey surface (no more
     white ↔ tinted alternation), so the alternating-background margin logic
     goes away. Every section is transparent over the grey page background;
     the ONLY vertical gap is each section's 32px top padding — i.e. the gap
     between a section's content and the next section's title is a single,
     identical 32px throughout (no doubled top+bottom margins → shorter page). */
  .home {
    background: var(--color-background-secondary, #faf9f6);
  }
  .home-persuasion,
  .home-popular,
  .home-deals,
  .home-categories {
    background: transparent !important;
    padding-top: 32px !important;
    padding-bottom: 0 !important;
  }
  /* Last section before the (dark) footer keeps a 32px bottom gap so the
     cards don't sit flush against it. */
  .home-deals--alt {
    padding-bottom: 32px !important;
  }
  .home-popular__heading,
  .home-deals__title {
    margin-bottom: 20px;
  }

  /* Quick filter pills: 3 rows that scroll horizontally (swipe). Columns
     fill left-to-right, 3 rows tall; the row bleeds past the .container
     inset so it scrolls edge-to-edge. */
  /* 3 horizontally-scrolling rows. The container is a vertical stack and the
     single scroll viewport; each row packs its own chips left-to-right, so a
     pill sits right after the previous pill in its row — no shared columns. */
  .home-popular__pills {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -16px;
    padding: 0 16px 4px;
  }
  .home-popular__pill-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    width: max-content;   /* grow past the viewport so the row scrolls */
  }
  .home-pill {
    width: auto;
    flex: 0 0 auto;        /* hug the label */
    white-space: nowrap;
  }
}

/* Journey-variantlabel rechts van het ViaLuxury-logo in de FR-header */
.journey-badge {
  position: absolute;
  top: 40px;
  left: 250px;
  z-index: 60;
  background: rgba(26, 30, 30, 0.55);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 100px;
  white-space: nowrap;
  pointer-events: none;
}

/* Kortingspopup (void): overlay + lege witte kaart, inhoud volgt */
.np {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(26, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
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
.np__cta:disabled {
  background: #e5e5e5;
  color: #9a9a9a;
  cursor: not-allowed;
}
/* Claim nu: timer rechts van de CTA-tekst */
.np__cta--claim {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.np__timer {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  opacity: 0.92;
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
/* Kraskaart (dopamine-variant): bedekt subtitel t/m disclaimer */
.np__scratch {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}
.np__scratch--done {
  border-color: transparent;
}
.np__scratch-under {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px 18px;
  background: #fff;
}
/* Kortingstekst onder de kraslaag: 2x zo groot */
.np__scratchtext {
  font-size: 36px;
  line-height: 1.15;
  font-weight: 800;
  color: #1a1e1e;
  text-align: center;
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
.np {
  animation: np-fade-in 0.25s ease;
}
@keyframes np-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
