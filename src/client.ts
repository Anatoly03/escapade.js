
import { ESCAPADE_API } from './data/consts.js'
import { Friend } from './types/friend.js'
import { Profile } from './types/profile.js'
import { WorldMeta } from './types/world-meta.js'

export class EscapadeClient {
    #token: string

    constructor(args: { token: string }) {
        this.#token = args.token
    }

    /**
     * 
     */
    async get<T extends Profile<boolean>>(endpoint: 'me'): Promise<T>

    /**
     * 
     */
    async get<T extends { invites_received: Friend[], friends: Friend[], invites_sent: Friend[] }>(endpoint: 'me/friends'): Promise<T>

    /**
     * 
     */
    async get<T extends WorldMeta>(endpoint: 'me/worlds'): Promise<T>

    /**
     * 
     */
    async get<T extends WorldMeta>(endpoint: 'worlds'): Promise<T>

    /**
     * 
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
     * 
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