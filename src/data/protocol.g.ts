
/*
 * The idea of `protocol.g.ts` is to have the file be
 * overwritten by `protocol.ts`
 */

export type JoinWorld = {
	authToken: string
	worldId: string
}

export type WorldEventType = {
	Chat: 23,
}

export type WorldEvent = {
    Chat: {
        eventType: number
        issuerLocalPlayerId: number
        chatArgs: ChatArgs
    }
}

export type ChatArgs = {
	message: string
	isPrivate: boolean
	targetLocalPlayerId: number
}

export type WorldEventMatch = {
    Chat: ChatArgs
}
