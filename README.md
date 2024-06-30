# Escapade.JS SDK

[NPM](https://www.npmjs.com/package/escapade.js) | [GitHub](https://github.com/Anatoly03/escapade.js) | [Documentation](https://anatoly03.github.io/escapade.js/)

#### Example

```js
import EscapadeClient from 'escapade.js'
const client = new Client({ token: 'YOUR TOKEN HERE' })

client.once('start', () => {
    client.sync()
    client.say('Connected!')
})

await client.connect('WORLD ID')
```

## Installation
```
npm i --save escapade.js
```

## Contributing

See Pull Request [#3](https://github.com/Anatoly03/escapade.js/pull/3) to contribute to the code base and Pull Request [#2](https://github.com/Anatoly03/escapade.js/pull/2) to contribute organizational/ other matters.
