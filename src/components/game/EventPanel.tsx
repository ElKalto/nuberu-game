'use client'

import type { GameEvent, EventChoice } from '@/engine/eventEngine'
import { getVisibleChoices } from '@/engine/eventEngine'

interface EventPanelProps {
  event: GameEvent
  activeFlags: string[]
  onChoice: (choice: EventChoice) => void
}

export default function EventPanel({
  event,
  activeFlags,
  onChoice,
}: EventPanelProps) {
  const visibleChoices = getVisibleChoices(event, activeFlags)

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center pb-8 px-4">

      {/* Fondo semitransparente */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-stone-900/95 border border-stone-700 rounded-sm p-6 shadow-2xl">

        {/* Título del evento */}
        <h3 className="text-amber-300 font-serif text-lg mb-3 tracking-wide">
          {event.title}
        </h3>

        {/* Descripción */}
        <p className="text-stone-300 text-sm leading-relaxed mb-6">
          {event.description}
        </p>

        {/* Opciones */}
        <div className="flex flex-col gap-2">
          {visibleChoices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice)}
              className="
                text-left px-4 py-3
                border border-stone-600 hover:border-amber-600
                text-stone-300 hover:text-amber-200
                bg-stone-800/60 hover:bg-stone-700/60
                text-sm transition-all duration-150
                rounded-sm
              "
            >
              › {choice.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}