
import WebSocket from 'ws'
import { EventEmitter } from 'events'

import { ESCAPADE_API, SOCKET_URL, LibraryEvents } from './data/consts.js'
import { PROTOCOL, WorldEventMatch } from './data/protocol.js'

import { WorldEvent, WorldEventType, JoinWorld, SendEventTypes } from './data/protocol.g.js'

import { Friend } from './types/friend.js'
import { Profile } from './types/profile.js'
import { WorldMeta } from './types/world-meta.js'

interface CustomEvents {
    '*': any[],
    'error': [Error],
    'close': [string]
}

export class EscapadeClient<Ready extends boolean> extends EventEmitter<LibraryEvents> {
    #socket: WebSocket | undefined
    #token: string

    #events_raw: EventEmitter<{ [key in keyof typeof WorldEventType]: [WorldEvent & { eventType: (typeof WorldEventType)[key] }] } & {'*': any[]} >
    #events: EventEmitter<{}>

    constructor(args: { token: string }) {
        super()
        this.#token = args.token
        this.#events = new EventEmitter()
        this.#events_raw = new EventEmitter()
    }

    /**
     * Is truthy, if the client socket is connected.
     */
    public connected(): this is EscapadeClient<true> {
        return this.#socket !== undefined && this.#socket.readyState === this.#socket.OPEN
    }

    /**
     * In environments, which is type guarded as connected,
     * retrieve the socket safely.
     */
    private socket(this: EscapadeClient<true>): WebSocket {
        return this.#socket as WebSocket
    }

    /**
     * Get the event handler of all raw events emitted by the game server.
     */
    public raw(): EventEmitter<{ [key in keyof typeof WorldEventType]: [WorldEvent & { eventType: (typeof WorldEventType)[key] }] } & {'*': any[]}> {
        return this.#events_raw
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
     * @todo
     */
    async get<T extends Profile<boolean>>(endpoint: 'me'): Promise<T>

    /**
     * @todo
     */
    async get<T extends { invites_received: Friend[], friends: Friend[], invites_sent: Friend[] }>(endpoint: 'me/friends'): Promise<T>

    /**
     * @todo
     */
    async get<T extends WorldMeta[]>(endpoint: 'me/worlds'): Promise<T>

    /**
     * @todo
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
     * @todo
     */
    private async try_refresh_token() {
        const response = await fetch(`${ESCAPADE_API}/auth/refresh`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.#token
            }
        })

        // console.log('Refreshing Token')

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

        this.#socket = new WebSocket(SOCKET_URL)
        this.#socket.binaryType = 'arraybuffer'

        this.#socket.on('open', async () => {
            this.send('JoinWorld', {
                worldId: world_id,
                authToken: this.#token
            })
        })

        this.#socket.on('message', async (ev) => {
            const Event = EscapadeClient.protocol.lookupType('WorldEvent')
            const buffer = new Uint8Array(ev as ArrayBuffer)
            const data = Event.decode(buffer) as any
            const event_name = Object
                .keys(WorldEventType)
                .map(k => [k, WorldEventType[k as any]])
                .find(([k, v]) => v === data.eventType)

            this.#events_raw.emit('*', data as any)
            if (event_name !== undefined) this.#events_raw.emit(event_name[0] as any, data)
        })

        this.#socket.on('close', async (code, reason) => {
            this.emit<'close'>('close', reason.toString('ascii'))
        })

        this.#socket.on('error', async (err) => {
            this.emit<'error'>('error', err)
        })

        return this.connected() as Ready
    }

    /**
     * @ignore
     */
    public send(message_type: 'JoinWorld', args: JoinWorld): this

    /**
     * @todo
     */
    public send<EventName extends keyof SendEventTypes>
        (message_type: EventName, args?: SendEventTypes[EventName]): this

    public send(message_type: string, payload: any = {}): this {
        if (!this.connected()) throw new Error('Socket is not connected!')
        let Message: protobuf.Type
        
        switch (message_type) {
            case 'JoinWorld':
                Message = EscapadeClient.protocol.lookupType('JoinWorld')
                break
                
            default:
                const eventType: number = EscapadeClient.WorldEvents[message_type]
                const attrs = WorldEventMatch[message_type]
                const tmp = payload
                Message = EscapadeClient.protocol.lookupType('WorldEvent')
                payload = { eventType }
                if (attrs && attrs.length > 0) payload[attrs[0]] = tmp
                break
        }

        const err = Message.verify(payload)
        if (err) throw new Error(err)

        const data = Message.create(payload)
        const buffer = Message.encode(data).finish()
        this.socket().send(buffer)

        return this
    }








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
}