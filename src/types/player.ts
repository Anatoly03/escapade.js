
import { PlayerInfo, PlayerState } from '../data/protocol.g.js'

export class Player implements PlayerInfo {
    localPlayerId = 0
    playerId = 'undeclared'
    name = 'UNKNOWN'
    smileyId = 0
    auraShapeId = 0
    auraColorId = 0
    isReady = false
    lastPositionUpdate = 0
    playState?: PlayerState
    permLevel = 0 as 0
    canEdit = false

    constructor(from: PlayerInfo = {}) {
        Object.keys(from).forEach((k: any) => (this[k as keyof Player] as any) = from[k as keyof PlayerInfo])
    }
}