import fs from 'fs'
import protobuf from 'protobufjs'

export const PROTOCOL = protobuf.loadSync(import.meta.dirname + '/protocol.proto')
export const ProtocolEvents: { [keys: string]: { [fields: string]: string } } = {}

const Header = `\n/*
 * The following file is generated from \`protocol.ts\`.
 */\n`

const TypeScript = fs.createWriteStream(import.meta.dirname + '/protocol.g.d.ts', { autoClose: true })
const JavaScript = fs.createWriteStream(import.meta.dirname + '/protocol.g.js', { autoClose: true })

TypeScript.write(Header)
JavaScript.write(Header)

function traverse(declared: string[], key: string, protocol: protobuf.ReflectionObject) {
    if (!protocol) return

    function exists(key: string) {
        if (declared.includes(key)) return true
        declared.push(key)
        return false
    }

    function convert_to_js_type(s: string) {
        if (s == 'bool')
            return 'boolean'
        else if (s == 'bytes')
            return 'Buffer'
        else if (/u?int(8|16|32|64|128)/.test(s) || s == 'double' || s == 'float')
            return 'number'
        return s
    }

    const IGNORE_KEYS = ['options', 'nested']
    if (exists(key)) return
    if (IGNORE_KEYS.includes(key)) return

    const value = (protocol as any)[key]
    if (!value) return

    const { name } = value.constructor

    if (name == 'Type') {
        const attributes: [string, string][] = []
        const oneofs: string[] = value.oneofs?.eventArgs.oneof || []
        const oneof_types: string[] = []
        const generic = 'MessageType'

        for (const attr of Object.keys(value.fields)) {
            if (oneofs.includes(attr)) {
                const of_type = value.oneofs.eventArgs.fieldsArray.find((e: any) => e.name == attr).type
                // console.log(attr, of_type)
                oneof_types.push(of_type)
                attributes.push([attr, `${generic} extends ${of_type} ? ${of_type} : never`])
                continue
            } else {
                const ts_type = convert_to_js_type(value.fields[attr].type) + (value.fields[attr].repeated ? '[]' : '')
                attributes.push([attr, ts_type])
            }

            // console.log(key, attr, , , value.fields[attr].required ? 'required' : '-', value.fields[attr].map ? 'is map' : 'is not map')
        }

        TypeScript.write(`\nexport type ${key}${value.oneofs ? `<${generic} extends ${oneof_types.join(' | ')}>` : ''} = {\n${attributes.map((([k, v]) => `\t${k}: ${v}`)).join('\n')}\n}\n`)
    } else if (name == 'Object') {
        const enumerated: string[] = []

        // console.log(key, Object.keys(value).map(k => [k, ]))

        for (const enum_member of Object.keys(value)) {
            if (value[enum_member] == undefined) continue
            enumerated.push(`\t${enum_member} = ${value[enum_member]}`)
        }

        TypeScript.write(`\nexport declare enum ${key} {\n${enumerated.join(',\n')}\n}\n`)
        JavaScript.write(`\nexport var ${key} = ((o) => {\n${Object
            .keys(value)
            .filter(k => value[k] != undefined)
            .map(k => `\to["${k}"] = ${value[k]}`)
            .join('\n')}\n\treturn Object.freeze(o)\n})({})\n`)
    }
}

(() => {
    const declared: string[] = []
    const { protocol } = PROTOCOL.nested as any

    for (const key in protocol) {
        traverse(declared, key, protocol)
    }
})()

TypeScript.close()
JavaScript.close()

