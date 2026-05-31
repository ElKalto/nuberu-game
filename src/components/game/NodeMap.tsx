'use client'

import { useState } from 'react'
import type { GameNode, Hotspot } from '@/types'
import { getVisibleHotspots, resolveNavigation } from '@/engine/nodeEngine'

interface NodeMapProps {
  node: GameNode
  activeFlags: string[]
  onNavigate: (targetNodeId: string) => void
  onEvent: (eventId: string) => void
}

export default function NodeMap({
  node,
  activeFlags,
  onNavigate,
  onEvent,
}: NodeMapProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null)
  const visibleHotspots = getVisibleHotspots(node, activeFlags)

  function handleHotspotClick(hotspot: Hotspot) {
    const resolution = resolveNavigation(hotspot)
    if (!resolution) return

    if (resolution.type === 'navigate') {
      onNavigate(resolution.targetNodeId)
    } else if (resolution.type === 'event') {
      onEvent(resolution.eventId)
    }
  }

  return (
    <div className="relative w-full h-full select-none">

      {/* Fondo de escena */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${node.backgroundImage})` }}
      />

      {/* Overlay oscuro atmosférico */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Título y descripción */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <h2 className="text-amber-200 text-lg font-serif tracking-wide drop-shadow-lg">
          {node.title}
        </h2>
        <p className="text-stone-300 text-sm mt-1 max-w-xl leading-relaxed drop-shadow">
          {node.description}
        </p>
      </div>

      {/* Hotspots */}
      {visibleHotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          className={`
            absolute z-20 group
            transition-all duration-200
            ${hoveredHotspot === hotspot.id ? 'scale-110' : 'scale-100'}
          `}
          style={{
            left: `${hotspot.position.x}%`,
            top: `${hotspot.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseEnter={() => setHoveredHotspot(hotspot.id)}
          onMouseLeave={() => setHoveredHotspot(null)}
          onClick={() => handleHotspotClick(hotspot)}
        >
          {/* Punto de interacción */}
          <div className={`
            w-4 h-4 rounded-full border-2
            ${hoveredHotspot === hotspot.id
              ? 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/50'
              : 'bg-amber-600/60 border-amber-400/60'
            }
            transition-all duration-200
          `} />

          {/* Etiqueta */}
          <span className={`
            absolute bottom-6 left-1/2 -translate-x-1/2
            whitespace-nowrap text-xs text-amber-100
            bg-black/70 px-2 py-1 rounded
            border border-amber-800/40
            transition-all duration-200
            ${hoveredHotspot === hotspot.id ? 'opacity-100' : 'opacity-0'}
          `}>
            {hotspot.label}
          </span>
        </button>
      ))}

      {/* Indicador de antorcha (slot para props futuras) */}
      <div className="absolute bottom-4 right-4 z-20 text-stone-400 text-xs">
        {/* TorchIndicator se añadirá aquí */}
      </div>

    </div>
  )
}