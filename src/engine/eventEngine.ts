export type EventOutcome =
  | { type: 'flag'; value: string }
  | { type: 'item'; value: string }
  | { type: 'lore'; fragmentId: string }
  | { type: 'damage'; amount: number }
  | { type: 'navigate'; targetNodeId: string }
  | { type: 'death' }

export interface GameEvent {
  id: string
  title: string
  description: string
  choices: EventChoice[]
}

export interface EventChoice {
  id: string
  label: string
  outcomes: EventOutcome[]
  condition?: string // flag requerido para mostrar esta opción
}

// Filtra opciones visibles según flags activos
export function getVisibleChoices(
  event: GameEvent,
  activeFlags: string[]
): EventChoice[] {
  return event.choices.filter((c) => {
    if (!c.condition) return true
    return activeFlags.includes(c.condition)
  })
}

// Registro de eventos en memoria
const eventRegistry: Map<string, GameEvent> = new Map()

export function registerEvents(events: GameEvent[]): void {
  events.forEach((e) => eventRegistry.set(e.id, e))
}

export function getEvent(id: string): GameEvent | undefined {
  return eventRegistry.get(id)
}