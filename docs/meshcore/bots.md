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
| WOL | WolBot | `#wolbot` | `au` `au-nsw` `au-nsw-wol` | `multitest` `path` `ping` `stats` `test` |

</div>

### Using Bots

- Use the smallest scope that answers your question, usually a local IATA-scoped test tells you what you need without flooding any further than it has to.
- Avoid sending queries in quick succession. Give the mesh time to respond and leave a gap for others before querying again.
- Be courteous. If the mesh looks busy or someone else is already testing a lot, it probably isn't a good time to send many queries!

## Bot Configuration
<div className="nswmesh-callout">
Unlike observers, more bots can negatively impact the network if not considered carefully. Ask the community whether another bot is of genuine use compared to what's already locally available.
</div>

TODO: Include bot repo options, with some sort of table of what they can and can't do?

### Best Practices
Best practices help keep bots lightweight. Followed well, they help ensure bots can exist while without hindering others' use of the network.

- A bot, or any other automated script, should avoid sending unprompted automated messages/data, unless there's a genuine "greater good" need to do so (eg. #alerts bot). Outside of adverts, mesh traffic should aim to be manually queried by a human.
- A bot shouldn't send a message in a conversational channel such as Public or `#sydney`. Those channels are for people, not automated replies!
- A bot should ideally be the sole responder to a query, avoiding multiple bots racing to respond to a query and creating collisions. This can be achieved scoping bots two distinct ways:
TODO: Also make mention of querying bots by @mention, which could achieve this as well?
  - **Locally scoped** bots can be made available in `#test`, which increases discoverability, but restricts them to responding only within their local IATA scope (e.g. `au-nsw-syd`).
  - **Cross-regionally scoped** bots can respond to broader scopes such as `au` or `au-nsw`, but need their own dedicated channel instead of `#test`, trading discoverability for wider reach.
- A bot should ideally never respond to, or send, an unscoped message, regardless of the bot's function.

Personal and hobby bots can sit on the mesh with fairly insignificant impact, as long as they're in their own channel and are either scoped only to the local IATA scope, or only ever available via DMs and aren't sending much data. If your testing is likely to be network-heavy or risky, such as when coding a bot from scratch, run it on a separate frequency or preset so it's disconnected from the network but still reachable for your own testing.

<div className="nswmesh-callout">
Bots must be actively maintained. Please check in on and test how it's behaving often. The mesh has seen bots spam messages, get stuck in response loops, and send garbled and corrupted data.
</div>
