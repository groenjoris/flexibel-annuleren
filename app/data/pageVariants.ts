// Page-level checkout variants, switchable via the dev VariantSwitcher (?variant=).
// A variant may live on its own route (path) — e.g. the homepage-only variant.

export interface PageVariant {
  key: string
  label: string
  path?: string // route the variant lives on (default '/')
}

export const pageVariants: PageVariant[] = [
  { key: 'current', label: 'Huidige versie (niet compliant)' },
  { key: 'twocards', label: '1a — 2 room cards' },
  { key: 'incard', label: '1b — Switch binnen de room card' },
  { key: 'forcedstep', label: '2a — Forced choice, extra stap' },
  { key: 'forcedpopup', label: '2b — Forced choice, pop-up' },
  { key: 'laststep', label: '2c — Forced choice, laatste stap' },
  { key: 'forcedtotal', label: '2d — Forced choice, totaalprijzen' },
  { key: 'flexonly', label: '3 — Alleen maar flex aanbieden', path: '/home' },
]

export const defaultVariant = 'current'
