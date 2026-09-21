---
title: Channels
---

# Channels

MeshCore channels are used to separate different kinds of conversations on the mesh. Keep public traffic simple and predictable so new users can find help, test their node, and understand which channel is appropriate for their message.

## Types

| Type | How it works | Typical use |
| --- | --- | --- |
| Public | The default shared channel available to MeshCore users. | General chat, first contact, and simple coordination. |
| Hashtag | A named channel with a key generated from the channel name. | Regional chat, topic channels, testing, and community channels. |
| Private | A channel using a private key shared only with trusted participants. | Small teams, event operations, or conversations that should not be readable by the broader mesh. |

The Public channel and hashtag channels should be treated as public. They may be heard by repeaters, other users and observers (nodes that publish to the internet). <br/>
Private channels are only private if the key stays private. Do not reuse a private channel name or key for unrelated groups.

## Generic Channels

Useful channels used mesh-wide.

| Key | Suggested region scope | Purpose |
| --- | --- | --- |
| Public | None (Unscoped) | General chat for all mesh users. |
| `#test` | `au-nsw` or IATA | Connection testing. Bots may auto-reply to `test`, `ping`, or `path`. |
| `#emergency` | None | Emergency communications only. |
| `#alert` | None | Automatic situation alerts such as fires. |

## Regional Channels

Scoped to a particular region. These are also listed in each region's popup on the [interactive region map](./regions).<br/>
*Note: Check with the NSW Mesh community before creating a new long-lived regional or operational channel.*

| Key | Suggested region scope | Purpose |
| --- | --- | --- |
| `#nsw` | `au-nsw` | State-wide coordination. |
| `#act` | `au-act` | State-wide coordination. |
| `#midnorthcoast` | `TBC` | Mid-North Coast conversation and coordination. |
| `#newcastle` | `au-nsw-ntl` | Newcastle & Hunter conversation and coordination. |
| `#sydney` | `au-nsw-syd` | Sydney metro conversation and coordination. |
| `#centralcoast` | `au-nsw-syd` | Central Coast conversation and coordination. |
| `#macarthur` | `au-nsw-syd` | Macarthur conversation and coordination. |
| `#nepean` | `au-nsw-syd` | Nepean conversation and coordination. |
| `#bathurst` | `au-nsw-bhs` | Bathurst & Central West conversation and coordination. |
| `#illawarra` | `au-nsw-wol` | Illawarra & Wollongong conversation and coordination. |
| `#nowra` | `au-nsw-noa` | Nowra and Shoalhaven conversation and coordination. |
| `#riverina` | `au-hume` | Wagga Wagga & Riverina conversation and coordination. |
| `#canberra` | `au-act`| Canberra conversation and coordination. |
| `#farsouthcoast` | `TBC` | Far South Coast conversation and coordination. |
| `#hume` | `au-hume` | Albury & Wodonga conversation and coordination. |
