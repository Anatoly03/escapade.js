
In this paragraph, briefly in up to 3 lines describe what you have added with the Pull Request, why you have added it and what the benefits of this are.

##### Example Usage <!-- IF THIS PULL REQUEST DOES NOT INTRODUCE NEW CODE BEHAVIOUR, EXTERNAL OR INTERNAL, REMOVE THIS SECTION -->

```diff
  const client = EscapadeClient(process.env)
  
  client.on('player:join', (player) => {
-     client.say(`/pm ${player.name} Hello, Player!`)
+     player.pm('Hello, Player!')
  })
```

##### Changes <!-- DESCRIBE ALL CHANGES/ MODIFICATIONS STARTING WITH ADD/ REMOVE/ CHANGE. KEEP EVERYTHING SHORT -->

- [x] Add `Client.pm()` method.
- [ ] ...

##### Review <!-- IF THIS PULL REQUEST DOES NOT INTRODUCE NEW CODE BEHAVIOUR, EXTERNAL OR INTERNAL, REMOVE THIS SECTION -->

- [ ] This Pull Request does not break old code behaviour. If a deletion is planned, the code segment was planned as deprecated.
- [ ] All additions, if any, are properly documented, the type documentation has been tested and is clearly readable.
