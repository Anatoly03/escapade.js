import 'dotenv/config'
import EscapadeClient from '../../../dist'

import protobuf from 'protobufjs'

const client = new EscapadeClient({ token: process.env.token } as any)

// const { protocol } = EscapadeClient.protocol.nested as any
// const Declared: string[] = []

const worlds = await client.get('worlds')

// client.on('Chat', args => {
//     console.log(args)
// })

// function traverse(reflection: protobuf.ReflectionObject) {
//     if (!reflection) return

//     function exists(key: string) {
//         if (Declared.includes(key)) return true
//         return Declared.push(key) > 0
//     }
    
//     const rname = reflection.name || 'null'
//     const cname = reflection.constructor.name

//     Declared.push(rname)

//     if (cname == 'Type') {
//         const v: protobuf.Type = reflection as any

//         // console.log(rname, cname, v.oneofs, Object.keys(v))
//     } else if (cname == 'Object') {
//         console.log(rname, cname, Object.keys(reflection))

//         console.log(reflection)
//     }


//     // for (const key in reflection) traverse(reflection[key])
// }

// for (const key in protocol) {
//     traverse(protocol[key])
// }











// console.log(EscapadeClient.nested.protocol)

// client.get('worlds').then(console.log)

// for (const key of Object.keys(EscapadeClient.protocol)) {
//     console.log(key)
//     console.log(EscapadeClient.protocol[key])
// //     // console.log(EscapadeClient.protocol[key].encodingLength?.())
// //     console.log(EscapadeClient.protocol[key].dependencies)
// //     break
//     break
// }

// console.log(await client.get('me/worlds'))

// console.log(EscapadeClient.protocol.nested)

// for (const key in EscapadeClient.protocol.nested?.protocol) {
//     const value = EscapadeClient.protocol.nested?.protocol[key]
//     const name: string = value?.constructor.name || 'null'

//     console.log(key,
//         'enum:', value instanceof protobuf.Enum,
//         'one of:', value instanceof protobuf.OneOf,
//         'type:', value instanceof protobuf.Type,
//         'messafe:', value instanceof protobuf.Message,
//     )

    // if (name == 'Type') {
    //     value satisfies protobuf.Type

    //     for (const split in (value.oneofs || [])) {
    //         console.log('  one of ' + split)
    //         console.log(Object.keys(value.oneofs[split]))
    //     }

    //     // console.log(key, value.name, value.oneofs, value.fields)
    //     console.log(key, value.oneofs ? Object.keys(value.oneofs) : 'not one of', Object.keys(value.fields))
    // }

    // if (name == 'Object') {
    //     console.log(key, Object.keys(value))
    // }

    // if (name != 'Object' && name != 'Type') continue

    // if (value === undefined || value == null) {
    //     console.log(key, 'null')
    //     continue
    // }

    // if (value?.constructor.name !== 'Object') continue

    // if (key === 'WorldInfo') {
    //     console.log(value)
    //     // console.log(Object.keys(value))
    // }

    // console.log(key, value?.constructor.name)

    // for (const field in Object.keys(value)) {
    //     console.log('\t', field, value[field])
    // }

    // console.log(key, value.nestedArray, value?.constructor.name, Array.isArray(key), Object.keys(value), value)
// }

// const M = EscapadeClient.protocol.lookupType('JoinWorld')

// for (const key in M.fields) {
//     console.log(key, M.fields[key].type)
// }

console.log()
// console.log(EscapadeClient.protocol['JoinWorld'])

// client.on('*', console.log)


client.on('Chat', args => {
    console.log(args)
    if (args.chatArgs.message == '!ping') {
        client.send('Chat', {
            message: 'Pong!'
        })
    }
})


// client.on('*', console.log)

// client.connect(worlds[0].id)
await client.connect('k7HdYhzHzLML')
// await client.send('Sync')

// await new Promise(res => setTimeout(res, 200))
// client.send('Chat', {
//     message: '[BOT] Hello, World!'
// })


// the following is loading a string.
// in a real application, it'd be more like protobuf.load("traverse-types.proto", ...)

