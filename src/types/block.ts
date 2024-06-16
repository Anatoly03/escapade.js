import { BlockArgs } from "../data/protocol.g"

export class Block<Positional extends boolean = false> {
    public id: number

    private x: number | undefined
    private y: number | undefined

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
        this.x = (<any>args).x
        this.y = (<any>args).y
    }

    /**
     * Returns a type guard, wether or not the current block
     * is tied to a world position. Such blocks can be then placed
     * directly as an event.
     */
    public isPositioned(): this is Block<true> {
        return this.x !== undefined && this.y !== undefined
    }

    /**
     * Are two blocks equal
     */
    public equals(other: Block): boolean {
        if (other === undefined) return this.id == 0
        // TODO add other custom data (int and string arguments)
        return this.id == other.id
    }

    /**
     * Create a new block instance that is tied to a position in world.
     */
    public at(x: number, y: number): Block<true> {
        const block = new Block(this)
        block.x = x
        block.y = y
        return block as Block<true>
    }

    /**
     * Get the position vector of the current block
     */
    public pos(this: Block<true>): {x: number, y: number} {
        return {x: this.x as number, y: this.y as number}
    }
}