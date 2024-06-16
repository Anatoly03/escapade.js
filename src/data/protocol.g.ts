
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
    Sync = 1,
	Block = 13,
	Add = 20,
	Leave = 21,
	Chat = 23,
    Move = 40,
}

export type WorldEvent = {
	blockArgs: BlockArgs
	eventType: 13
	issuerLocalPlayerId: number
} | {
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

export interface InitArgs {
	currentTime?: number
	world?: WorldInfo
	me?: PlayerInfo
	players?: PlayerInfo[]
	crownedPlayerId?: number
	// keyStates?: KeyState[]
	enabledOrangeSwitches?: number[]
}

export interface WorldInfo {
	width?: number
	height?: number
	deflatedWorldData?: Uint8Array
	ownerId?: string
	ownerName?: string
	updatedFields?: 0 | 1 | 2
	worldTitle?: string
	mapHidden?: boolean
}

export interface ChatArgs {
	message?: string
	isPrivate?: boolean
	targetLocalPlayerId?: number
}

export interface PlayerInfo {
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

export interface PlayerState {
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

export interface MoveArgs {
	tickDelta?: number
	seed?: number
	position?: { x?: number, y?: number }
	direction?: { x?: number, y?: number }
	velocity?: { x?: number, y?: number }
	isJumping?: boolean
	isGod?: boolean
}

export interface WorldData {
	blockEntries?: BlockEntry[]
}

export interface BlockEntry {
	xs?: Uint8Array
	ys?: Uint8Array
	blockId?: number
	layer?: 0 | 1
	intArgs?: number[]
	stringArgs?: string[]
}

export interface BlockArgs {
	x?: number
	y?: number
	blockId?: number
	layer?: 0 | 1
	intArgs?: number[]
	stringArgs?: string[]
}

export type SendEventTypes = {
    // Init: {},
    Sync: {},
	Block: BlockArgs
	Leave: {},
    Chat: ChatArgs,
    Move: MoveArgs
}
