import { EscapadeClient } from "../client.js";
import { BlockArgs, WorldInfo } from "../data/protocol.g.js";
import { Block } from "../types/block.js";
import { Player } from "../types/player.js";
import { World } from "../types/world.js";

/**
 * @todo
 */
export default (set_world: (world: World) => World) => (client: EscapadeClient) => {

    /**
     * Scrap world data into an organized structure
     */
    client.raw().once('Init', ({ initArgs }: any) => {
        if (!client.connected()) throw new Error('Could not connect Player Manager.')
        const world_info = initArgs.world as WorldInfo
        const world = set_world(new World(world_info, client))
    })

    /**
     * Set block
     */
    client.raw().on('Block', ({ issuerLocalPlayerId, blockArgs }: any) => {
        if (!client.connected()) throw new Error('Could not connect Player Manager.')

        const player = client.players().find(p => p.localPlayerId == issuerLocalPlayerId) as Player
        
        const block = new Block<true>(blockArgs)
        const previous_block = client.world()
            .layer(blockArgs.layer)[blockArgs.x || 0][blockArgs.y || 0]

        client.world()
            .layer(blockArgs.layer)[blockArgs.x || 0][blockArgs.y || 0] = new Block(blockArgs)

        if (block.equals(previous_block)) return

        client.emit('block', player, block)
    })

    return client
}