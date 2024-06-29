import { EscapadeClient } from "../client"

/**
 * @todo
 */
export default () => (client: EscapadeClient) => {

    /**
     * Chat message was sent.
     */
    client.on('Chat', ({ issuerLocalPlayerId, chatArgs }: any) => {
        if (!client.connected()) return
        const player = client.players().find(p => p.localPlayerId == issuerLocalPlayerId)
        if (!player) return
        client.emit('chat', player, chatArgs.message, chatArgs.isPrivate ?? false)
    })

    return client
}