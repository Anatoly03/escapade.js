import fs from 'fs'
import ProtoBuf from 'protocol-buffers'

const raw_protocol = fs.readFileSync(import.meta.dirname + '/protocol.proto')
export const PROTOCOL = ProtoBuf(raw_protocol)

const PROTOCOL_TYPE = 'export declare const PROTOCOL: {\n'
    + Object.keys(PROTOCOL).map(k => `\t["${k}"]: any`).join('\n')
    + '\n}'

fs.writeFileSync(import.meta.dirname + '/protocol.d.ts', PROTOCOL_TYPE)
