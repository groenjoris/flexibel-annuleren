// Journey-varianten: nummer + beschrijvende naam. Zichtbaar op de
// startscherm-knoppen en in de header van elke journey-pagina.

// Labels volgen de indeling van het startscherm (Variant A t/m D).
export const JOURNEY_NAMES: Record<string, string> = {
  '1': 'Variant C — Prijs wel tonen in kalenderstap',
  '2': 'Variant C — Prijs niet tonen in kalenderstap',
  '3': 'Variant B — Room table + sidebar + kalender',
  '4': 'Variant C — Goedkoopste voorgeselecteerd',
  '5': 'Variant D — Forced choice €15 i.p.v. totaalprijs',
  '6': 'Variant A — Forced choice zonder extra\'s',
  '7': 'Variant A — Forced choice met extra\'s',
  // Finale varianten (na klantfeedback).
  '8': 'Final A — Forced choice zonder extra\'s',
  '9': 'Final A — Forced choice met extra\'s',
  '10': 'Final B — Room table met sidebar',
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
  return JOURNEY_NAMES[v] ?? ''
}
