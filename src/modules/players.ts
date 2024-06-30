import { EscapadeClient } from "../client";
import { PlayerInfo, WorldEventType } from "../data/protocol.g.js";
import { Player, SelfPlayer } from "../types/player.js";

/**
 * @todo
 */
export default (set_self: (self: SelfPlayer) => SelfPlayer, players: PlayerInfo[]) => (client: EscapadeClient) => {

    /**
     * Add initial player into the array reference
     */
    client.once('Init', ({ issuerLocalPlayerId, initArgs }) => {
        if (!client.connected()) throw new Error('Could not connect Player Manager.')

        const self = set_self(new SelfPlayer(client, initArgs.me))
        players.push(self)

        for (const player of initArgs.players ?? []) {
            if (player.localPlayerId === self.localPlayerId) continue
            players.push(new Player (client, player))
        }

        for (const player of players) {
            if (player.localPlayerId === self.localPlayerId) continue
            client.emit('OldAdd', {
                issuerLocalPlayerId,
                addArgs: player,
                eventType: WorldEventType.Add
            })
        }
    })

    /**
     * Add new player into the array reference
     */
    client.on('Add', ({ addArgs }: any) => {
        if (!client.connected()) return
        if (players.some(p => p.localPlayerId == addArgs.localPlayerId)) return // Player already exists
        const player = new Player (addArgs)
        players.push(player)
        if (player.localPlayerId === client.self().localPlayerId) return
        // client.emit('player:join', player, true)
    })

    /**
     * Removes leaving player from the array reference
     */
    client.on('Leave', ({ issuerLocalPlayerId }: any) => {
        const index = players.findIndex(p => p.localPlayerId == issuerLocalPlayerId)
        if (index < 0) return
        // client.emit('player:leave', players[index])
        players.splice(index, 1)
    })

    return client
}