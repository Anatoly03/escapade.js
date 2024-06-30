
import WebSocket from 'ws'
import { EventEmitter } from 'events'

import { ESCAPADE_API, SOCKET_URL } from './data/consts.js'
import { PROTOCOL, WorldEventMatch } from './data/protocol.js'

import { WorldEvent, WorldEventType, SendEventTypes, PlayerInfo } from './data/protocol.g.js'

import PlayerModule from './modules/players.js'
import WorldModule from './modules/world.js'
import CommandModule from './modules/commands.js'

import { ProfileMeta, Profile, CampaignMeta, WorldMeta } from './types/api.js'
import { Player, SelfPlayer } from './types/player.js'
import { World } from './types/world.js'

type RawEvents = {
    [K in keyof typeof WorldEventType as K extends keyof typeof WorldEventType ? K : never]:
    [WorldEvent & { eventType: (typeof WorldEventType)[K] }]
}

type LibraryEvents = {
    '*': any[]
    'OldAdd': [WorldEvent & { eventType: WorldEventType.Add }]
    'Close': [string]
    'Error': [Error]
}

/**
 * @param {boolean} Ready The type parameter defines, wether
 * or not the game socket is connected. It is assumed by type
 * guard `EscapadeClient.connected()` which is true, if the
 * socket can send and receive events.
 */
export class EscapadeClient<Ready extends boolean = boolean> extends EventEmitter<LibraryEvents & RawEvents> {
    #socket: WebSocket | undefined
    #token: string

    #players: PlayerInfo[] = []
    #self: Player | undefined
    #world: World | undefined

    #commands: [string, (player: PlayerInfo) => boolean, (receive: PlayerInfo, ...args: string[]) => void][] = []

    /**
     * The command prefix array stores all the prefici the bot
     * will react to. The prefici that are accepted by the client
     * are tried in order from left to right, so if a prefix is a
     * prefix of another prefix, it has to be put later. (For example,
     * for command prefici `.` and `..`, `.` has to be placed later
     * in the array.)
     * 
     * This array cannot be set to the empty array `[]`
     */
    public COMMAND_PREFIX: [string, ...string[]] = ['.', '!']

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
        this.include(CommandModule(this.#commands))
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
     * @deprecated All Events are now managed by the client. Remove all instances of `.raw()`
     */
    public raw() {
        return this as EventEmitter<{ [key in keyof typeof WorldEventType]: [WorldEvent & { eventType: (typeof WorldEventType)[key] }] } & { '*': any[] }>
    }

    /**
     * @example
     * 
     * ```ts
     * if (!client.connected()) return
     * console.log('Players In World: ', client.players().map({ name } => name).join())
     * ```
     */
    public players(this: EscapadeClient<true>): PlayerInfo[] {
        return this.#players
    }

    /**
     * Retrieve a player object.
     * 
     * @example
     * 
     * ```ts
     * client.player('user').pm('Hello!')
     * ```
     */
    public player(this: EscapadeClient<true>, data: number | string | PlayerInfo): Player | undefined {
        let playerInterface = this.players().find(p => {
            if (typeof data == 'object')
                return data.localPlayerId == p.localPlayerId
            else if (typeof data == 'string')
                return data == p.name
            else if (typeof data == 'number')
                return data == p.localPlayerId
            return false
        })
        if (!playerInterface) return
        return new Player(this, playerInterface)
    }

    /**
     * A reference of the self player object.
     * 
     * @example
     * 
     * ```ts
     * client.self().set_god(true)
     * ```
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
    async get<T extends { invites_received: ProfileMeta[], friends: ProfileMeta[], invites_sent: ProfileMeta[] }>(endpoint: 'me/friends'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<P extends string, T extends ProfileMeta[]>(endpoint: `/players/search?name=${P}`): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends WorldMeta[]>(endpoint: 'me/worlds'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends { worlds: string[] }>(endpoint: 'me/worlds/completed'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends WorldMeta[]>(endpoint: 'worlds'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends CampaignMeta[]>(endpoint: 'campaigns'): Promise<T>

    /**
     * @todo @ignore
     */
    async get<T extends (CampaignMeta & { title: 'Featured' })>(endpoint: 'worlds/featured'): Promise<T>

    /**
     * @todo
     */
    async get(endpoint: string): Promise<any>

    public async get<Response>(endpoint: string): Promise<Response> {
        if (endpoint.startsWith('/')) endpoint = endpoint.substring(1)

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

    // TODO "POST", "/me/friends/accept"
    // TODO "POST", "/me/friends/reject"
    // TODO "POST", "/me/friends/cancel"
    // TODO "DELETE", "/me/friends"
    // TODO "POST", "/me/friends/add
    // TODO "GET", "/shop/" read with function "bo" for extended paths
    // TODO POST", "/shop"
    // TODO GET 'shop/smileys'
    // TODO GET 'shop/aura/shapes'
    // TODO GET 'shop/aura/colors'
    // TODO GET 'shop/worlds'

    // TODO <TODO>

    /**
     * @deprecated @ignore
     */
    async api<Profile>(method: 'GET', endpoint: 'me'): Promise<[200, Profile]>

    /**
     * @deprecated @ignore
     */
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
        try {
            this.send('Leave')
        } finally {
            this.#socket?.close()
        }
    }

    /**
     * @todo
     */
    public send<EventName extends keyof SendEventTypes>(message_type: EventName, args?: SendEventTypes[EventName]): EscapadeClient<true>

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

    /**
     * Combine several events with one callback.
     * @example
     * ```ts
     * client.onAll(['Add', 'OldAdd'], (player) => console.log(`${player.name} joined!`))
     * ```
     */

    // Explanation of generic parameters:
    // <K> - temporary generic parameter to store all events that
    //       the client instance reacts to
    // <A> - temporary generic parameter to label the events array
    //       for example ['Add', 'Init'], this will be the event
    //       names parameter
    // <Args> - temporary generic parameter to label the arguments
    //       intersection of the callback function
    // <Z> - generic parameter
    // Function signature: (eventNames: <A>, callback: (...Args) => void): this

    public onAll<K extends (LibraryEvents & RawEvents), A extends (keyof K)[], Args extends K[A[number]], Z>(eventNames: A, listener: (...args: Args extends Array<Z> ? Args : never) => void): this {
        eventNames.forEach(event => {
            this.on(event, listener as any)
        })
        return this
    }

    /**
     * Register a command with permission checking. If the command returns a string
     * value it is privately messaged to the person who executed the command.
     * @example
     * ```ts
     * client.onCommand('god_all', p => p.isAdmin, ([player, _, state]) => {
     *     let s = state == 'true'
     *     let l = client.players.forEach(q => q.god(s)).length
     *     return s ? `${s ? 'Gave to' : 'Took from'} ${n} players god mode.`
     * })
     * ```
     */
    public onCommand(cmd: string, permission_check: (player: PlayerInfo) => boolean, callback: (player: PlayerInfo, ...args: string[]) => (Promise<any> | any)): this

    /**
     * Register a (global use) command. If the command returns a string value it
     * is privately messaged to the person who executed the command.
     * @example
     * ```ts
     * client.onCommand('edit', ([player, _, state]) => {
     *     let s = state == 'true'
     *     player.edit(s)
     * })
     * ```
     */
    public onCommand(cmd: string, callback: (player: PlayerInfo, ...args: string[]) => (Promise<any> | any)): this;

    public onCommand(cmd: string, cb1: ((p: PlayerInfo) => boolean) | ((player: PlayerInfo, ...args: string[]) => (Promise<any> | any)), cb2?: (player: PlayerInfo, ...args: string[]) => (Promise<any> | any)): this {
        if (cb2 == undefined)
            return this.onCommand(cmd, () => true, cb1 as (player: PlayerInfo, ...args: string[]) => (Promise<any> | any))

        this.#commands.push([
            // The command is `cmd`
            cmd,
            // The permission callback is cb1
            cb1 as (player: PlayerInfo) => boolean,
            // This function is only executed when the permission callback was positive in the commands module.
            async (player: PlayerInfo, ...args: string[]) => {
                // if (!(cb1 as ((p: PlayerInfo) => boolean))(player)) return
                const output = await cb2(player, ...args)
                if (typeof output == 'string')
                    this.pm(player, output)
            }
        ])

        return this
    }

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

    /**
     * @deprecated
     * 
     * Synchronize. You need to send this, if you want
     * to see the bot player in the world.
     * 
     * @example
     * 
     * ```ts
     * client.on('start', () => {
     *     client.send('Sync')
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
     * Send a private message to a user.
     * 
     * @deprecated
     * 
     * @example
     * 
     * ```ts
     * client.pm(addArgs, 'Hello, World!')
     * ```
     */
    public async pm(target: PlayerInfo, message: string): Promise<true>

    /**
     * Send a private message to a user by name.
     * 
     * @deprecated
     * 
     * @example
     * ```ts
     * client.pm('user', 'Hello, World!')
     * ```
     */
    public async pm(target_username: string, message: string): Promise<true>

    /**
     * Send a private message to a user by id.
     * 
     * @deprecated
     * 
     * @example
     * ```ts
     * client.pm(1, 'Hello, World!')
     * ```
     */
    public async pm(target_id: number, message: string): Promise<true>

    public async pm(target: number | string | PlayerInfo, message: string) {
        if (typeof target == 'object')
            target = (target as PlayerInfo).localPlayerId ?? 0
        else if (typeof target == 'string') {
            const player = this.#players.find(p => p.name == target)
            if (!player) throw new Error(`Player ${target} not found of ${this.#players.map(({ name }) => name).join()}.`)
            target = player.localPlayerId ?? 0
        }
        if (!this.connected()) throw new Error('Client not connected.')
        this.send('Chat', { message, isPrivate: true, targetLocalPlayerId: target })
        return true
    }
}
