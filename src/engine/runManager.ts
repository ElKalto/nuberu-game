import { registerNodes, getNode } from './nodeEngine'
import { registerEvents, getEvent, getVisibleChoices, type EventOutcome } from './eventEngine'
import type { GameNode } from '@/types'
import type { GameEvent } from './eventEngine'

// --- Carga de datos ---

export async function loadDungeonData(dungeonId: string): Promise<void> {
  const [dungeonNodes, dungeonEvents] = await Promise.all([
    fetch(`/data/dungeon/${dungeonId}.json`).then((r) => r.json()),
    fetch(`/data/dungeon/events_01.json`).then((r) => r.json()),
  ])
  registerNodes(dungeonNodes as GameNode[])
  registerEvents(dungeonEvents as GameEvent[])
}

export async function loadVillageData(): Promise<void> {
  const [village, tavern, chest] = await Promise.all([
    fetch('/data/village/village.json').then((r) => r.json()),
    fetch('/data/village/tavern.json').then((r) => r.json()),
    fetch('/data/village/chest.json').then((r) => r.json()),
  ])
  registerNodes([village, tavern, chest] as GameNode[])
}

export async function loadPathData(pathId: string): Promise<void> {
  const nodes = await fetch(`/data/paths/${pathId}.json`).then((r) => r.json())
  registerNodes(nodes as GameNode[])
}

// --- Torch system ---

const TORCH_MAX = 20 // pasos antes de quedarse sin luz

export interface TorchState {
  steps: number
  max: number
  isOut: boolean
}

export function createTorch(): TorchState {
  return { steps: TORCH_MAX, max: TORCH_MAX, isOut: false }
}

export function consumeTorch(torch: TorchState): TorchState {
  const steps = Math.max(0, torch.steps - 1)
  return { ...torch, steps, isOut: steps === 0 }
}

export function refillTorch(torch: TorchState, amount: number): TorchState {
  const steps = Math.min(torch.max, torch.steps + amount)
  return { ...torch, steps, isOut: false }
}

// --- Resolución de outcomes ---

export interface OutcomeResult {
  flags: string[]
  items: string[]
  loreFragments: string[]
  damage: number
  navigateTo: string | null
  isDead: boolean
}

export function resolveOutcomes(
  outcomes: EventOutcome[],
  currentHealth: number
): OutcomeResult {
  const result: OutcomeResult = {
    flags: [],
    items: [],
    loreFragments: [],
    damage: 0,
    navigateTo: null,
    isDead: false,
  }

  for (const outcome of outcomes) {
    switch (outcome.type) {
      case 'flag':
        result.flags.push(outcome.value)
        break
      case 'item':
        result.items.push(outcome.value)
        break
      case 'lore':
        result.loreFragments.push(outcome.fragmentId)
        break
      case 'damage':
        result.damage += outcome.amount
        break
      case 'navigate':
        result.navigateTo = outcome.targetNodeId
        break
      case 'death':
        result.isDead = true
        break
    }
  }

  if (currentHealth - result.damage <= 0) {
    result.isDead = true
  }

  return result
}

// --- Utilidades de nodo ---

export function getOnEnterEvent(nodeId: string): GameEvent | undefined {
  const node = getNode(nodeId)
  if (!node?.onEnterEvent) return undefined
  return getEvent(node.onEnterEvent)
}

export { getNode, getEvent, getVisibleChoices }