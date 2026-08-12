---
title: Bots
---

# MeshCore Bots

A bot is an automated service usually attached to a companion node that listens and replies automatically to specific commands or keywords, things like `help`, `ping`, `test`, `path`, or `wx` for weather. They let you get a reply on the mesh without relying on another person on the other end to reply.

Bots are great for quick, basic diagnostics while out and about, confirming a path, checking a signal strength, or a simple ack test, without needing to dig around complex analyser websites. For deeper analysis, a proper analyser such as [CoreScope](https://corescope.nswmesh.au/) is far more useful than a bot's basic text reply.

## Bot Directory

TODO: Dig to find all available info on current bots in use
<div className="nswmesh-bots-table">

| Region | Bot | Channels | Scopes | Commands |
| --- | --- | --- | --- | --- |
| WOL | WolBot | `#wolbot` | `au` `au-nsw` `au-nsw-wol` | `multitest` `path` `ping` `stats` `test` `help` |
| SYD | MMTV - Bot | `#test` | `Unscoped` | `multitest` `path` `ping` `stats` `test` `hello` `joke` `dadjoke` `wx` `help` `trace` |
| SYD | RoloJnr | `#test` `#rolojnr` | `au` `au-nsw` `au-nsw-wol` | `multitest` `path` `ping` `stats` `test` |

</div>

### Using Bots

- Use the smallest scope that answers your question, usually a local IATA-scoped test tells you what you need without flooding any further than it has to.
- Try to query individual bots inside their own channel eg. `#wolbot` when querying larger scopes eg. `au` or `au-nsw` to avoid several bots flooding at once.
- Avoid sending queries in quick succession. Give the mesh time to respond and leave a gap for others before querying again.
- Be courteous. If the mesh looks busy or someone else is already testing a lot, it may not be a good time to send too many queries!

## Bot Configuration
<div className="nswmesh-callout">
Unlike observers, more bots can negatively impact the network if not considered carefully. Ask the community whether another bot is of genuine use compared to what's already locally available.
</div>

Several community-maintained bot projects exist if you want to run your own. These are just a few. <br/>
Have a peek at each and find which one suits your needs best:

| Bot | Language | Connection | MQTT |
| --- | --- | --- | --- |
| [agessaman/meshcore-bot](https://github.com/agessaman/meshcore-bot) | Python | USB, BLE, TCP | Yes  |
| [Cyclenerd/meshcore-bot](https://github.com/Cyclenerd/meshcore-bot) | Node.js | USB | No |
| [do6uk/meshcore_bot](https://github.com/do6uk/meshcore_bot) | Python | USB, TCP | No |
| [jkingsman/Remote-Terminal-for-MeshCore](https://github.com/jkingsman/Remote-Terminal-for-MeshCore) | Python | USB, BLE, TCP | Yes |

A common setup is a small SBC such as a Raspberry Pi, with a companion radio attached over USB, running one of the above. Configuration varies heavily per bot, so follow your repo's Read Me, and check in on Discord if you're unsure about something. Default behaviour is usually not ideal, so try to bring it in line with the best practices below, or look for software that gives you more configuration control if the defaults won't budge.

If your bot also behaves as an observer, check the [Observers](./observers) page as well.

### Best Practices
Best practices help keep bots lightweight. Followed well, they help ensure bots can exist while without hindering others' use of the network.

- A bot, or any other automated script, should avoid sending unprompted automated messages/data, unless there's a genuine "greater good" need to do so (eg. #alerts bot).
- A bot shouldn't send a message in a conversational channel such as Public or `#sydney`.
- Bots should be available in their own channel eg. `#wolbot`. Avoid adding them to `#test` if there are already other bots in your region there.
- A bot should mirror its scope to the query it's responding to, OR only reply and scope to the local IATA scope.
- A bot should ideally never respond to, or send, an unscoped message, regardless of the bot's function.

Personal and hobby bots can sit on the mesh with fairly insignificant impact, as long as they scope as described above, or are only available via DMs and aren't sending much data. If your testing is likely to be network-heavy or risky, such as when coding a bot from scratch, run it on a separate frequency or preset so it's disconnected from the network but still reachable for your own testing.

<div className="nswmesh-callout">
Bots must be actively maintained. Please check in on and test how it's behaving often to avoid unintended behaviour such as corrupt data, response loops, etc.
</div>
