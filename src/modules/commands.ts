
import { EventEmitter } from 'events'

import { EscapadeClient } from "../client"
import { PlayerInfo } from '../data/protocol.g'

/**
 * @todo
 */
export default (commands: [string, (player: PlayerInfo) => boolean, (receive: PlayerInfo, ...args: string[]) => void][]) => (client: EscapadeClient) => {
    async function handle_command(player: PlayerInfo, message: string) {
        const prefix = client.COMMAND_PREFIX.find(v => message.toLowerCase().startsWith(v))
        if (!prefix) return

        const slice = message.substring(prefix.length)
        const arg_regex = /"(\\\\|\\"|[^"])*"|'(\\\\|\\'|[^'])*'|[^\s]+/gi
        const args: string[] = []

        for (const match of slice.matchAll(arg_regex)) args.push(match[0])
        if (args.length < 1) return

        const cmd = args[0].toLowerCase()
        const accepted_commands = commands.filter(([cm, perm, _callback]) => cm == cmd && perm(player))

        if (accepted_commands.length == 0) return

        accepted_commands[0][2](player, ...args)
    }

    /**
     * Chat message was sent.
     */
    client.on('Chat', ({ issuerLocalPlayerId, chatArgs }) => {
        if (!client.connected()) return
        if (!chatArgs.message) return
        const sender = client.players().find(p => p.localPlayerId == issuerLocalPlayerId)
        if (!sender) return
        handle_command(sender, chatArgs.message)
    })

    return client
}