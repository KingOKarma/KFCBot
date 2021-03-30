# KFC Bucket Boy
#### This is the offical Open source code for KFC Bucket Boy

[Invite](https://invite.bucketbot.dev)
[Support Discord Server](https://support.bucketbot.dev)

**WORK IN PROGRESS:**
[Website](https://bucketbot.dev)

---

```
Setup
```

## With yarn
- rename `example.config.yml` to `config.yml` and add necessary data
- Same case for `example.ormconfig.json`
- run script `yarn start` or `npm start`
- Make sure your postgreSQL database is turned on!
- Enjoy cool bot

## With Docker

- Make sure Docker is installed and up to date
- Rename `example.docker-compose.yml` to `docker-compose.yml` and add necessary data
- Same case for `example.ormconfig.json` and `example.config.yml`
- Run `docker-compose build` to build the docker image. this might take a while so sit back and relax :)
- Run `docker-compose up`
- Enjoy the epic bot running in docker :)
- If you run into any errors dont hesitate to dm Melosh#0280 on discord or join the [Support server](https://support.bucketbot.dev)

---

```
Help Command
```

- `k.help` to get started!
Some Commands are able to be used within dms (they do not required a prefix)


---

```
Notes
```
- All notes are provided to help not spoonfeed
- If you want to add a new value to the `config.yml` make sure to add it to `config.ts` too
- Adding new commands is pretty easy just add a new file and copy the template, easy right?
- ESlint has been added (and set to be as strict as possible) in here for extra help to help you style your code to be better (you can press `ctrl + shift + p` then click `ESlint: Fix all auto-fixable Problems` for some quick savers)
- Alternatly you can use `eslint "**"` in the terminal to find any eslint problem 
- You can use `ctrl + k then v` to open a visual editor for and `.md` files

- (Make sure to install the "eslint" and "markdown preview enhanced" plugins on visual studio code)
---
