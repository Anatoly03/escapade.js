
import * as fflate from 'fflate'

import { EscapadeClient } from '../client.js'
import { BlockEntry, WorldData, WorldInfo } from '../data/protocol.g.js'
import { Block } from './block.js'

export class World {
    public width: number
    public height: number

    public owner: {
        playerId: string
        name: string | undefined
    }
    
    #data: Block<true>[][][]

    constructor(from: WorldInfo, client: EscapadeClient<boolean, boolean>) {
        this.width = from.width ?? 0
        this.height = from.height ?? 0

        this.owner = {
            playerId: from.ownerId ?? 'undeclared',
            name: from.ownerName
        }

        // Generate block matrix
        
        this.#data = [[], []]
        for (let layer = 0; layer < 2; layer ++) {
            this.#data[layer] = new Array(this.width)
            for (let x = 0; x < this.width; x++) {
                this.#data[layer][x] = new Array(this.height)
            }
        }

        // Retrieve block data

        const decompressed = fflate.inflateSync(from.deflatedWorldData as Uint8Array)
        const world_data = EscapadeClient.protocol.lookupType('WorldData').decode(decompressed) as WorldData
        const blocks = world_data.blockEntries as BlockEntry[]

        for (const entry of blocks) {
            const xPos = new Uint16Array(entry.xs?.buffer.slice(entry.xs.byteOffset, entry.xs.byteOffset + entry.xs.length) as ArrayBufferLike)
            const yPos = new Uint16Array(entry.ys?.buffer.slice(entry.ys.byteOffset, entry.ys.byteOffset + entry.ys.length) as ArrayBufferLike)
            const id = entry.blockId ?? 0
            
            // this.data[b.layer ?? 0]
            // console.log(entry.blockId, entry.intArgs, entry.stringArgs)

            for (let i = 0; i < Math.min(xPos.length, yPos.length); i++) {
                this.#data[entry.layer ?? 0][xPos[i]][yPos[i]] = new Block({
                    x: xPos[i], y: yPos[i], id
                })
            }

            // console.log(b.xs)
            // console.log(b.xs?.length)
            // console.log(new Uint16Array(Buffer.from(b.xs?.buffer.slice(0, b.xs.length) as Uint8Array)))
            // console.log(new Uint16Array(b.xs?.buffer as Uint8Array)?.BYTES_PER_ELEMENT)
            // console.log(new Uint16Array(b.xs?.buffer as Uint8Array))
            // console.log(b.ys)
        }

        // console.log(world_data)
    }

    /**
     * 
     */
    get foreground(): Block<true>[][] {
        return this.#data[1]
    }

    /**
     * 
     */
    get background(): Block<true>[][] {
        return this.#data[0]
    }

    /**
     * 
     */
    layer(v: 0 | 1): Block<true>[][] {
        return this.#data[v]
    }

    /**
     * 
     */
    public load(deflatedWorldData?: Uint8Array) {
        // TODO
    }

    /**
     * 
     */
    public save() {
        // TODO
    }
}
