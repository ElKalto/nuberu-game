export interface PlayerStats {
  health: number
  maxHealth: number
  torchSteps: number // pasos restantes de antorcha (presión de tiempo ligera)
}

export interface PlayerState {
  explorer: import('./game').Explorer
  stats: PlayerStats
}