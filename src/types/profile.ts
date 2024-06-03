
export interface Profile<HasName extends boolean> {
    has_name: HasName
    name: HasName extends true ? string : never
    smiley_id: number
    aura_shape_id: number
    aura_color_id: number
    gems: number
    items: string[]
}