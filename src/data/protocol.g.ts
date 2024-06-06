
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
}

export type WorldEvent<T> = {
	eventType: WorldEventType
	issuerLocalPlayerId: number
}
