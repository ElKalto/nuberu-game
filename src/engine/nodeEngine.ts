import type { GameNode, Hotspot } from '@/types'

// Registro de nodos cargados en memoria
const nodeRegistry: Map<string, GameNode> = new Map()

export function registerNodes(nodes: GameNode[]): void {
  nodes.forEach((node) => nodeRegistry.set(node.id, node))
}

export function getNode(id: string): GameNode | undefined {
  return nodeRegistry.get(id)
}

export function getHotspot(nodeId: string, hotspotId: string): Hotspot | undefined {
  const node = getNode(nodeId)
  return node?.hotspots.find((h) => h.id === hotspotId)
}

// Filtra hotspots visibles según flags activos de la run
export function getVisibleHotspots(node: GameNode, activeFlags: string[]): Hotspot[] {
  return node.hotspots.filter((h) => {
    if (!h.condition) return true
    return activeFlags.includes(h.condition)
  })
}

// Resuelve a qué nodo navegar al pulsar un hotspot
export function resolveNavigation(
  hotspot: Hotspot
): { type: 'navigate'; targetNodeId: string } | { type: 'event'; eventId: string } | null {
  if (hotspot.action === 'navigate' && hotspot.targetNodeId) {
    return { type: 'navigate', targetNodeId: hotspot.targetNodeId }
  }
  if (hotspot.eventId) {
    return { type: 'event', eventId: hotspot.eventId }
  }
  return null
}