import { journeyLabel } from '~/data/journeys'

// Namen van de newsletter-popup-varianten (v11) voor het header-badge.
const POPUP_VARIANT_NAMES: Record<string, string> = {
  simple: 'Simple',
  dopamine: 'Dopamine',
  huidige: 'Huidige',
  fotobg: 'Foto bg',
  sweepstake: 'Sweepstake',
  vipmember: 'VIP member',
  hans: 'Hans van der Togt',
  // Second round
  claim2: 'R2 — Claim je korting',
  rad2: 'R2 — Rad van Fortuin',
  kras2: 'R2 — Kraslot',
}

/**
 * Label voor het variant-badge in de header. Voor de newsletter-flow (v11)
 * toont hij de gekozen popup-variant (gedeelde np-variant state) i.p.v. het
 * statische "Base" uit de journey-registry.
 */
export function useJourneyLabel(jv: Ref<string>) {
  const npVariant = useState<string>('np-variant', () => 'simple')
  const route = useRoute()
  return computed(() => {
    if (jv.value === '11') {
      // De query wint (direct juist bij SSR/first paint); daarna de
      // gedeelde state die de popup-component bijhoudt.
      const q = route.query.popup
      const v = typeof q === 'string' && q in POPUP_VARIANT_NAMES ? q : npVariant.value
      return `Newsletter opt-in — ${POPUP_VARIANT_NAMES[v] ?? v}`
    }
    return journeyLabel(jv.value)
  })
}
