const PINK = '#F0C7D6'
const CREAM = '#FDFAF7'

const STRIPE_WIDTH = 100
const CANOPY_HEIGHT = 60
const SCALLOP_RADIUS = STRIPE_WIDTH / 2

const COLORS = [PINK, CREAM, PINK, CREAM, PINK, CREAM, PINK]

export default function StoreAwning({ className }: { className?: string }) {
  const width = STRIPE_WIDTH * COLORS.length
  const height = CANOPY_HEIGHT + SCALLOP_RADIUS

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {COLORS.map((color, i) => {
        const x0 = i * STRIPE_WIDTH
        const x1 = x0 + STRIPE_WIDTH
        return (
          <path
            key={i}
            d={`M ${x0} 0 H ${x1} V ${CANOPY_HEIGHT} A ${SCALLOP_RADIUS} ${SCALLOP_RADIUS} 0 0 1 ${x0} ${CANOPY_HEIGHT} Z`}
            fill={color}
          />
        )
      })}
    </svg>
  )
}
