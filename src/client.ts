
import { ESCAPADE_API } from './data/consts.js'

export class EscapadeClient {
    #token: string

    constructor(args: { token: string }) {
        this.#token = args.token
    }

    /**
     * 
     * @param method 
     * @param endpoint 
     * @param data 
     * @returns 
     */
    public async api(method: 'GET' | 'POST' | 'DELETE', ENDPOINT: string, data?: any): Promise<[number, string]> {
        const response = await fetch(`${ESCAPADE_API}/${ENDPOINT}`, {
            method,
            headers: {
                Authorization: 'Bearer ' + this.#token
            },
            body: data !== undefined ? JSON.stringify(data) : null
        })

        return [response.status, await response.text()]
    }
}