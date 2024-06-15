import { Player } from "../types/player.js"

export const ESCAPADE_URL = 'https://escapade.fun'
export const ESCAPADE_API = 'https://escapade.fun:2053/api'
export const SOCKET_URL = 'wss://escapade.fun:2053/ws'

export interface LibraryEvents {
    'close': [string]
    'start': []
    'chat': [Player, string, boolean]
    'error': [Error]
    'player:join': [Player, boolean]
    'player:leave': [Player]
}