
/*
 * The following file is generated from `protocol.ts`.
 */

export enum WorldEventType {
	Init = 0,
	Sync = 1,
	WorldInfoUpdate = 10,
	Notification = 11,
	WorldReset = 12,
	Block = 13,
	Add = 20,
	Leave = 21,
	PlayerReset = 22,
	Chat = 23,
	SmileyChange = 24,
	AuraChange = 25,
	CanEditChange = 26,
	CanUseGodModeChange = 27,
	Move = 40,
	MoveUpdate = 41,
	Death = 42,
	SetRespawnPoint = 43,
	Respawn = 44,
	MapEnablerTouch = 50,
	GodModeEnablerTouch = 51,
	TrophyTouch = 52,
	CoinCollect = 53,
	KeyTouch = 54,
	CrownTouch = 55,
	PurpleSwitchTouch = 56,
	OrangeSwitchTouch = 57,
	CheckpointTouch = 58,
	EffectTouch = 59,
	PlayerTouch = 60,
	TeamChange = 61,
}

export enum WorldPerm {
	PermPlayer = 0,
	PermEdit = 1,
	PermCommands = 2,
	PermOwner = 3,
}

export enum WorldInfoFields {
	_ = 0,
	Title = 1,
	Map = 2,
}

export enum BlockLayer {
	LayerSolid = 0,
	LayerBackground = 1,
}

export enum CoinType {
	CoinGold = 0,
	CoinBlue = 1,
}

export enum KeyType {
	KeyRed = 0,
	KeyGreen = 1,
	KeyBlue = 2,
	KeyMagenta = 3,
	KeyYellow = 4,
	KeyCyan = 5,
}

export enum EffectType {
	None = 0,
	Jump = 1,
	Speed = 2,
	Gravity = 3,
	Levitation = 4,
	MultiJump = 5,
	GravityDirection = 6,
	OnFire = 7,
	Invulnerability = 8,
	Poison = 9,
	Zombie = 10,
	Curse = 11,
}

export enum Team {
	TeamNone = 0,
	TeamRed = 1,
	TeamGreen = 2,
	TeamBlue = 3,
	TeamMagenta = 4,
	TeamYellow = 5,
	TeamCyan = 6,
}

export interface JoinWorld {
	authToken?: string
	worldId?: string
}

export type WorldEvent = {
	initArgs: InitArgs
	eventType: 0
	issuerLocalPlayerId: number
} | {
	worldInfoArgs: WorldInfo
	eventType: 10
	issuerLocalPlayerId: number
} | {
	notificationArgs: NotificationArgs
	eventType: 11
	issuerLocalPlayerId: number
} | {
	worldResetArgs: WorldResetArgs
	eventType: 12
	issuerLocalPlayerId: number
} | {
	blockArgs: BlockArgs
	eventType: 13
	issuerLocalPlayerId: number
} | {
	addArgs: PlayerInfo
	eventType: 20
	issuerLocalPlayerId: number
} | {
	playerResetArgs: PlayerResetArgs
	eventType: 22
	issuerLocalPlayerId: number
} | {
	chatArgs: ChatArgs
	eventType: 23
	issuerLocalPlayerId: number
} | {
	smileyChangeArgs: SmileyChangeArgs
	eventType: 24
	issuerLocalPlayerId: number
} | {
	auraChangeArgs: AuraChangeArgs
	eventType: 25
	issuerLocalPlayerId: number
} | {
	canEditArgs: CanEditChangeArgs
	eventType: 26
	issuerLocalPlayerId: number
} | {
	canUseGodModeArgs: CanUseGodModeChangeArgs
	eventType: 27
	issuerLocalPlayerId: number
} | {
	moveArgs: MoveArgs
	eventType: 40 | 41
	issuerLocalPlayerId: number
} | {
	deathArgs: DeathArgs
	eventType: 42
	issuerLocalPlayerId: number
} | {
	setRespawnPointArgs: Vector2U
	eventType: 43
	issuerLocalPlayerId: number
} | {
	respawnArgs: RespawnArgs
	eventType: 44
	issuerLocalPlayerId: number
} | {
	blockTouchArgs: BlockTouchArgs
	eventType: 50 | 51 | 52 | 55 | 58
	issuerLocalPlayerId: number
} | {
	coinCollectArgs: CoinCollectArgs
	eventType: 53
	issuerLocalPlayerId: number
} | {
	keyTouchArgs: KeyTouchArgs
	eventType: 54
	issuerLocalPlayerId: number
} | {
	switchTouchArgs: SwitchTouchArgs
	eventType: 56 | 57
	issuerLocalPlayerId: number
} | {
	effectTouchArgs: EffectTouchArgs
	eventType: 59
	issuerLocalPlayerId: number
} | {
	playerTouchArgs: PlayerTouchArgs
	eventType: 60
	issuerLocalPlayerId: number
} | {
	teamChangeArgs: TeamChangeArgs
	eventType: 61
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
	keyStates?: KeyState[]
	enabledOrangeSwitches?: number[]
}

export interface WorldInfo {
	width?: number
	height?: number
	deflatedWorldData?: Uint8Array
	ownerId?: string
	ownerName?: string
	updatedFields?: (typeof WorldInfoFields)[keyof typeof WorldInfoFields]
	worldTitle?: string
	mapHidden?: boolean
}

export interface WorldResetArgs {
	deflatedWorldData?: Uint8Array
	respawnPoint?: Vector2U
}

export interface WorldData {
	blockEntries?: BlockEntry[]
}

export interface BlockEntry {
	xs?: Uint8Array
	ys?: Uint8Array
	blockId?: number
	layer?: (typeof BlockLayer)[keyof typeof BlockLayer]
	intArgs?: number[]
	stringArgs?: string[]
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
	permLevel?: (typeof WorldPerm)[keyof typeof WorldPerm]
	canEdit?: boolean
}

export interface PlayerResetArgs {
	respawnPoint?: Vector2U
	targetLocalPlayerId?: number
}

export interface PlayerState {
	moveArgs?: MoveArgs
	respawnPoint?: Vector2U
	completedLevel?: boolean
	mapUnlocked?: boolean
	godModeUnlocked?: boolean
	deaths?: number
	coinStates?: CoinState[]
	enabledPurpleSwitches?: number[]
	effects?: EffectState[]
	team?: (typeof Team)[keyof typeof Team]
}

export interface CanUseGodModeChangeArgs {
	canUseGodMode?: boolean
}

export interface CanEditChangeArgs {
	canEdit?: boolean
}

export interface MoveArgs {
	tickDelta?: number
	seed?: number
	position?: Vector2D
	direction?: Vector2I
	velocity?: Vector2D
	isJumping?: boolean
	isGod?: boolean
}

export interface Vector2U {
	x?: number
	y?: number
}

export interface Vector2I {
	x?: number
	y?: number
}

export interface Vector2D {
	x?: number
	y?: number
}

export interface SmileyChangeArgs {
	smileyId?: number
}

export interface AuraChangeArgs {
	auraShapeId?: number
	auraColorId?: number
}

export interface ChatArgs {
	message?: string
	isPrivate?: boolean
	targetLocalPlayerId?: number
}

export interface NotificationArgs {
	message?: string
}

export interface BlockArgs {
	x?: number
	y?: number
	blockId?: number
	layer?: (typeof BlockLayer)[keyof typeof BlockLayer]
	intArgs?: number[]
	stringArgs?: string[]
}

export interface DeathArgs {
	tickDelta?: number
	count?: number
}

export interface RespawnArgs {
	tickDelta?: number
	position?: Vector2D
}

export interface CoinState {
	coinType?: (typeof CoinType)[keyof typeof CoinType]
	coinAmount?: number
	collectedCoinsPositions?: Vector2U[]
}

export interface CoinCollectArgs {
	tickDelta?: number
	x?: number
	y?: number
	coinType?: (typeof CoinType)[keyof typeof CoinType]
	discard?: boolean
	coinAmount?: number
}

export interface KeyState {
	keyType?: (typeof KeyType)[keyof typeof KeyType]
	lastActivation?: number
	duration?: number
}

export interface KeyTouchArgs {
	tickDelta?: number
	x?: number
	y?: number
	keyType?: (typeof KeyType)[keyof typeof KeyType]
	duration?: number
}

export interface BlockTouchArgs {
	tickDelta?: number
	x?: number
	y?: number
}

export interface SmileyChangingBlockTouchArgs {
	tickDelta?: number
	x?: number
	y?: number
	smileyId?: number
}

export interface SwitchTouchArgs {
	tickDelta?: number
	x?: number
	y?: number
	switchId?: number
	enabled?: boolean
}

export interface EffectState {
	effect?: (typeof EffectType)[keyof typeof EffectType]
	intArg?: number
	timeActivated?: number
}

export interface EffectTouchArgs {
	tickDelta?: number
	x?: number
	y?: number
	effect?: (typeof EffectType)[keyof typeof EffectType]
	enable?: boolean
	intArg?: number
}

export interface PlayerTouchArgs {
	tickDelta?: number
	localPlayerId?: number
	zombie?: boolean
	curse?: boolean
	timeActivated?: number
	duration?: number
}

export interface TeamChangeArgs {
	tickDelta?: number
	x?: number
	y?: number
	team?: (typeof Team)[keyof typeof Team]
}

export type SendEventTypes = {
	Init: InitArgs
	Sync: {}
	WorldInfoUpdate: WorldInfo
	Notification: NotificationArgs
	WorldReset: WorldResetArgs
	Block: BlockArgs
	Add: PlayerInfo
	Leave: {}
	PlayerReset: PlayerResetArgs
	Chat: ChatArgs
	SmileyChange: SmileyChangeArgs
	AuraChange: AuraChangeArgs
	CanEditChange: CanEditChangeArgs
	CanUseGodModeChange: CanUseGodModeChangeArgs
	Move: MoveArgs
	MoveUpdate: MoveArgs
	Death: DeathArgs
	SetRespawnPoint: Vector2U
	Respawn: RespawnArgs
	MapEnablerTouch: BlockTouchArgs
	GodModeEnablerTouch: BlockTouchArgs
	TrophyTouch: BlockTouchArgs
	CoinCollect: CoinCollectArgs
	KeyTouch: KeyTouchArgs
	CrownTouch: BlockTouchArgs
	PurpleSwitchTouch: SwitchTouchArgs
	OrangeSwitchTouch: SwitchTouchArgs
	CheckpointTouch: BlockTouchArgs
	EffectTouch: EffectTouchArgs
	PlayerTouch: PlayerTouchArgs
	TeamChange: TeamChangeArgs
}
