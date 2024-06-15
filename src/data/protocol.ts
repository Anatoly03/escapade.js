import fs from 'fs'
import protobuf from 'protobufjs'

export const PROTOCOL = protobuf.loadSync(import.meta.dirname + '/protocol.proto')

interface Variable<T> {
    type: 'enum' | 'struct' | 'world'
    key: string
}

interface EnumVar extends Variable<number> {
    key: 'enum'
}

interface MessageVar extends Variable<string> {
    key: 'struct'
}

interface WorldEvent extends Variable<{
    eventType: number
    issuerLocalPlayerId: 'number'
    initArgs: string
}> {
    key: 'world'
}

const Variables: Variable<any>[] = []

export const WorldEventMatch: {[keys: string]: string[]} = {
	Init: ['initArgs'],
	Sync: [],
	WorldInfoUpdate: ['worldInfoArgs'],
	Notification: ['notificationArgs'],
	WorldReset: ['worldResetArgs'],
	Block: ['blockArgs'],
	Add: ['addArgs'],
	Leave: [],
	PlayerReset: ['playerResetArgs'],
	Chat: ['chatArgs'],
	SmileyChange: ['smileyChangeArgs'],
	AuraChange: ['auraChangeArgs'],
	CanEditChange: ['canEditArgs'],
	CanUseGodModeChange: ['canUseGodModeArgs'],
	Move: ['moveArgs'],
	MoveUpdate: ['moveArgs'],
	Death: ['deathArgs'],
	SetRespawnPoint: ['setRespawnPointArgs'],
	Respawn: ['respawnArgs'],
	MapEnablerTouch: ['blockTouchArgs'],
	GodModeEnablerTouch: ['blockTouchArgs'],
	TrophyTouch: ['blockTouchArgs'],
	CoinCollect: ['coinCollectArgs'],
	KeyTouch: ['keyTouchArgs'],
	CrownTouch: ['blockTouchArgs'],
	PurpleSwitchTouch: ['switchTouchArgs'],
	OrangeSwitchTouch: ['switchTouchArgs'],
	CheckpointTouch: ['blockTouchArgs'],
	EffectTouch: ['effectTouchArgs'],
	PlayerTouch: ['playerTouchArgs'],
	TeamChange: ['teamChangeArgs'],
}

const Header = `\n/*
 * The following file is generated from \`protocol.ts\`.
 */\n`

const TypeScript = fs.createWriteStream(import.meta.dirname + '/protocol.g.d.ts', { autoClose: true })
const JavaScript = fs.createWriteStream(import.meta.dirname + '/protocol.g.js', { autoClose: true })

TypeScript.write(Header)
JavaScript.write(Header)

/**
 * In global scope, find all declared variables and match their types.
 * This labels all enums as constant mappings.
 * This will label the special type 'WorldEvent'.
 * This will label message types as structures.
 */
;(() => {
    const { protocol } = PROTOCOL.nested as any
    const IGNORE_KEYS = ['options', 'nested']

    for (const key in protocol) {
        if (IGNORE_KEYS.includes(key)) continue
        const value = (protocol as any)[key]
        if (!value) continue
        const { name } = value.constructor
        const isWorldEvent = value.name == 'WorldEvent'

        if (value.name == 'WorldEvent') {
            Variables.push({ type: 'world', key } as WorldEvent)
        } else if (name == 'Type') {
            Variables.push({ type: 'struct', key } as MessageVar)
        } else if (name == 'Object') {
            Variables.push({ type: 'enum', key } as EnumVar)
        }
    }
})();

/**
 * This will treat the key and tell you if it
 * is a typescript type or a value
 */
function treat_type(key: string) {
    const Var = Variables.find(v => v.key == key)
    if (Var && Var.type == 'enum')
        return `(typeof ${key})[keyof typeof ${key}]`
    return key
}

/**
 * Write all enumerates
 */
(() => {
    for (const { key } of Variables.filter(value => value.type == 'enum')) {
        const Enum = PROTOCOL.lookupEnum(key)

        TypeScript.write(`\nexport declare const ${key}: {\n${
            Object.entries(Enum.values).map(([v, k]) => `\t${v}: ${k}`).join('\n')
        }\n}\n`)
        
        JavaScript.write(`\nexport const ${key} = ((o) => {\n${
            Object.entries(Enum.values).map(([v, k]) => `\to['${v}'] = ${k}`).join('\n')
        }\n\treturn Object.freeze(o)\n})({})\n`)
    }
})()

/**
 * Convert a C type to TypeScript type
 */
function convert_to_js_type(s: string) {
    s = treat_type(s)
    if (s == 'bool')
        return 'boolean'
    else if (s == 'bytes')
        return 'Uint8Array'
    else if (/u?int(8|16|32|64|128)/.test(s) || s == 'double' || s == 'float')
        return 'number'
    return s
}

const UsedEvents: number[] = [];
const WorldEventMaps: [string, string][] = [];
let EventsWithoutArguments: [string, number][] = [];

/**
 * Write all structures
 */
(() => {
    const WorldEvent = PROTOCOL.lookupType('WorldEvent')
    const WorldEventTypes = PROTOCOL.lookupEnum('WorldEventType').values

    for (const Var of Variables.filter(value => value.type == 'struct' || value.type == 'world')) {
        const { key } = Var
        const Type = PROTOCOL.lookupType(key)
        const Oneofs = Type.oneofs ? Object.keys(Type.oneofs) : []
        
        let UsedKeys: string[] = []
        let Combinations: string[][] = []

        for (const attr of Oneofs) {
            const List = Type.get(attr) as protobuf.OneOf
            const ChildAttrs = List.fieldsArray.map(v => v.name)
            const Tmp: string[][] = []

            if (Combinations.length == 0) {
                Combinations = [...ChildAttrs.map(v => [v])]
                UsedKeys = ChildAttrs
            } else for (const v of ChildAttrs) {
                    if (!UsedKeys.includes(v))
                        UsedKeys.push(v)
                    for (const vs of Combinations) {
                        Tmp.push([v, ...vs])
                    }
                }
        }

        if (Combinations.length == 0)
            Combinations = [[]]

        const MutualKeys = Object.keys(Type.fields).filter(k => !UsedKeys.includes(k))

        for (const key_pairs of Combinations) {
            key_pairs.push(...MutualKeys)
        }

        const TypeString = Combinations.map(keys => {
            return keys.map(attr =>  {
                let type
                const value = Type.fields[attr] as protobuf.Field

                if (Var.type == 'world' && attr == 'eventType') {
                    const param = keys.filter(k => k != 'eventType' && k != 'issuerLocalPlayerId')[0]
                    // const param_type = WorldEvent.fields[param].type
                    const param_keys = Object.entries(WorldEventMatch).filter(([_, v]) => v.some(s => param == s))
                    const event_ids = param_keys.map(([k, _]) => WorldEventTypes[k])
                    // console.log(param, param_type, param_keys)
                    // const [event_name] = Object.entries(WorldEventMatch).find(([_, v]) => v.includes(param)) as [string, [string]]
                    // const event_id = WorldEventTypes[event_name]
                    // console.log(event_name, event_id)
                    UsedEvents.push(...event_ids)
                    return '\teventType: ' + event_ids.join(' | ')
                }
                else {
                    type = treat_type(convert_to_js_type(value.type)) + (value.repeated ? '[]' : '')
                    if (Var.type == 'world' && attr != 'issuerLocalPlayerId') WorldEventMaps.push([attr, type])
                }

                return `\t${attr}${(Var.type != 'world' && value.optional) ? '?' : ''}: ${type}`
            }).join('\n')
        }).join('\n} | {\n')

        if (Var.type == 'world') {
            EventsWithoutArguments = Object.entries(WorldEventTypes).filter(([k, v]) => !UsedEvents.includes(v))
            const other_events = '\tissuerLocalPlayerId: number\n\teventType: ' + EventsWithoutArguments.map(([k, v]) => v).join(' | ')
            TypeScript.write(`\nexport type ${key} = {\n${TypeString}\n} | {\n${other_events}\n}\n`)
        } else {
            TypeScript.write(`\nexport type ${key} = {\n${TypeString}\n}\n`)
        }

        // for (const attr of MutualKeys) {
        //     // console.log(attr, Type.get(attr)?.name, Type.get(attr)?.parent?.name)
        //     const value = Type.fields[attr] as protobuf.Field
        //     const type = treat_type(convert_to_js_type(value.type)) + (value.repeated ? '[]' : '')
        //     TypeScript.write(`\t${attr}${value.optional ? '?' : ''}: ${type}\n`)
        // }

        // TypeScript.write('}\n')
    }
})();

/**
 * Write the World Events magic type
 */
(() => {
    const WorldEventTypes = PROTOCOL.lookupEnum('WorldEventType').values
    const TypeMap = [...Object.entries(WorldEventTypes).map(([k, v]) => {
        if (EventsWithoutArguments.some(([kx]) => kx == k))
            return [k, '{}']
        const event = Object.entries(WorldEventMatch).find(([kx, vx]) => kx == k)
        if (!event) return [`\t// There was an error during file compilation: ${v}`, k]
        const attrs = event[1]
        const Type = treat_type(PROTOCOL.lookupType('WorldEvent').fields[attrs[0]].type)
        return [k, Type]
    })]

    TypeScript.write(`\nexport type SendEventTypes = {\n${TypeMap.map(([k, v]) => `\t${k}: ${v}`).join('\n')}\n}\n`)

    // console.log(WorldEventMatch)

    // Object
    //     .keys(Type.fields)
    //     .filter(k => k != 'eventType' && k != 'issuerLocalPlayerId')
    //     .forEach(key => {
    //         const map = Object.entries(WorldEventMatch).find(([_, v]) => Type.fields[key].type == v)
    //         console.log(key, Type.fields[key].name, Type.fields[key].type, map)
    //     })

    // Object.entries(WorldEventMatch)

    // console.log()
    // console.log(Object.keys(Type.oneofs))
    // console.log(Type.oneofs['eventArgs'].fieldsArray.map(v => v.name))

    // const type_declared: string[] = []
    // const declared: string[] = []
    // const { protocol } = PROTOCOL.nested as any

    // for (const key in protocol) {
    //     traverse(type_declared, declared, key, protocol)
    // }

    // console.log(WorldEventMaps)
    // console.log(EventsWithoutArguments)
})();

TypeScript.close()
JavaScript.close()

