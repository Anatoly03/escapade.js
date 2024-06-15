
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
	Add = 20,
	Leave = 21,
	Chat = 23,
}

export type WorldEvent = {
	chatArgs: ChatArgs
	eventType: 23
	issuerLocalPlayerId: number
} | {
	addArgs: PlayerInfo
	eventType: 20
	issuerLocalPlayerId: number
} | {
	issuerLocalPlayerId: number
	eventType: 1 | 21
}

export type InitArgs = {
	currentTime?: number
	// world?: WorldInfo
	me?: PlayerInfo
	players?: PlayerInfo[]
	crownedPlayerId?: number
	// keyStates?: KeyState[]
	enabledOrangeSwitches?: number[]
}

export type ChatArgs = {
	message: string
	isPrivate: boolean
	targetLocalPlayerId: number
}

export type PlayerInfo = {
	localPlayerId?: number
	playerId?: string
	name?: string
	smileyId?: number
	auraShapeId?: number
	auraColorId?: number
	isReady?: boolean
	lastPositionUpdate?: number
	playState?: PlayerState
	permLevel?: 0 | 1 | 2 | 3
	canEdit?: boolean
}

export type PlayerState = {
	moveArgs?: MoveArgs
	respawnPoint?: [number, number]
	completedLevel?: boolean
	mapUnlocked?: boolean
	godModeUnlocked?: boolean
	deaths?: number
	// coinStates?: CoinState[]
	enabledPurpleSwitches?: number[]
	// effects?: EffectState[]
	// team?: (typeof Team)[keyof typeof Team]
}

export type MoveArgs = {
	tickDelta?: number
	seed?: number
	position?: [number, number]
	direction?: [number, number]
	velocity?: [number, number]
	isJumping?: boolean
	isGod?: boolean
}

export type SendEventTypes = {
    Init: {},
    Chat: ChatArgs
}
