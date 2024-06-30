
export { EscapadeClient } from './client.js'

/**
 * @ignore
 */
export { EscapadeClient as default } from './client.js'

/**
 * @protocol
 * 
 * | Event ID | Name | Data
 * |-|-|-|
 * | 0 | `Init` | `InitArgs`
 * | 1 | `Sync` | 
 * | 10 | `WorldInfoUpdate` | `WorldInfo`
 * | 11 | `Notification` | `NotificationArgs`
 * | 12 | `WorldReset` | `WorldResetArgs`
 * | 13 | `Block` | `BlockArgs`
 * | 20 | `Add` | `PlayerInfo`
 * | 21 | `Leave` | 
 * | 22 | `PlayerReset` | `PlayerResetArgs`
 * | 23 | `Chat` | `ChatArgs`
 * | 24 | `SmileyChange` | `SmileyChangeArgs`
 * | 25 | `AuraChange` | `AuraChangeArgs`
 * | 26 | `CanEditChange` | `CanEditChangeArgs`
 * | 27 | `CanUseGodModeChange` | `CanUseGodModeChangeArgs`
 * | 40 | `Move` | `MoveArgs`
 * | 41 | `MoveUpdate` | `MoveArgs`
 * | 42 | `Death` | `DeathArgs`
 * | 43 | `SetRespawnPoint` | `Vector2U`
 * | 44 | `Respawn` | `RespawnArgs`
 * | 50 | `MapEnablerTouch` | `BlockTouchArgs`
 * | 51 | `GodModeEnablerTouch` | `BlockTouchArgs`
 * | 52 | `TrophyTouch` | `BlockTouchArgs`
 * | 53 | `CoinCollect` | `CoinCollectArgs`
 * | 54 | `KeyTouch` | `KeyTouchArgs`
 * | 55 | `CrownTouch` | `BlockTouchArgs`
 * | 56 | `PurpleSwitchTouch` | `SwitchTouchArgs`
 * | 57 | `OrangeSwitchTouch` | `SwitchTouchArgs`
 * | 58 | `CheckpointTouch` | `BlockTouchArgs`
 * | 59 | `EffectTouch` | `EffectTouchArgs`
 * | 60 | `PlayerTouch` | `PlayerTouchArgs`
 * | 61 | `TeamChange` | `TeamChangeArgs`
 * 
 * Helper Events:
 * | Event ID | Name | Data | Description
 * |-|-|-|-|
 * | 20 | `OldAdd` | `PlayerInfo` | Player was added in the game before bot joined.
 */
export * as ProtocolType from './data/protocol.g.js'
