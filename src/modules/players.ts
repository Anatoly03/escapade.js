import { EscapadeClient } from "../client";
import { PlayerInfo } from "../data/protocol.g";

/**
 * @todo
 */
export default (players: PlayerInfo[]) => (client: EscapadeClient<boolean>) => {

    /**
     * Add initial player into the array reference
     */
    client.raw().once('Init', ({ initArgs }: any) => {
        for (const player of initArgs.players) {
            players.push(player)
        }

        for (const player of initArgs.players) {
            client.emit('player:join', player, false)
        }
    })

    /**
     * Add new player into the array reference
     */
    client.raw().on('Add', ({ addArgs }: any) => {
        players.push(addArgs)
        client.emit('player:join', addArgs, true)
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