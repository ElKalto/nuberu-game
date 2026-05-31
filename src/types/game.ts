export type GamePhase = 'village' | 'path' | 'dungeon' | 'game_over' | 'run_complete'

export interface Explorer {
  id: string
  name: string
  trait: string // rasgo narrativo, ej: "cazador curtido", "monje errante"
  isAlive: boolean
}

export interface RunState {
  explorerId: string
  currentNodeId: string
  visitedNodes: string[]
  inventory: string[]
  activeFlags: string[] // decisiones tomadas, puertas abiertas, etc.
}

export interface PersistentState {
  completedRuns: number
  unlockedLoreFragments: string[]
  chestItems: string[]
  deadExplorers: string[]
  villageFlags: string[] // mejoras o cambios permanentes en la aldea
}

export interface GameState {
  phase: GamePhase
  currentRun: RunState | null
  persistent: PersistentState
}