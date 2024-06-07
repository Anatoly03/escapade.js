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

const WorldEventMatch = {
	Init: 'InitArgs',
	Sync: null,
	WorldInfoUpdate: 'WorldInfo',
	Notification: 'NotificationArgs',
	WorldReset: 'WorldResetArgs',
	Block: 'BlockArgs',
	Add: 'PlayerInfo',
	Leave: null,
	PlayerReset: 'PlayerResetArgs',
	Chat: 'ChatArgs',
	SmileyChange: 'SmileyChangeArgs',
	AuraChange: 'AuraChangeArgs',
	CanEditChange: 'CanEditChangeArgs',
	CanUseGodModeChange: 'CanUseGodModeChangeArgs',
	Move: 'MoveArgs',
	MoveUpdate: 'MoveArgs',
	Death: 'DeathArgs',
	SetRespawnPoint: 'Vector2U',
	Respawn: 'RespawnArgs',
	MapEnablerTouch: 'BlockTouchArgs',
	GodModeEnablerTouch: 'BlockTouchArgs',
	TrophyTouch: 'BlockTouchArgs',
	CoinCollect: 'CoinCollectArgs',
	KeyTouch: 'KeyTouchArgs',
	CrownTouch: 'BlockTouchArgs',
	PurpleSwitchTouch: 'SwitchTouchArgs',
	OrangeSwitchTouch: 'SwitchTouchArgs',
	CheckpointTouch: 'BlockTouchArgs',
	EffectTouch: 'EffectTouchArgs',
	PlayerTouch: 'PlayerTouchArgs',
	TeamChange: 'TeamChangeArgs'
}

const Header = `\n/*
 * The following file is generated from \`protocol.ts\`.
 */\n`

const TypeScript = fs.createWriteStream(import.meta.dirname + '/protocol.g.d.ts', { autoClose: true })
const JavaScript = fs.createWriteStream(import.meta.dirname + '/protocol.g.js', { autoClose: true })

TypeScript.write(Header)
JavaScript.write(Header)

function traverse(type_declared: string[], declared: string[], key: string, protocol: protobuf.ReflectionObject) {
    if (!protocol) return

    function exists(key: string, t: 'type' | 'const') {
        if (declared.includes(key) || type_declared.includes(key)) return true
        switch (t) {
            case 'type':
                type_declared.push(key)
                return false
            case 'const':
                declared.push(key)
                return false
        }
    }

    function convert_to_js_type(s: string) {
        s = treat_type(s)
        if (s == 'bool')
            return 'boolean'
        else if (s == 'bytes')
            return 'Buffer'
        else if (/u?int(8|16|32|64|128)/.test(s) || s == 'double' || s == 'float')
            return 'number'
        return s
    }

    const IGNORE_KEYS = ['options', 'nested']
    if (IGNORE_KEYS.includes(key)) return

    const value = (protocol as any)[key]
    if (!value) return

    const { name } = value.constructor

    if (value.name == 'WorldEvent') {
        if (exists(key, 'type')) return

        const attributes: [string, string, string, number][] = []
        const oneofs: string[] = value.oneofs?.eventArgs.oneof || []
        const oneof_types: string[] = []
        const generic = 'MessageType'

        // if () {
        //     console.log(value)
        // }

        for (const attr of Object.keys(value.fields)) {
            let event_id = 0

            if (oneofs.includes(attr)) {
                const of_type: string = value.oneofs.eventArgs.fieldsArray.find((e: any) => e.name == attr).type
                const pair = Object.entries(WorldEventMatch).find(([_, v]) => v == of_type) as [string, string]
                const e = (WorldEventMatch as any)[pair[0]]

                // console.log(pair)

                // console.log(e)
                
                oneof_types.push(of_type)
                event_id = PROTOCOL.lookupEnum('WorldEventType').values[pair[0]]

                // console.log(event_id)

                attributes.push([attr, pair[0], of_type, event_id])
                // attributes.push([attr, `EventId extends '${pair[0]}' ? ${of_type} : never`])

                // console.log(key, attr, of_type, PROTOCOL.lookupEnum('WorldEventType').values)
            } else {
                const ts_type = convert_to_js_type(value.fields[attr].type) + (value.fields[attr].repeated ? '[]' : '')
                attributes.push([attr, '', ts_type, 0])
            }

            // console.log(key, attr, , , value.fields[attr].required ? 'required' : '-', value.fields[attr].map ? 'is map' : 'is not map')
        }

        const common_attributes = attributes.filter(([k]) => !oneofs.includes(k) && k !== 'eventType')
        const oneof_attributes = attributes.filter(([k]) => oneofs.includes(k))

        // (attributes.find(([k]) => k == 'eventType') as any)[1] = 'WorldEventType[EventId]'
        // console.log(oneof_attributes)

        TypeScript.write(
            `\nexport type ${key} = {\n${oneof_attributes.map(([k, t, v]) => `\t${t}: {\n${
                [['eventType', '', 0], ...common_attributes, [k, t, v]].map(([k, t, v]) => `\t\t${k}: ${v}`).join('\n')
            }\n\t}`).join('\n')}\n}\n`
        )

        // TypeScript.write(
        //     // `\nexport type ${key}_${generic} = ${oneof_types.map(k => `${k}`).join(' | ')}\n` + 
        //     `export type ${key} = {\n${oneof_attributes.map((([k, v]) => `\t${k}: {\n${v}\n}`)).join('\n')}\n}\n`
        // )

    } else if (name == 'Type') {
        if (exists(key, 'type')) return

        const attributes: [string, string][] = []
        const oneofs: string[] = value.oneofs?.eventArgs.oneof || []
        const oneof_types: string[] = []
        const generic = 'MessageType'

        // if () {
        //     console.log(value)
        // }

        for (const attr of Object.keys(value.fields)) {
            if (oneofs.includes(attr)) {
                const of_type: string = value.oneofs.eventArgs.fieldsArray.find((e: any) => e.name == attr).type
                oneof_types.push(of_type)
                attributes.push([attr, `${generic} extends ${of_type} ? ${of_type} : never`])
                // console.log(key, attr, of_type, PROTOCOL.lookupEnum('WorldEventType').values)
            } else {
                const ts_type = convert_to_js_type(value.fields[attr].type) + (value.fields[attr].repeated ? '[]' : '')
                attributes.push([attr, ts_type])
            }

            // console.log(key, attr, , , value.fields[attr].required ? 'required' : '-', value.fields[attr].map ? 'is map' : 'is not map')
        }

        const common_attributes = attributes.filter(([k]) => !oneofs.includes(k)).map(([k]) => k)
        const oneof_attributes = attributes.filter(([k]) => oneofs.includes(k))

        TypeScript.write(`\nexport type ${key} = {\n${attributes.map((([k, v]) => `\t${k}: ${v}`)).join('\n')}\n}\n`)

        // TypeScript.write(`${value.oneofs ? `\nexport type ${key}${generic} = ${oneof_types.join(' | ')}` : ''}\n\nexport type ${key}${value.oneofs ? `<${generic} extends ${key}${generic}>` : ''} = {\n${attributes.map((([k, v]) => `\t${k}: ${v}`)).join('\n')}\n}\n`)
    }
}

/**
 * In global scope, find all declared variables and match their types.
 * This labels all enums as constant mappings.
 * This will label the special type 'WorldEvent'.
 * This will label message types as structures.
 */
(() => {
    const { protocol } = PROTOCOL.nested as any
    const IGNORE_KEYS = ['options', 'nested']

    for (const key in protocol) {
        if (IGNORE_KEYS.includes(key)) continue
        const value = (protocol as any)[key]
        if (!value) continue
        const { name } = value.constructor

        // if (value.name == 'WorldEvent') {
        //     Variables.push({ type: 'world', key } as WorldEvent)
        // } else
        if (name == 'Type') {
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
        return 'Buffer'
    else if (/u?int(8|16|32|64|128)/.test(s) || s == 'double' || s == 'float')
        return 'number'
    return s
}


/**
 * Write all structures
 */
(() => {
    for (const { key } of Variables.filter(value => value.type == 'struct')) {
        const Type = PROTOCOL.lookupType(key)
        const Keys = Object.keys(Type.fields)
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
                const value = Type.fields[attr] as protobuf.Field
                const type = treat_type(convert_to_js_type(value.type)) + (value.repeated ? '[]' : '')
                return `\t${attr}${value.optional ? '?' : ''}: ${type}`
            }).join('\n')
        }).join('\n} | {\n')

        TypeScript.write(`\nexport type ${key} = {\n${TypeString}\n}\n`)

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
    const Type = PROTOCOL.lookupType('WorldEvent')
    const Keys = Object.keys(Type.fields)
    // const OneOfs = Object.values(Type.oneofs).map(v => Type[v.name])

    // console.log()
    // console.log(Object.keys(Type.oneofs))
    // console.log(Type.oneofs['eventArgs'].fieldsArray.map(v => v.name))

    // const type_declared: string[] = []
    // const declared: string[] = []
    // const { protocol } = PROTOCOL.nested as any

    // for (const key in protocol) {
    //     traverse(type_declared, declared, key, protocol)
    // }
})();

// (() => {
//     TypeScript.write(`\nexport type WorldEventMatch = \{\n${Object.entries(WorldEventMatch).map(([k, v]) => `\t${k}: ${v}`).join(',\n')}\n\}\n`)
// })();

TypeScript.close()
JavaScript.close()

