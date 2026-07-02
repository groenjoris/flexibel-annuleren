// Page-level checkout variants, switchable via the dev VariantSwitcher (?variant=).
// A variant may live on its own route (path) — e.g. the homepage-only variant.

export interface PageVariant {
  key: string
  label: string
  path?: string // route the variant lives on (default '/')
}

export const pageVariants: PageVariant[] = [
  { key: 'current', label: 'Huidige versie (niet compliant)' },
  { key: 'twocards', label: 'Twee room cards (booking.com-style)' },
  { key: 'incard', label: 'Switch binnen de room card' },
  { key: 'forcedstep', label: 'Extra stap, forced choice' },
  { key: 'forcedpopup', label: 'Pop-up, forced choice' },
  { key: 'laststep', label: 'Laatste stap, forced choice' },
  { key: 'flexonly', label: 'Alleen maar flex aanbieden (homepage)', path: '/home' },
]

export const defaultVariant = 'current'
