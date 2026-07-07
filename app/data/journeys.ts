// Journey-varianten: nummer + beschrijvende naam. Zichtbaar op de
// startscherm-knoppen en in de header van elke journey-pagina.

export const JOURNEY_NAMES: Record<string, string> = {
  '1': 'Toon prijs in kalenderstap',
  '2': 'Verberg prijs in kalenderstap',
  '3': 'Combineer kalender en room table',
  '4': 'Goedkoopste kamer voorgeselecteerd',
  '5': 'Extra stap, forced choice',
  '6': 'Forced choice met totaalprijzen',
  '7': 'Forced choice + andere extra\'s',
}

// Eén kortingsfactor voor de hele journey: de kalender toont €459 van €867,
// en de room table rekent zijn doorgestreepte prijzen met dezelfde factor
// zodat het besparingspercentage in elke stap gelijk is.
export const JOURNEY_WAS_FACTOR = 459 / 867

export function journeyKey(param: unknown): string {
  const v = Array.isArray(param) ? param[0] : param
  return typeof v === 'string' && v in JOURNEY_NAMES ? v : '1'
}

export function journeyLabel(v: string): string {
  return `Variant ${v} — ${JOURNEY_NAMES[v] ?? ''}`
}
