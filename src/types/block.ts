import { EscapadeClient } from "../client"
import { BlockArgs } from "../data/protocol.g"

export class Block<Positional extends boolean = false> {
    public id: number
    
    public layer: Positional extends true ? (0 | 1 | undefined) : never
    public x: Positional extends true ? (number | undefined) : never
    public y: Positional extends true ? (number | undefined) : never

    /**
     * The empty block (air)
     */
    constructor()

    /**
     * @param id Block Identifier
     */
    constructor(id: number)

    /**
     * @todo @ignore @param name Block Name
     */
    constructor(name: string)

    /**
     * @todo @ignore
     */
    constructor(args: {
        id: number
        x?: number
        y?: number
    } | BlockArgs)

    /**
     * @todo @ignore
     */
    constructor(args: Block)

    constructor(args?: {
        id: number
        x?: number
        y?: number
    } | Block | BlockArgs | number | string) {
        if (args === undefined)
            args = { id: 0 }
        else if (typeof args == 'number')
            args = { id: args }
        else if (typeof args == 'string')
            throw new Error('Not Implemented!')

        this.id = (<Block>args).id ?? (<BlockArgs>args).blockId ?? 0
        this.layer = (<BlockArgs>args).layer as any
        this.x = (<any>args).x
        this.y = (<any>args).y
    }

    /**
     * Returns a type guard, wether or not the current block
     * is tied to a world position. Such blocks can be then placed
     * directly as an event.
     */
    public isPositioned(): this is Block<true> {
        return this.x !== undefined && this.y !== undefined && this.layer !== undefined
    }

    /**
     * Returns wether or not two blocks are equal with their content,
     * for example two basic blocks with different positions are
     * equal, but two signs given the same coordinate with different
     * strings are not.
     */
    public equals<V extends boolean>(other: Block<V>): boolean {
        if (other === undefined) return this.id == 0
        // TODO add other custom data (int and string arguments)
        return this.id == other.id
    }

    /**
     * Create a new block instance that is tied to a position in world.
     */
    public at(args: {x?: number, y?: number, layer?: 0 | 1}): Block<true> {
        const block = new Block(this) as any
        block.x = args.x ?? 0
        block.y = args.y ?? 0
        block.layer = args.layer ?? 0
        return block as Block<true>
    }

    /**
     * Get the position vector of the current block
     */
    public pos(this: Block<true>): {x: number, y: number, layer: number} {
        return {x: this.x as number, y: this.y as number, layer: this.layer as number}
    }

    /**
     * Place a block, given a connected client.
     */
    public place(this: Block<true>, client: EscapadeClient<true>) {
        if (!client.connected()) return false // Error

        client.send('Block', {
            x: this.x,
            y: this.y,
            blockId: this.id,
            layer: this.layer,
            // intArgs: [],
            // stringArgs: [],
        })
    }
}