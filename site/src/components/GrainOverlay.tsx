export function GrainOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ opacity: 0.045 }}>
      <svg className="hidden">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        className="absolute inset-[-200%] animate-grain"
        style={{ filter: 'url(#grain)' }}
      />
    </div>
  )
}
