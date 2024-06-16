
import { EscapadeClient } from '../client.js'
import { PlayerInfo, PlayerState } from '../data/protocol.g.js'

export class Player implements PlayerInfo {
    localPlayerId = 0
    playerId = 'undeclared'
    name : string | undefined
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

export class SelfPlayer extends Player {
    #client: EscapadeClient<true, true>
    constructor(from: PlayerInfo = {}, client: EscapadeClient<true, true>) {
        super(from)
        this.#client = client
    }

    /**
     * @param isGod Set god mode on or off
     */
    public set_god(isGod: boolean) {
        this.#client.send('Move', { isGod })
    }

}