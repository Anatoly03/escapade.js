
/**
 * The interface Friend. It only stored the player id, name and smiley id.
 */
export interface Friend {
    player_id: string
    name: string
    smiley_id: number
}

/**
 * The interface Profile.
 */
export interface Profile<HasName extends boolean = true> {
    has_name: HasName
    name: HasName extends true ? string : never
    smiley_id: number
    aura_shape_id: number
    aura_color_id: number
    gems: number
    items: string[]
}

/**
 * Campaign Group
 */
export interface CampaignMeta {
    title: string,
    description: string,
    difficulty: number,
    worlds: CampaignWorldMeta[]
}

/**
 * Campaign World
 */
export interface CampaignWorldMeta {
    world_id: string
    difficulty: number
    preview_image_url: string
    title: string
    owner_id: string
    owner_name: string
}

/**
 * World Meta Data
 */
export interface WorldMeta {
    id: string
    title: string
    owner: string
    playCount: number
    onlineCount: number
}