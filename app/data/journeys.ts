// Journey-varianten: nummer + beschrijvende naam. Zichtbaar op de
// startscherm-knoppen en in de header van elke journey-pagina.

export const JOURNEY_NAMES: Record<string, string> = {
  '1': 'Toon prijs bij kalender en daarna even niet',
  '2': 'Verberg prijs in kalenderstap',
  '3': 'Combineer kalender en room table',
  '4': 'Goedkoopste kamer voorgeselecteerd',
}

export function journeyKey(param: unknown): string {
  const v = Array.isArray(param) ? param[0] : param
  return typeof v === 'string' && v in JOURNEY_NAMES ? v : '1'
}

export function journeyLabel(v: string): string {
  return `Variant ${v} — ${JOURNEY_NAMES[v] ?? ''}`
}
