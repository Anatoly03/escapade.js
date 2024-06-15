import 'dotenv/config'
import EscapadeClient from '../../../dist'
// import protobuf from 'protobufjs'

const client = new EscapadeClient({ token: process.env.token } as any)
// const worlds = await client.get('worlds')

client.raw().once('Init', args => {
    client.send('Sync')
})

client.on('player:join', (player, new_join) => {
    if (!new_join) return
    client.send('Chat', {
        message: `[BOT] Hello, ${player.name?.toUpperCase()}!`
    })
})

// console.log(worlds)
// client.raw().on('*', console.log)

// client.on('Chat', args => {
//     console.log(args)
// })

// client.on('Chat', args => {
//     console.log(args)
//     if (args.chatArgs.message == '!ping') {
//         client.send('Chat', {
//             message: 'Pong!'
//         })
//     }
// })

await client.connect('k7HdYhzHzLML')

// await new Promise(res => setTimeout(res, 200))
// client.send('Chat', {
//     message: '[BOT] Hello, World!'
// })


// the following is loading a string.
// in a real application, it'd be more like protobuf.load("traverse-types.proto", ...)

