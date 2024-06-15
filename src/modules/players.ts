import { EscapadeClient } from "../client";
import { Player } from "../types/player.js";

/**
 * @todo
 */
export default (players: Player[]) => (client: EscapadeClient<boolean, boolean>) => {

    /**
     * Add initial player into the array reference
     */
    client.raw().once('Init', ({ initArgs }: any) => {
        for (const player of initArgs.players) {
            players.push(new Player (player))
        }

        for (const player of players) {
            client.emit('player:join', player, false)
        }
    })

    /**
     * Add new player into the array reference
     */
    client.raw().on('Add', ({ addArgs }: any) => {
        const player = new Player (addArgs)
        players.push(player)
        client.emit('player:join', player, true)
    })

    /**
     * Removes leaving player from the array reference
     */
    client.raw().on('Leave', ({ issuerLocalPlayerId }: any) => {
        const index = players.findIndex(p => p.localPlayerId == issuerLocalPlayerId)
        if (index < 0) return
        client.emit('player:leave', players[index])
        players.splice(index, 1)
    })

    return client
}