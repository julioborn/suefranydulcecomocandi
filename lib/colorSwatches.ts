const PALETTE: Record<string, string> = {
  negro: '#111111',
  blanco: '#FFFFFF',
  gris: '#9CA3AF',
  beige: '#E3D5B8',
  marron: '#6B4226',
  rojo: '#DC2626',
  rosa: '#F472B6',
  fucsia: '#EC4899',
  bordo: '#7F1D3D',
  naranja: '#F97316',
  amarillo: '#FACC15',
  verde: '#22C55E',
  celeste: '#38BDF8',
  azul: '#2563EB',
  violeta: '#8B5CF6',
  lila: '#C4B5FD',
  dorado: '#D4AF37',
  plateado: '#B8BCC2',
  turquesa: '#14B8A6',
}

const DIACRITICS_REGEX = /[̀-ͯ]/g

function normalize(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(DIACRITICS_REGEX, '')
}

export function getColorSwatch(name: string): string | null {
  return PALETTE[normalize(name)] ?? null
}
