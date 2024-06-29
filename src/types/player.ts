
import { EscapadeClient } from '../client.js'
import { MoveArgs, PlayerInfo, PlayerState } from '../data/protocol.g.js'

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
    #client: EscapadeClient<true>
    #seed: number
    #position: { x: number, y: number }
    #deathCount = 0

    constructor(from: PlayerInfo = {}, client: EscapadeClient<true>) {
        super(from)

        this.#client = client

        this.#seed = from.playState?.moveArgs?.seed ?? 0
        this.#position = { x: 0, y: 0, ...(from.playState?.moveArgs?.position ?? {})}
    }

    /**
     * Common Send Data of the Move Packet
     */
    private args(data: Partial<MoveArgs>): MoveArgs {
        return {
            seed: this.#seed,
            position: this.#position,
            direction: {},
            velocity: {},
            ...data
        }
    }

    /**
     * @param isGod Set god mode on or off
     */
    public set_god(isGod: boolean) {
        this.#client.send('Move', this.args({ isGod }))
    }

    public kill() {
        this.#client.send('Death', { count: ++this.#deathCount })
        this.#client.send('Respawn')
    }
}