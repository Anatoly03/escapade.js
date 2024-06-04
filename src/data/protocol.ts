import fs from 'fs'
import protobuf from 'protobufjs'

export const PROTOCOL = protobuf.loadSync(import.meta.dirname + '/protocol.proto')
export const ProtocolEvents: { [keys: string]: { [fields: string]: string } } = {}
const Enums: any = {}

// <Util>

function convert_to_js_type(s: string) {
    if (s == 'bool')
        return 'boolean'
    else if (s == 'bytes')
        return 'Buffer'
    else if (/u?int(8|16|32|64|128)/.test(s) || s == 'double' || s == 'float')
        return 'number'
    return s
}

// </Util>

// <Generate Protocol Events>

for (const key in PROTOCOL.nested?.protocol) {
    const value = (PROTOCOL.nested?.protocol as any)[key] as protobuf.Type

    if (value?.constructor.name == 'Type') {
        ProtocolEvents[key] = {}

        for (const field in value.fields) {
            ProtocolEvents[key][field] = convert_to_js_type(value.fields[field].type)
        }
    }
}

// </Generate Protocol Events>

// <Generate Protocol Enums>

for (const key in PROTOCOL.nested?.protocol) {
    const value = (PROTOCOL.nested?.protocol as any)[key] as any
    const ignore = ['options', 'nested']

    if (value?.constructor.name == 'Object') {
        if (ignore.includes(key)) continue

        Enums[key] = {}

        for (const field in value) {
            if (Number.isInteger(parseInt(field))) continue
            console.log(field, value[field])
            Enums[key][field] = value[field]
        }
    }
}

// </Generate Protocol Enums>

function protocol_events(): string {
    return '{\n' + Object
        .keys(ProtocolEvents)
        .map(event => `\t${event}: ${event}`)
        .join('\n') + '\n}'
}

function message_types(): string {
    return Object
        .keys(ProtocolEvents)
        .map(event => `export type ${event} = {\n${Object
            .keys(ProtocolEvents[event])
            .map(field => `\t${field}: ${ProtocolEvents[event][field]},`)
            .join('\n')}\n}`)
        .join('\n\n')
}

function enums(): string {
    return Object
        .keys(Enums)
        .map(en => `export enum ${en} {\n${Object
            .keys(Enums[en])
            .map(field => `\t${field} = ${Enums[en][field]},`)
            .join('\n')}\n}`)
        .join('\n\n') 
}

fs.writeFileSync(import.meta.dirname + '/protocol.d.ts', `
import protobuf from 'protobufjs'
export declare const PROTOCOL: protobuf.Root

${enums()}

${message_types()}

export declare const ProtocolEvents: ${protocol_events()}
`)
