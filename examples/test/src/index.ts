import 'dotenv/config'
import EscapadeClient from '../../../dist'
import { Block } from '../../../dist/types/block'
// import protobuf from 'protobufjs'

const client = new EscapadeClient({ token: process.env.token } as any)

client.once('Init', ({ initArgs }) => {
    if (!client.connected()) return
    client.sync()
    client.say(`[BOT] Self is ${client.self().name} and id is ${client.self().localPlayerId}!`)
    console.log('Connected!')
    client.self().set_god(true)
})

client.onCommand('help', () => 'Commands: !help !kill')

client.onCommand('kill', () => {
    if (!client.connected()) return
    client.self().kill()
    console.log('Death')
})

// client.on('Add', add => add.addArgs)

// client.onAll(['Add'], args => console.log(args))
// client.onAll(['Add', 'OldAdd'], args => console.log(args.issuerLocalPlayerId))

// client.on('block', (p, b) => {
//     if (!client.connected()) return

//     const snake = [70, 76, 75, 74, 73, 72, 71, 0]

//     if (snake.includes(b.id) && b.id !== 0) {
//         const next_block = new Block(snake[snake.findIndex(v => b.id == v) + 1])
//         next_block.at(b).place(client)
//         // console.log(b, next_block.at(b))
//     }

//     console.log(`${p.name} placed a block ${b.id} (${b.layer}) at (${b.pos().x}, ${b.pos().y})`)
//     // client.say(`${p.name} placed a block at (${b.pos().x}, ${b.pos().y})`)
// })

// client.raw().on('Move', ({ issuerLocalPlayerId, moveArgs }) => {
//     if (!client.connected()) return
//     if (issuerLocalPlayerId === client.self().localPlayerId) return

//     client.send('Move', moveArgs)
// })

// client.on('player:join', (player, new_join) => {
//     if (!new_join) return
//     client.say(`[BOT] Hello, ${player.name?.toUpperCase() ?? '??'} (${player.localPlayerId})! Say !edit`)
// })

// client.on('chat', (player, message, isPrivate) => {
//     if (message == '!help')
//         client.pm(player, '[BOT] !help !ping !edit')
//     else if (message == '!ping')
//         client.pm(player, '[BOT] Pong!')
//     else if (message == '!edit')
//         client.say(`/edit ${player.name}`)
//     else if (message == '!blocks') {
//         if (!client.connected()) return
//         const blocks = client.world().foreground.flat().filter(b => b)
//         client.pm(player, `There are ${blocks.length} blocks in the foreground.`)
//     }
// })

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
