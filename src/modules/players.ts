import { EscapadeClient } from "../client";
import { PlayerInfo, WorldEventType } from "../data/protocol.g.js";
import { SelfPlayer } from "../types/player.js";

/**
 * @todo
 */
export default (set_self: (self: SelfPlayer) => SelfPlayer, players: PlayerInfo[]) => (client: EscapadeClient) => {

    /**
     * Add initial player into the array reference
     */
    client.once('Init', ({ issuerLocalPlayerId, initArgs }) => {
        if (!client.connected()) throw new Error('Could not connect Player Manager.')

        const me = initArgs.me as PlayerInfo
        const self = set_self(new SelfPlayer(client, me))
        players.push(me)

        for (const player of initArgs.players ?? []) {
            if (player.localPlayerId === self.id) continue
            players.push(player)
        }

        // Helper Events

        for (const player of players) {
            if (player.localPlayerId === self.id) continue
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
        players.push(addArgs)
        // if (addArgs.localPlayerId === client.self().localPlayerId) return
        // client.emit('player:join', player, true)
    })

    /**
     * 
     */
    client.on('CanEditChange', ({ issuerLocalPlayerId, canEditArgs }) => {
        const player = players.find(p => p.localPlayerId == issuerLocalPlayerId)
        if (!player) return
        player.canEdit = canEditArgs.canEdit ?? false
    })

    /**
     * Removes leaving player from the array reference
     */
    client.on('Leave', ({ issuerLocalPlayerId }: any) => {
        const index = players.findIndex(p => p.localPlayerId == issuerLocalPlayerId)
        if (index < 0) return
        players.splice(index, 1)
    })

    return client
}