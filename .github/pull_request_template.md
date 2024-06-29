
In this paragraph, briefly in up to 3 lines describe what you have added with the Pull Request, why you have added it and what the benefits of this are.

##### Example Usage <!-- IF THIS PULL REQUEST DOES NOT INTRODUCE NEW CODE BEHAVIOUR, EXTERNAL OR INTERNAL, REMOVE THIS SECTION -->

```ts
const client = EscapadeClient(process.env)

client.on('player:join', (player) => {
    player.pm('Hello, Player!')
})
```

##### Changes <!-- DESCRIBE ALL CHANGES/ MODIFICATIONS STARTING WITH ADD/ REMOVE/ CHANGE. KEEP EVERYTHING SHORT -->

- [x] Add `Client.pm()` method.
- [ ] ...

##### Review <!-- IF THIS PULL REQUEST DOES NOT INTRODUCE NEW CODE BEHAVIOUR, EXTERNAL OR INTERNAL, REMOVE THIS SECTION -->

- [ ] This Pull Request does not deprecate or break old code behaviour.
- [ ] All additions, if any, are properly documented, the type documentation has been tested and is clearly readable.
