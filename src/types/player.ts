
import { EscapadeClient } from '../client.js'
import { MoveArgs, PlayerInfo } from '../data/protocol.g.js'

/**
 * Wrapper class for `PlayerInfo`. 
 */
export class Player {
    protected reference: PlayerInfo
    protected client: EscapadeClient<true>

    /**
     * @ignore
     */
    constructor(client: EscapadeClient<true>, from: PlayerInfo) {
        this.client = client
        this.reference = from
    }

    /**
     * Getter to retrieve player id from the referenced object.
     */
    get id () { return this.reference.localPlayerId }

    /**
     * Getter to retrieve player id from the referenced object.
     */
    get name () { return this.reference.name }

    /**
     * Getter to retrieve player info as object.
     */
    info () { return this.reference }

    /**
     * Send a private message to a user.
     * 
     * @example
     * ```ts
     * client.player('user').pm('Hello, World!')
     * ```
     */
    public pm(message: string) {
        this.client.send('Chat', { message, isPrivate: true, targetLocalPlayerId: this.id })
        return this
    }
}

export class SelfPlayer extends Player {
    #seed: number
    #position: { x: number, y: number }
    #deathCount = 0

    constructor(client: EscapadeClient<true>, from: PlayerInfo = {}) {
        super(client, from)

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
        this.client.send('Move', this.args({ isGod }))
        return this
    }

    public kill() {
        this.client.send('Death', { count: ++this.#deathCount })
        this.client.send('Respawn')
        return this
    }
}
