export type NodeType = 'village' | 'path' | 'dungeon' | 'event'

export type HotspotAction = 'navigate' | 'examine' | 'pickup' | 'talk' | 'combat'

export interface Hotspot {
  id: string
  label: string
  action: HotspotAction
  targetNodeId?: string
  eventId?: string
  position: { x: number; y: number } // porcentaje sobre la imagen (0-100)
  condition?: string // id de flag que debe estar activo para mostrarse
}

export interface GameNode {
  id: string
  type: NodeType
  title: string
  description: string
  backgroundImage: string
  ambientSound?: string
  hotspots: Hotspot[]
  onEnterEvent?: string // eventId que se dispara al entrar
}