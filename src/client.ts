
import WebSocket from 'ws'
import { EventEmitter } from 'events'

import { ESCAPADE_API, SOCKET_URL } from './data/consts.js'
import { PROTOCOL } from './data/protocol.js'

import * as ProtocolEvents from './data/protocol.g.js'
import { WorldEvent, WorldEventType, JoinWorld, WorldEventMatch } from './data/protocol.g.js'

import { Friend } from './types/friend.js'
import { Profile } from './types/profile.js'
import { WorldMeta } from './types/world-meta.js'

interface CustomEvents {
    '*': any[],
    'error': [Error],
    'close': [string]
}

export class EscapadeClient<Ready extends boolean> {
    #socket: WebSocket | undefined
    #events: EventEmitter<Omit<{ [key in keyof WorldEvent]: [WorldEvent[key]] }, keyof CustomEvents> & CustomEvents>
    #token: string

    constructor(args: { token: string }) {
        this.#token = args.token
        this.#events = new EventEmitter()
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
     * @todo The compiled protocol for Escapade
     */
    static protocol: typeof PROTOCOL = PROTOCOL

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

        console.log('Refreshing Token')

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
            this.send('JoinWorld' as any, {
                worldId: world_id,
                authToken: this.#token
            })

            console.log('Opened')
        })

        this.#socket.on('message', async (ev) => {
            const Event = EscapadeClient.protocol.lookupType('WorldEvent')
            const buffer = new Uint8Array(ev as ArrayBuffer)
            const data = Event.decode(buffer)

            this.#events.emit('*', data as any)
        })

        this.#socket.on('close', async (code, reason) => {
            this.#events.emit<'close'>('close', reason.toString('ascii'))
        })

        this.#socket.on('error', async (err) => {
            this.#events.emit<'error'>('error', err)
        })

        // await new Promise((res, rej) => {

        //     this.#socket.once('Chat', () => res(true))
        //     this.once('error', () => rej(true))

        //     this.#socket?.removeEventListener()
        // })

        return this.connected() as Ready
    }

    /**
     * @todo
     */
    public send(message_type: 'JoinWorld', args: JoinWorld): any;

    /**
     * @todo
     */
    public send<EventName extends keyof WorldEventType>(message_type: EventName, args: WorldEvent & { eventType: WorldEventType[EventName] }): any;

    public send<K extends keyof typeof ProtocolEvents>(this: EscapadeClient<true>, message_type: K, payload: typeof ProtocolEvents[K]): void {
        if (!this.connected()) throw new Error('Socket is not connected!')
        const Message = EscapadeClient.protocol.lookupType(message_type as string)

        const err = Message.verify(payload)
        if (err) throw new Error(err)

        const data = Message.create(payload)
        const buffer = Message.encode(data).finish()
        this.socket().send(buffer)
    }

    /**
     * @todo
     */
    public on(message_type: 'C', listener: (args: (WorldEvent & { eventType: 23 })) => any): this;

    /**
     * @todo
     */
    public on<EventName extends keyof typeof WorldEventType, EventId = (typeof WorldEventType)[EventName]>
        (message_type: EventName, listener: (args: (WorldEvent & { eventType: EventId })) => any): this

    /**
     * @todo
     */
    public on<EventName extends keyof CustomEvents>(message_type: EventName, listener: (args: CustomEvents[EventName]) => any): this;

    public on(message_type: any, listener: (args: any) => any = () => void(0)) {
        this.#events.on(message_type, listener)
        return this
    }

    /**
     * @todo @ignore
     */
    public once(message_type: any, listener: (args: any) => any) {
        this.#events.once(message_type, listener)
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