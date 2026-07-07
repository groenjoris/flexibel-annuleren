<script setup lang="ts">
// MOBIELE site — stap 0: datum kiezen. Aparte site (niet responsive):
// alleen de kalender, geen samenvatting. Een datumkeuze scrollt naar de CTA.
import { journeyKey } from '~/data/journeys'
import { trustpilot } from '~/data/deal'

const route = useRoute()
const jv = computed(() => journeyKey(route.params.v))

const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

// Zelfde datamodel als de desktopkalender.
const view = reactive({ year: 2026, month: 7 }) // augustus 2026
const selected = ref<{ year: number; month: number; day: number } | null>(null)

function prevMonth() {
  view.month -= 1
  if (view.month < 0) {
    view.month = 11
    view.year -= 1
  }
}
function nextMonth() {
  view.month += 1
  if (view.month > 11) {
    view.month = 0
    view.year += 1
  }
}

const PRICE_BY_WEEKDAY = [459, 469, 469, 469, 489, 509, 479] // zo..za

function priceFor(day: number) {
  return PRICE_BY_WEEKDAY[new Date(view.year, view.month, day).getDay()]
}

function isUnavailable(day: number) {
  if (view.year === 2026 && view.month === 7) {
    return (day >= 2 && day <= 8) || (day >= 13 && day <= 15)
  }
  const start = ((view.month * 7) % 25) + 2
  return day >= start && day <= start + 3
}

interface CalendarCell {
  day: number | null
  price?: number
  unavailable?: boolean
}

const cells = computed<CalendarCell[]>(() => {
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7
  const list: CalendarCell[] = []
  for (let i = 0; i < firstWeekday; i++) list.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const unavailable = isUnavailable(d)
    list.push({ day: d, unavailable, price: unavailable ? undefined : priceFor(d) })
  }
  return list
})

const lowestPrice = computed(() =>
  Math.min(...cells.value.filter((c) => c.day && !c.unavailable).map((c) => c.price ?? Infinity)),
)

const NIGHTS = 2

function cellRole(day: number): 'in' | 'mid' | 'uit' | null {
  const s = selected.value
  if (!s || s.year !== view.year || s.month !== view.month) return null
  if (day === s.day) return 'in'
  if (day > s.day && day < s.day + NIGHTS) return 'mid'
  if (day === s.day + NIGHTS) return 'uit'
  return null
}

const ctaEl = ref<HTMLElement | null>(null)

function pick(cell: CalendarCell) {
  if (!cell.day || cell.unavailable) return
  selected.value = { year: view.year, month: view.month, day: cell.day }
  // Mobiel: na een datumkeuze naar de CTA scrollen.
  nextTick(() => ctaEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
}

const dayPrice = computed(() => {
  const s = selected.value
  return s ? PRICE_BY_WEEKDAY[new Date(s.year, s.month, s.day).getDay()] : 0
})

// Datumlabels voor de samenvatting op de volgende stap.
const WEEKDAY_LABELS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const MONTH_SHORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
function formatDay(offset: number) {
  const s = selected.value
  if (!s) return ''
  const d = new Date(s.year, s.month, s.day + offset)
  return `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

// Kalenderprijs + datums delen met de checkout (zelfde state als desktop).
const journeyDay = useState<{ price: number; checkIn?: string; checkOut?: string } | null>(
  'journey-day',
  () => null,
)
watch(
  [selected, dayPrice],
  () => {
    journeyDay.value = selected.value
      ? { price: dayPrice.value, checkIn: formatDay(0), checkOut: formatDay(NIGHTS) }
      : null
  },
  { immediate: true },
)
</script>

<template>
  <div class="mpage">
    <CheckoutMobileHeader :step="1" />

    <main class="mpage__main">
      <h1 class="mtitle">Selecteer aankomstdatum</h1>

      <section class="mcal">
        <p class="mcal__intro">
          Getoonde prijs is voor het complete arrangement voor 2 personen voor 2 nachten.
        </p>

        <!-- Zelfde kalenderlayout als op de dealpagina (CalendarMonth/DayCell) -->
        <div class="mcal__nav">
          <button class="mcal__navbtn" type="button" aria-label="Vorige maand" @click="prevMonth">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span class="mcal__month">{{ MONTH_NAMES[view.month] }} {{ view.year }}</span>
          <button class="mcal__navbtn" type="button" aria-label="Volgende maand" @click="nextMonth">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div class="mcal__weekdays">
          <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
        </div>

        <div class="mcal__grid">
          <template v-for="(cell, i) in cells" :key="i">
            <span v-if="cell.day === null" class="mcal__cell mcal__cell--empty" />
            <button
              v-else
              type="button"
              class="mcal__cell"
              :class="{
                'mcal__cell--unavailable': cell.unavailable,
                'mcal__cell--in': cellRole(cell.day) === 'in',
                'mcal__cell--range': cellRole(cell.day) === 'mid' || cellRole(cell.day) === 'uit',
              }"
              :disabled="cell.unavailable"
              @click="pick(cell)"
            >
              <span v-if="cellRole(cell.day) === 'in'" class="mcal__badge">in</span>
              <span v-else-if="cellRole(cell.day) === 'uit'" class="mcal__badge">uit</span>
              <span
                v-if="cell.price === lowestPrice && !cell.unavailable && cellRole(cell.day) === null"
                class="mcal__star"
              >★</span>
              <span class="mcal__day">{{ cell.day }}</span>
              <span v-if="cell.unavailable" class="mcal__sold">-</span>
              <span v-else-if="cellRole(cell.day) === 'in'" class="mcal__price mcal__price--selected">€{{ cell.price }}</span>
              <span
                v-else-if="cellRole(cell.day) === null"
                class="mcal__price"
                :class="{ 'mcal__price--cheapest': cell.price === lowestPrice }"
              >€{{ cell.price }}</span>
            </button>
          </template>
        </div>

        <div class="mcal__legend">
          <span class="mcal__legenditem"><span class="mcal__legendstar">★</span> Laagste prijs</span>
          <span class="mcal__legenditem"><span class="mcal__swatch" /> Niet beschikbaar</span>
        </div>
      </section>

      <div ref="ctaEl" class="mcta">
        <button
          class="btn-primary mcta__btn"
          type="button"
          :disabled="selected === null"
          @click="navigateTo(`/m/journey/${jv}/checkout`)"
        >
          {{ selected === null ? 'Selecteer eerst een datum' : 'Opslaan en doorgaan' }}
        </button>
      </div>

      <div class="mtrust">
        <img src="/images/trustpilot.svg" alt="Trustpilot" />
        <span class="t-body t-bold">{{ trustpilot.score }}/{{ trustpilot.outOf }}</span>
      </div>
    </main>

    <CheckoutSiteFooter />
  </div>
</template>

<style scoped>
.mpage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--c-white);
  /* Aparte mobiele site: smal ontwerp, ook op een breed scherm */
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}
.mpage__main {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.mtitle {
  font-size: 34px;
  line-height: 42px;
  font-weight: var(--w-black);
}

/* Kalenderkaart */
.mcal {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mcal__intro {
  text-align: center;
  font-weight: var(--w-black);
  font-size: 17px;
  line-height: 26px;
  color: var(--c-grey);
  padding: 0 8px;
}
/* Kalender exact als op de dealpagina (CalendarMonth + CalendarDayCell):
   R1-tokens hardcoded — groen #00B67A, oranje #e97132, tekst #1A1A1A. */
.mcal__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}
.mcal__month {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}
.mcal__navbtn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fbfaf8;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mcal__navbtn:hover {
  background: #f0f0f0;
}
.mcal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #555555;
  font-size: 13px;
  font-weight: 600;
}
.mcal__weekdays span {
  padding: 8px 0;
}
.mcal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 52px;
}
.mcal__cell {
  position: relative;
  display: grid;
  grid-template-rows: 22px 16px;
  align-items: center;
  justify-items: center;
  padding: 6px 4px;
  height: 52px;
  overflow: hidden;
  border-radius: 6px;
  background: none;
  color: #1a1a1a;
}
.mcal__cell--empty {
  background: transparent;
}
.mcal__cell--unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}
.mcal__cell--in {
  background: #00b67a;
}
.mcal__cell--in .mcal__day,
.mcal__cell--in .mcal__price {
  color: #fff;
}
.mcal__cell--range {
  background: color-mix(in srgb, #00b67a 45%, #fff);
}
.mcal__cell--range .mcal__day {
  color: #fff;
}
.mcal__day {
  grid-row: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
}
.mcal__sold {
  grid-row: 2;
  font-size: 14px;
  font-weight: 600;
  color: #999999;
  line-height: 1;
}
.mcal__price {
  grid-row: 2;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1;
}
.mcal__price--cheapest {
  color: #00b67a;
}
.mcal__price--selected {
  color: rgba(255, 255, 255, 0.9);
}
/* Sterretje linksboven in de cel van de laagste prijs (zoals de dealpagina) */
.mcal__star {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  line-height: 1;
  color: #00b67a;
  pointer-events: none;
}
/* In/uit-badge strak in de rechterbovenhoek (14×14, zwart, geen radius) */
.mcal__badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  pointer-events: none;
}
.mcal__legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #555555;
}
.mcal__legenditem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.mcal__legendstar {
  font-size: 14px;
  line-height: 1;
  color: #e97132;
}
.mcal__swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: #dbdbdb;
  opacity: 0.7;
}

/* CTA + Trustpilot */
.mcta {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}
.mcta__btn {
  width: auto;
  min-width: 300px;
  font-size: 20px;
  padding: 18px 32px;
}
.mtrust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-bottom: 8px;
}
.mtrust img {
  height: 44px;
}
</style>
