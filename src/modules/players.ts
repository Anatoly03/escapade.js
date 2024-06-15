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
    })

    /**
     * Add new player into the array reference
     */
    client.raw().on('Add', ({ addArgs }: any) => {
        players.push(addArgs)
    })

    /**
     * Removes leaving player from the array reference
     */
    client.raw().on('Leave', ({ issuerLocalPlayerId }: any) => {
        const index = players.findIndex(p => p.localPlayerId == issuerLocalPlayerId)
        if (index < 0) return
        players.splice(index, 1)
    })

    return client
}