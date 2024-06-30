
import * as fflate from 'fflate'

import { EscapadeClient } from '../client.js'
import { BlockEntry, WorldData, WorldInfo } from '../data/protocol.g.js'
import { Block } from './block.js'

/**
 * A class to handle world information, especially focusing on block data.
 * 
 * @example
 * 
 * ```ts
 * client.onCommand('replace', p => p.name == 'anatoly', (player, _, x, y) => {
 *     if (!client.connected()) return
 * 
 *     let ix = parseInt(x)
 *     let iy = parseInt(y)
 * 
 *     for (const block of client.world().blocks()) {
 *         if (!block) {
 *             continue
 *         }
 *         if (block.id == ix)
 *             client.send('Block', {
 *                 x: block.x,
 *                 y: block.y,
 *                 layer: block.layer,
 *                 blockId: iy
 *             })
 *     }
 * })
 * ```
 */
export class World {
    public width: number
    public height: number

    public owner: {
        playerId: string
        name: string | undefined
    }

    #client: EscapadeClient<true>
    #data: Block<true>[][][]

    constructor(from: WorldInfo, client: EscapadeClient<true>) {
        this.width = from.width ?? 0
        this.height = from.height ?? 0

        this.owner = {
            playerId: from.ownerId ?? 'undeclared',
            name: from.ownerName
        }

        this.#client = client

        // Generate block matrix

        this.#data = [[], []]
        for (let layer = 0; layer < 2; layer++) {
            this.#data[layer] = new Array(this.width)
            for (let x = 0; x < this.width; x++) {
                this.#data[layer][x] = new Array(this.height)
            }
        }

        // Retrieve block data

        this.fromBuffer(from.deflatedWorldData as Uint8Array)
    }

    /**
     * @todo
     */
    get foreground(): Block<true>[][] {
        return this.#data[0]
    }

    /**
     * @todo
     */
    get background(): Block<true>[][] {
        return this.#data[1]
    }

    /**
     * @todo
     */
    layer(v: 0 | 1): Block<true>[][] {
        return this.#data[v]
    }

    /**
     * Iterate over all blocks
     */
    public * blocks() {
        for (let layer = 0; layer < this.#data.length; layer += 1)
            for (let x = 0; x < this.#data[layer].length; x += 1)
                for (let y = 0; y < this.#data[layer][x].length; y += 1)
                    yield this.#data[layer][x][y]
        return true
    }

    /**
     * @todo
     */
    public load() {
        this.#client.say('/reload')
        return this
    }

    /**
     * @todo
     */
    public save() {
        this.#client.say('/save')
        return this
    }

    /**
     * @todo
     */
    public fromBuffer(deflatedWorldData: Uint8Array) {
        const decompressed = fflate.inflateSync(deflatedWorldData)
        const world_data = EscapadeClient.protocol.lookupType('WorldData').decode(decompressed) as WorldData
        const blocks = world_data.blockEntries as BlockEntry[]

        for (const entry of blocks) {
            const xPos = new Uint16Array(entry.xs?.buffer.slice(entry.xs.byteOffset, entry.xs.byteOffset + entry.xs.length) as ArrayBufferLike)
            const yPos = new Uint16Array(entry.ys?.buffer.slice(entry.ys.byteOffset, entry.ys.byteOffset + entry.ys.length) as ArrayBufferLike)
            const id = entry.blockId ?? 0

            for (let i = 0; i < Math.min(xPos.length, yPos.length); i++) {
                this.#data[entry.layer ?? 0][xPos[i]][yPos[i]] = new Block({
                    x: xPos[i], y: yPos[i], id
                })
            }
        }
    }

    /**
     * @todo
     */
    public toBuffer() {
        return this
    }
}
