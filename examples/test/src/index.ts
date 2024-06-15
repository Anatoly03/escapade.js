import 'dotenv/config'
import EscapadeClient from '../../../dist'
// import protobuf from 'protobufjs'

const client = new EscapadeClient({ token: process.env.token } as any)
// const worlds = await client.get('worlds')

client.once('start', () => {
    if (!client.connected()) return
    client.sync()
    client.say(`[BOT] Self is ${client.self().name} and id is ${client.self().localPlayerId}!`)
})

client.raw().on('Block', args => {
    console.log(args)
})

client.on('player:join', (player, new_join) => {
    if (!new_join) return
    client.say(`[BOT] Hello, ${player.name.toUpperCase()} (${player.localPlayerId})!`)
})

client.on('chat', (player, message, isPrivate) => {
    if (message == '!help')
        client.pm(player, '[BOT] !help !ping')
    if (message == '!ping')
        client.pm(player, '[BOT] Pong!')
})

// client.on('player:join', (player, new_join) => {
//     if (!client.unsafe()) return
//     if (!player.name) return
//     client.say(`/edit ${player.name}!`)
//     console.log('Gave Edit:', player.name)
// })

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

