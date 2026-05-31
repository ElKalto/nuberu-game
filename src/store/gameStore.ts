import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, GamePhase, RunState, PersistentState } from '@/types'

const initialPersistent: PersistentState = {
  completedRuns: 0,
  unlockedLoreFragments: [],
  chestItems: [],
  deadExplorers: [],
  villageFlags: [],
}

interface GameStore extends GameState {
  // Navegación
  setPhase: (phase: GamePhase) => void
  setCurrentNode: (nodeId: string) => void

  // Run
  startRun: (explorerId: string, startNodeId: string) => void
  endRun: (survived: boolean) => void
  addVisitedNode: (nodeId: string) => void
  addFlag: (flag: string) => void
  hasFlag: (flag: string) => boolean
  addToInventory: (itemId: string) => void

  // Persistencia
  unlockLore: (fragmentId: string) => void
  addToChest: (itemId: string) => void
  resetRun: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'village',
      currentRun: null,
      persistent: initialPersistent,

      setPhase: (phase) => set({ phase }),

      setCurrentNode: (nodeId) =>
        set((state) => ({
          currentRun: state.currentRun
            ? { ...state.currentRun, currentNodeId: nodeId }
            : null,
        })),

      startRun: (explorerId, startNodeId) =>
        set({
          phase: 'path',
          currentRun: {
            explorerId,
            currentNodeId: startNodeId,
            visitedNodes: [startNodeId],
            inventory: [],
            activeFlags: [],
          },
        }),

      endRun: (survived) =>
        set((state) => ({
          phase: survived ? 'run_complete' : 'game_over',
          persistent: {
            ...state.persistent,
            completedRuns: survived
              ? state.persistent.completedRuns + 1
              : state.persistent.completedRuns,
          },
        })),

      addVisitedNode: (nodeId) =>
        set((state) => ({
          currentRun: state.currentRun
            ? {
                ...state.currentRun,
                visitedNodes: [...state.currentRun.visitedNodes, nodeId],
              }
            : null,
        })),

      addFlag: (flag) =>
        set((state) => ({
          currentRun: state.currentRun
            ? {
                ...state.currentRun,
                activeFlags: [...state.currentRun.activeFlags, flag],
              }
            : null,
        })),

      hasFlag: (flag) => {
        const run = get().currentRun
        return run ? run.activeFlags.includes(flag) : false
      },

      addToInventory: (itemId) =>
        set((state) => ({
          currentRun: state.currentRun
            ? {
                ...state.currentRun,
                inventory: [...state.currentRun.inventory, itemId],
              }
            : null,
        })),

      unlockLore: (fragmentId) =>
        set((state) => ({
          persistent: {
            ...state.persistent,
            unlockedLoreFragments: [
              ...state.persistent.unlockedLoreFragments,
              fragmentId,
            ],
          },
        })),

      addToChest: (itemId) =>
        set((state) => ({
          persistent: {
            ...state.persistent,
            chestItems: [...state.persistent.chestItems, itemId],
          },
        })),

      resetRun: () => set({ currentRun: null, phase: 'village' }),
    }),
        {
      name: 'nuberu-save',
      partialize: (state: GameStore) => ({ persistent: state.persistent }),
    }
  )
)