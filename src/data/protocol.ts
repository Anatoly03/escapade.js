import fs from 'fs'
import protobuf from 'protobufjs'

export const PROTOCOL = protobuf.loadSync(import.meta.dirname + '/protocol.proto')

// const PROTOCOL_TYPE = 'export declare const PROTOCOL: {\n'
//     + Object.keys(PROTOCOL).map(k => `\t["${k}"]: any`).join('\n')
//     + '\n}'

// fs.writeFileSync(import.meta.dirname + '/protocol.d.ts', PROTOCOL_TYPE)
