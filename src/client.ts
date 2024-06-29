
import WebSocket from 'ws'
import { EventEmitter } from 'events'

import { ESCAPADE_API, SOCKET_URL } from './data/consts.js'
import { PROTOCOL, WorldEventMatch } from './data/protocol.js'

import { WorldEvent, WorldEventType, SendEventTypes, PlayerInfo } from './data/protocol.g.js'

import PlayerModule from './modules/players.js'
import WorldModule from './modules/world.js'
import ChatModule from './modules/chat.js'

import { Friend } from './types/friend.js'
import { Profile } from './types/profile.js'
import { WorldMeta } from './types/world-meta.js'
import { Player, SelfPlayer } from './types/player.js'
import { World } from './types/world.js'

type RawEvents = {
    [K in keyof typeof WorldEventType as K extends keyof typeof WorldEventType ? K : never]:
    [WorldEvent & { eventType: (typeof WorldEventType)[K] }]
}

type LibraryEvents = {
    '*': any[]
    'OldAdd': [PlayerInfo]
    'Close': [string]
    'Error': [Error]
}

/**
 * @param {boolean} Ready The type parameter defines, wether
 * or not the game socket is connected. It is assumed by type
 * guard `EscapadeClient.connected()` which is true, if the
 * socket can send and receive events.
 */
export class EscapadeClient<Ready extends boolean = boolean> extends EventEmitter< LibraryEvents & RawEvents > {
// export class EscapadeClient<Ready extends boolean = boolean> extends EventEmitter<RawEvents & LibraryEvents> {
    #socket: WebSocket | undefined
    #token: string

    #players: Player[] = []
    #self: Player | undefined
    #world: World | undefined

    /**
     * Create a new Escapade Client instance, by logging in with a token.
     * @param {{token:string}} args The object holding the token which is used to sign into pocketbase.
     * @example
     * Create an Escapade Client with login information using the dotenv package.
     * ```ts
     * import 'dotenv/config'
     * const client = new EscapadeClient({ token: process.env.TOKEN as string })
     * ```
     */
    constructor(args: { token: string });

    /**
     * Create a new Escapade Client instance, by logging in with data defined in the 
     * @param {NodeJS.ProcessEnv} args The constant `process.env`
     * @example
     * ```ts
     * import 'dotenv/config'
     * const client = new EscapadeClient(process.env)
     * ```
     */
    constructor(args: NodeJS.ProcessEnv);

    constructor(args: { token: string }) {
        super()
        this.#token = args.token

        this.include(PlayerModule((value: SelfPlayer) => this.#self = value, this.#players))
        this.include(WorldModule((value: World) => this.#world = value))
        this.include(ChatModule())
    }

    /**
     * Is truthy, if the client socket is connected.
     * This is a [type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html),
     * which can set the `Ready` type parameter and add new methods in a closed scope.
     * 
     * @example
     * 
     * ```ts
     * if (client.connected()) {
     *     client.send('Sync')
     * }
     * ```
     */
    public connected(): this is EscapadeClient<true> {
        return this.#socket !== undefined && this.#socket.readyState === this.#socket.OPEN
    }

    /**
     * In environments, which is type guarded as connected,
     * retrieve the socket safely.
     */
    public socket(this: EscapadeClient<true>): WebSocket {
        return this.#socket as WebSocket
    }

    /**
     * @example
     * 
     * ```ts
     * if (!client.connected()) return
     * console.log('Players In World: ', client.players().map({ name } => name).join())
     * ```
     */
    public players(this: EscapadeClient<true>): Player[] {
        return this.#players
    }

    /**
     * A reference of the self player object.
     */
    public self(this: EscapadeClient<true>): SelfPlayer {
        return this.#self as SelfPlayer
    }

    /**
     * A reference of the world object.
     */
    public world(this: EscapadeClient<true>): World {
        return this.#world as World
    }

    /**
     * @ignore The compiled protocol for Escapade is
     * exposed but not documented for client users.
     */
    public static protocol: typeof PROTOCOL = PROTOCOL

    /**
     * @ignore This variable contains a mapping of
     * event names and their respective identifiers,
     * but won't be documented any further.
     */
    public static WorldEvents = PROTOCOL.lookupEnum('WorldEventType').values

    /**
     * @todo @ignore
     */
    async get<T extends Profile<boolean>>(endpoint: 'me'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends { invites_received: Friend[], friends: Friend[], invites_sent: Friend[] }>(endpoint: 'me/friends'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends WorldMeta[]>(endpoint: 'me/worlds'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends WorldMeta[]>(endpoint: 'worlds'): Promise<T>

    /**
     * @todo
     */
    async get(endpoint: string): Promise<any>

    public async get<Response>(endpoint: string): Promise<Response> {
        let response = await fetch(`${ESCAPADE_API}/${endpoint}`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.#token
            }
        })

        if (response.status === 401 && await this.try_refresh_token()) {
            response = await fetch(`${ESCAPADE_API}/${endpoint}`, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.#token
                }
            })
        }

        const text = await response.text()

        return JSON.parse(text)
    }

    /**
     * @ignore This function uses the old token to auto refresh.
     * This will not be documented, since this is supposed to be used
     * in the SDK internals only.
     */
    public async try_refresh_token() {
        const response = await fetch(`${ESCAPADE_API}/auth/refresh`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.#token
            }
        })

        switch (response.status) {
            case 400:
                return true

            case 200:
                const { token } = await response.json()
                this.#token = token
                return true

            default:
                throw new Error("Token Expired and could not refresh!")
        }
    }

    // TODO "POST", "/me/friends/accept"
    // TODO "POST", "/me/friends/reject"
    // TODO "POST", "/me/friends/cancel"
    // TODO "DELETE", "/me/friends"
    // TODO "GET", "/players/search?name=" + s
    // TODO "POST", "/me/friends/add
    // TODO "GET", "/me/worlds/completed"
    // TODO "GET", "/campaigns"
    // TODO "GET", "/worlds/featured"
    // TODO "GET", "/campaigns"
    // TODO "GET", "/shop/" read with function "bo" for extended paths
    // TODO POST", "/shop"

    // TODO GET 'shop/smileys'
    // TODO GET 'shop/aura/shapes'
    // TODO GET 'shop/aura/colors'
    // TODO GET 'shop/worlds'

    /**
     * @todo
     */
    public async connect(world_id: string): Promise<Ready> {
        await this.try_refresh_token()

        if (this.connected())
            this.disconnect()

        this.#socket = new WebSocket(SOCKET_URL)
        this.#socket.binaryType = 'arraybuffer'

        this.#socket.on('open', async () => {
            const Message = EscapadeClient.protocol.lookupType('JoinWorld')
            const Payload = {
                worldId: world_id,
                authToken: this.#token
            }

            const err = Message.verify(Payload)
            if (err) throw new Error(err)

            const data = Message.create(Payload)
            const buffer = Message.encode(data).finish()

            if (!this.#socket) throw new Error('Socket failed to open before `JoinWorld` message.')
            this.#socket.send(buffer)
        })

        this.#socket.on('message', async (ev) => {
            const Event = EscapadeClient.protocol.lookupType('WorldEvent')
            const buffer = new Uint8Array(ev as ArrayBuffer)
            const data = Event.decode(buffer) as any
            const event_name = Object
                .keys(WorldEventType)
                .map(k => [k, WorldEventType[k as any]])
                .find(([k, v]) => v === data.eventType)

            this.emit('*', data as any)
            if (event_name !== undefined) this.emit(event_name[0] as any, data)
        })

        this.#socket.on('close', async (code, reason) => {
            this.emit('Close', reason.toString('ascii'))
        })

        this.#socket.on('error', async (err) => {
            this.disconnect()
            this.emit('Error', err)
        })

        this.#socket.on('unexpected-response', (request, response) => {
            this.disconnect()
            this.emit('Error', new Error(`Unexpected Response from host ${request.protocol}://${request.host}/${request.path} with status code ${response.statusCode}. ${response.statusMessage ?? ''}`))
        })

        return this.connected() as Ready
    }

    /**
     * Disconnects the client, and if in the world, leave.
     */
    disconnect(): void {
        this.send('Leave')
        this.#socket?.close()
    }

    /**
     * @todo
     */
    // TODO add `this: EscapadeClient<true, true>, ` type guard in param
    public send<EventName extends keyof SendEventTypes>
        (message_type: EventName, args?: SendEventTypes[EventName]): EscapadeClient<true>

    public send(message_type: string, payload: any = {}): EscapadeClient<true> {
        if (!this.connected()) throw new Error('Socket is not connected!')
        const Message = EscapadeClient.protocol.lookupType('WorldEvent')
        const eventType: number = EscapadeClient.WorldEvents[message_type]
        const attrs = WorldEventMatch[message_type]
        const tmp = payload

        payload = { eventType }
        if (attrs && attrs.length > 0) payload[attrs[0]] = tmp

        const err = Message.verify(payload)
        if (err) throw new Error(err)

        // if (eventType == 13 || eventType == 23)
        //     console.log(payload)

        const data = Message.create(payload)
        const buffer = Message.encode(data).finish()
        this.socket().send(buffer)

        return this
    }

    // /**
    //  * 
    //  */
    // public override on<EventName extends keyof RawEvents>(eventName: EventName, listener: (...args: RawEvents[EventName]) => void): this
    
    // /**
    //  * @ignore
    //  */
    // public override on<Events extends (keyof RawEvents)[]>(eventName: Events, listener: (...args: RawEvents[EventName]) => void): this

    // public override on(event_name: any, listener: any): this {
    //     return (super.on as any)(event_name, listener)
    // }

    /**
     * @ignore @todo Include Event handler from another client instance. This function
     * gets the event calls from `client` and a links them to `this`
     */
    public include<K>(callback: (c: EscapadeClient) => EscapadeClient): EscapadeClient

    /**
     * @ignore
     */
    public include<K>(module: { module: (c: EscapadeClient) => EscapadeClient }): EscapadeClient

    public include<K>(callback: ((c: EscapadeClient) => EscapadeClient) | { module: (c: EscapadeClient) => EscapadeClient }): EscapadeClient {
        if (typeof callback == 'function')
            return callback(this) || this
        else
            return callback.module(this)
    }





    // TODO <TODO>

    async api<Profile>(method: 'GET', endpoint: 'me'): Promise<[200, Profile]>

    async api(method: any, endpoint: any, data?: any): Promise<any>

    public async api<Data>(method: 'GET' | 'POST' | 'DELETE', endpoint: string, data?: any): Promise<[number, Data]> {
        const response = await fetch(`${ESCAPADE_API}/${endpoint}`, {
            method,
            headers: {
                Authorization: 'Bearer ' + this.#token
            },
            body: data !== undefined ? JSON.stringify(data) : null
        })

        if (response.status.toString().startsWith('2'))
            return [response.status, await response.json()]

        throw new Error('Status Error (' + response.status + '): ' + response.text())
    }

    // </TODO>




    /**
     * @example
     * 
     * Synchronize. You need to send this, if you want
     * to see the bot player in the world.
     * 
     * ```ts
     * client.on('start', () => {
     *     client.sync()
     * })
     * ```
     */
    public sync() {
        if (!this.connected()) throw new Error('Client not connected.')
        this.send('Sync')
    }

    /**
     * @param {string} message The string content of the message that should be sent to the chat.
     * 
     * @example
     * 
     * ```ts
     * client.say('Hello, World!')
     * ```
     */
    public async say(message: string): Promise<true> {
        if (!this.connected()) throw new Error('Client not connected.')
        this.send('Chat', { message })
        return true
    }

    /**
     * @todo @example
     * 
     * ```ts
     * client.pm(user, 'Hello, World!')
     * ```
     */
    public async pm(target: Player, message: string): Promise<true>

    /**
     * @deprecated Not Yet Implemented
     * @todo @example
     * 
     * ```ts
     * client.pm('user', 'Hello, World!')
     * ```
     */
    public async pm(target_username: string, message: string): Promise<true>

    /**
     * @todo @example
     * 
     * ```ts
     * client.pm(1, 'Hello, World!')
     * ```
     */
    public async pm(target_id: number, message: string): Promise<true>

    public async pm(target: number | string | Player, message: string) {
        if (typeof target == 'object')
            target = (target as Player).localPlayerId
        else if (typeof target == 'string') {
            const player = this.#players.find(p => p.name == target)
            if (!player) throw new Error(`Player ${target} not found of ${this.#players.map(({ name }) => name).join()}.`)
            target = player.localPlayerId
        }
        if (!this.connected()) throw new Error('Client not connected.')
        this.send('Chat', { message, isPrivate: true, targetLocalPlayerId: target })
        return true
    }
}