---
title: Channels and Regions
---

import CopyCommand from '@site/src/components/CopyCommand';
import RegionMap from '@site/src/components/RegionMap';

# Channels and Regions

MeshCore channels are used to separate different kinds of conversations on the mesh. Keep public traffic simple and predictable so new users can find help, test their node, and understand which channel is appropriate for their message.

## Channel Types

| Type | How it works | Typical use |
| --- | --- | --- |
| Public | The default shared channel available to MeshCore users. | General chat, first contact, and simple coordination. |
| Hashtag | A named channel with a key generated from the channel name. | Regional chat, topic channels, testing, and repeatable community channels. |
| Private | A channel using a private key shared only with trusted participants. | Small teams, event operations, or conversations that should not be readable by the broader mesh. |

Public and hashtag channels should be treated as public. They may be heard by repeaters, observers, and other users, and they may appear in internet-connected tools if observers are present.

Private channels are only private if the key stays private. Do not reuse a private channel name or key for unrelated groups.

## Regions

Regions help restrict propagation of local data to the wider mesh where it is less useful. Use the smallest scope that makes sense so local traffic stays local where supported. 

You can use the map below for guidance on which regions to include. You can also try the [Eastmesh Region Tool](https://regions.eastmesh.au).
Please note this map is only intended as a guide and not as a prescriptive resource. If you're close to a border you may choose to include multiple regions depending on geography or repeater links.

<RegionMap geojson="/geo/All-NSW-Regions.geojson" />

It is bad practice to scope the Public channel to a region as this can lead to one-sided conversations.

Use lower-case components separated by hyphens.

Format:

```text
<country>-<state>-<iata>
```

Example:

```text
au-nsw-syd
```

In this format:

| Part | Example | Meaning |
| --- | --- | --- |
| Country | `au` | Australia. |
| State | `nsw` | New South Wales. |
| IATA | `syd` | The nearest practical airport or regional IATA-style code. Otherwise a community agreed 3rd tier name where IATA isnt practical|

Examples:

| Region | Suggested use | CLI command | Who |
| --- | --- | --- | --- |
| `au` | Australia-wide scoped traffic. | <CopyCommand command="region put au" /><br /><CopyCommand command="region allowf au" /> | Everyone |
| `au-nsw` | NSW-wide scoped traffic. | <CopyCommand command="region put au-nsw" /><br /><CopyCommand command="region allowf au-nsw" /> | Everyone |
| `au-nsw-syd` | Sydney metro scoped traffic. | <CopyCommand command="region put au-nsw-syd" /><br /><CopyCommand command="region allowf au-nsw-syd" /> | Sydney |
| `au-nsw-gos` | Central Coast scoped traffic. | <CopyCommand command="region put au-nsw-gos" /><br /><CopyCommand command="region allowf au-nsw-gos" /> | Gosford |
| `au-nsw-ntl` | Newcastle and Hunter scoped traffic. | <CopyCommand command="region put au-nsw-ntl" /><br /><CopyCommand command="region allowf au-nsw-ntl" /> | Newcastle |
| `au-nsw-wol` | Illawarra and Wollongong scoped traffic. | <CopyCommand command="region put au-nsw-wol" /><br /><CopyCommand command="region allowf au-nsw-wol" /> | Wollongong |
| `au-nsw-bhs` | Bathurst and Western NSW scoped traffic. | <CopyCommand command="region put au-nsw-bhs" /><br /><CopyCommand command="region allowf au-nsw-bhs" /> | Bathurst |
| Save | Save the regions. | <CopyCommand command="region save" /> | Everyone |

A Sydney-specific message belongs in a Sydney channel scoped to `au-nsw-syd`; a state-wide message belongs in an NSW channel scoped to `au-nsw`; general first contact can stay in Public.

All NSW repeaters should generally allow `au` and `au-nsw`. Only add the IATA-level region that matches the repeater location. For example, Sydney repeaters should allow `au-nsw-syd`, Central Coast repeaters should allow `au-nsw-gos`, Newcastle and Hunter repeaters should allow `au-nsw-ntl`, and Illawarra repeaters should allow `au-nsw-wol`.

For communities that border multiple states (e.g. Albury/Wodonga) they may be using an area specific 2nd tier like `au-hume`.

For a deeper explanation of MeshCore regions, see Zindello Industries' article [MeshCore Regions: what they are, how they work, and why they matter](https://zindello.com.au/meshcore-regions-what-they-are-how-they-work-and-why-they-matter/).

## Current Channels

| Key | Suggested region scope | Purpose |
| --- | --- | --- |
| Public | None | General chat for all mesh users. |
| `#test` | All users | Connection testing. Bots may auto-reply to `test`, `ping`, or `path` where available. |
| `#emergency` | All users | Emergency communications only. |
| `#sydney` | `au-nsw-syd` | Sydney metro conversation and coordination. |
| `#nsw` | `au-nsw` | State-wide coordination. |
| `#macarthur` | `au-nsw-syd` | Macarthur conversation and coordination. |
| `#nepean` | `au-nsw-syd` | Nepean conversation and coordination. |
| `#centralcoast` | `au-nsw-gos` | Central Coast conversation and coordination. |
| `#illawarra` | `au-nsw-wol` | Illawarra and Wollongong conversation and coordination. |
| `#newcastle` | `au-nsw-ntl` | Newcastle and Hunter conversation and coordination. |

Check with the NSW Mesh community before creating a new long-lived regional or operational channel.
