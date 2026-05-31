'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { loadVillageData, loadPathData, loadDungeonData, getOnEnterEvent, resolveOutcomes, createTorch, consumeTorch, type TorchState, type OutcomeResult } from '@/engine/runManager'
import { getNode, getVisibleHotspots } from '@/engine/nodeEngine'
import { getEvent } from '@/engine/eventEngine'
import type { EventChoice, GameEvent } from '@/engine/eventEngine'
import type { GameNode } from '@/types'
import NodeMap from '@/components/game/NodeMap'
import EventPanel from '@/components/game/EventPanel'

const PLAYER_MAX_HEALTH = 100
const START_NODE = 'village_main'
const EXPLORER_ID = 'explorer_01'

export default function GamePage() {
  const {
    phase,
    currentRun,
    setPhase,
    setCurrentNode,
    startRun,
    endRun,
    addVisitedNode,
    addFlag,
    hasFlag,
    addToInventory,
    unlockLore,
    resetRun,
  } = useGameStore()

  const [currentNode, setCurrentNodeLocal] = useState<GameNode | null>(null)
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null)
  const [health, setHealth] = useState(PLAYER_MAX_HEALTH)
  const [torch, setTorch] = useState<TorchState>(createTorch())
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  // --- Carga inicial ---
  useEffect(() => {
    async function init() {
      setIsLoading(true)
      await Promise.all([
        loadVillageData(),
        loadPathData('path_01'),
        loadDungeonData('dungeon_01'),
      ])

      if (!currentRun) {
        startRun(EXPLORER_ID, START_NODE)
      }

      setIsLoading(false)
    }
    init()
  }, [])

  // --- Sincronizar nodo local con store ---
  useEffect(() => {
    if (!currentRun?.currentNodeId) return
    const node = getNode(currentRun.currentNodeId)
    if (node) {
      setCurrentNodeLocal(node)

      // Disparar evento de entrada si existe
      const enterEvent = getOnEnterEvent(node.id)
      if (enterEvent) setActiveEvent(enterEvent)
    }
  }, [currentRun?.currentNodeId])

  // --- Navegar a un nodo ---
  const handleNavigate = useCallback((targetNodeId: string) => {
    if (!currentRun) return

    // Consumir antorcha si estamos en mazmorra
    if (phase === 'dungeon') {
      const newTorch = consumeTorch(torch)
      setTorch(newTorch)
      if (newTorch.isOut) {
        showMessage('La antorcha se apaga. La oscuridad es total.')
        setTimeout(() => handleDeath(), 2000)
        return
      }
    }

    setCurrentNode(targetNodeId)
    addVisitedNode(targetNodeId)

    // Actualizar fase según tipo de nodo
    const node = getNode(targetNodeId)
    if (node) {
      if (node.type === 'village') setPhase('village')
      if (node.type === 'path') setPhase('path')
      if (node.type === 'dungeon') setPhase('dungeon')
    }
  }, [currentRun, phase, torch])

  // --- Abrir evento ---
  const handleEvent = useCallback((eventId: string) => {
    const event = getEvent(eventId)
    if (event) setActiveEvent(event)
  }, [])

  // --- Resolver elección de evento ---
  const handleChoice = useCallback((choice: EventChoice) => {
    if (!currentRun) return

    const result: OutcomeResult = resolveOutcomes(choice.outcomes, health)

    // Aplicar flags
    result.flags.forEach(addFlag)

    // Aplicar items
    result.items.forEach(addToInventory)

    // Aplicar lore
    result.loreFragments.forEach(unlockLore)

    // Aplicar daño
    if (result.damage > 0) {
      const newHealth = health - result.damage
      setHealth(newHealth)
      showMessage(`Pierdes ${result.damage} de salud.`)
    }

    // Navegar si el outcome lo indica
    if (result.navigateTo) {
      handleNavigate(result.navigateTo)
    }

    // Muerte
    if (result.isDead) {
      handleDeath()
      return
    }

    setActiveEvent(null)
  }, [currentRun, health])

  // --- Muerte ---
  function handleDeath() {
    showMessage('Tu explorador cae. La tormenta recuerda su nombre.')
    setTimeout(() => {
      endRun(false)
      setHealth(PLAYER_MAX_HEALTH)
      setTorch(createTorch())
      resetRun()
    }, 3000)
  }

  // --- Mensaje temporal ---
  function showMessage(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(null), 3000)
  }

  // --- Estados de UI ---
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-sm tracking-widest animate-pulse">
          La niebla se asienta...
        </p>
      </div>
    )
  }

  if (phase === 'game_over') {
    return (
      <div className="w-screen h-screen bg-stone-950 flex flex-col items-center justify-center gap-6">
        <h1 className="text-red-900 font-serif text-3xl tracking-widest">
          El Nuberu recuerda tu nombre
        </h1>
        <p className="text-stone-500 text-sm">Tu explorador ha muerto.</p>
        <button
          onClick={() => { resetRun(); startRun(EXPLORER_ID, START_NODE) }}
          className="px-6 py-3 border border-stone-700 text-stone-400 hover:text-amber-300 hover:border-amber-700 text-sm transition-all"
        >
          Enviar otro explorador
        </button>
      </div>
    )
  }

  if (!currentNode) {
    return (
      <div className="w-screen h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-600 text-sm">Sin nodo activo.</p>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-stone-950 overflow-hidden relative">

      {/* Escena principal */}
      <NodeMap
        node={currentNode}
        activeFlags={currentRun?.activeFlags ?? []}
        onNavigate={handleNavigate}
        onEvent={handleEvent}
      />

      {/* Panel de evento activo */}
      {activeEvent && (
        <EventPanel
          event={activeEvent}
          activeFlags={currentRun?.activeFlags ?? []}
          onChoice={handleChoice}
        />
      )}

      {/* HUD — salud y antorcha */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="text-xs text-stone-400 bg-black/50 px-3 py-1 rounded-sm border border-stone-800">
          ❤ {health} / {PLAYER_MAX_HEALTH}
        </div>
        {phase === 'dungeon' && (
          <div className={`text-xs px-3 py-1 rounded-sm border bg-black/50
            ${torch.steps <= 5
              ? 'text-red-400 border-red-900 animate-pulse'
              : 'text-amber-400 border-stone-800'
            }`}>
            🕯 {torch.steps} / {torch.max}
          </div>
        )}
      </div>

      {/* Fase actual */}
      <div className="absolute bottom-4 left-4 z-20 text-stone-600 text-xs tracking-widest uppercase">
        {phase}
      </div>

      {/* Mensaje temporal */}
      {message && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40
          bg-black/80 text-stone-300 text-sm px-4 py-2 rounded-sm
          border border-stone-700 animate-pulse">
          {message}
        </div>
      )}

    </div>
  )
}