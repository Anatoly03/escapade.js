# Escapade.JS SDK

[NPM](https://www.npmjs.com/package/escapade.js) | [GitHub](https://github.com/Anatoly03/escapade.js)

#### Example

```js
import EscapadeClient from 'pixelwalker.js'
const client = new Client({ token: 'YOUR TOKEN HERE' })

client.raw().once('Init', () => {
    client.send('Sync')
})

await client.connect('WORLD ID')
```

## Installation
```
npm i --save escapade.js
```