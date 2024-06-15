
/**
 * 
 */
export class Player {
    public id: number
    public gid: string
    public name: string
    public ready: boolean
    public face_id: number
    public aura_shape_id: number
    public aura_color_id: number
    public position: [number, number]
    public respawn: [number, number]

    constructor(args: Partial<Player>) {
        this.id = args.id ?? 0
        this.gid = args.gid ?? 'unknown'
        this.name = args.name?.toUpperCase() ?? 'UNKNOWN'
        this.ready = args.ready || false
        this.face_id = args.face_id ?? 0
        this.aura_shape_id = args.aura_shape_id ?? 0
        this.aura_color_id = args.aura_color_id ?? 0
        this.position = args.position ?? [0, 0]
        this.respawn = args.respawn ?? [0, 0]
    }
}
