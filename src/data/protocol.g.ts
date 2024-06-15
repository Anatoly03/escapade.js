
/*
 * The idea of `protocol.g.ts` is to have the file be
 * overwritten by `protocol.ts`
 */

export type JoinWorld = {
	authToken: string
	worldId: string
}

export enum WorldEventType {
    Init = 0,
	Chat = 23,
}

export type WorldEvent = {
	chatArgs: ChatArgs
	eventType: 23
	issuerLocalPlayerId: number
} | {
	issuerLocalPlayerId: number
	eventType: 1 | 21
}

export type ChatArgs = {
	message: string
	isPrivate: boolean
	targetLocalPlayerId: number
}

export type WorldEventMatch = {
    Chat: ChatArgs
}
