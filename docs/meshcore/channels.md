---
title: Channels and Regions
---

import CopyCommand from '@site/src/components/CopyCommand';
import RegionMap from '@site/src/components/RegionMap';

# Channels and Regions

## Regions

Regions help restrict propagation of local data to the wider mesh where it is less useful. Use the smallest scope that makes sense so local traffic stays local where supported. Regions help keep airtime down, contributing to a better functioning mesh for all.

You can click on regions in the map below for suggestions on which regions to include on your repeater or companion. If you're close to a border you may choose to include multiple regions depending on geography or repeater links.
You can also try the [Eastmesh Region Tool](https://regions.eastmesh.au).

<RegionMap geojson="/geo/All-NSW-Regions-Mini.geojson" /> <br/>
*Note: this map is only intended as a guide and not as a prescriptive resource. It is kept up-to-date as best as possible but actual local configurations may differ.*

### Region Format

The region format uses lower-case components separated by hyphens: `<country>-<state>-<iata>`, for example `au-nsw-syd`.

| Part | Example | Meaning |
| --- | --- | --- |
| Country | `au` | Australia. |
| State | `nsw` | New South Wales. |
| IATA | `syd` | The nearest practical airport or regional IATA-style code. <br/> Otherwise a community agreed 3rd tier name where IATA isnt practical|

Examples: <br/>
*Note: You can also copy these CLI commands straight from a region's popup on the map above.*

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

A Sydney-specific message belongs in a Sydney channel scoped to `au-nsw-syd`; a state-wide message belongs in an NSW channel scoped to `au-nsw`; general first contact can stay in Public. See [Channels](#channels) below for how these scopes map to specific channels.

For communities that border multiple states (e.g. Albury/Wodonga) they may be using an area specific 2nd tier like `au-hume`.

<div className="nswmesh-callout">

For a deeper explanation of MeshCore regions, see Zindello Industries' article.<br/>
[MeshCore Regions: what they are, how they work, and why they matter.](https://zindello.com.au/meshcore-regions-what-they-are-how-they-work-and-why-they-matter/)
</div>

### Repeaters

Configuring regions tells a repeater what it should repeat. Only the regions it has been configured to allow will be forwarded on - everything else is dropped. This is what creates the regional traffic boundaries mentioned above.

All NSW repeaters should generally allow `au` and `au-nsw`. Only add the IATA-level region that matches the repeater location. For example, Sydney repeaters should allow `au-nsw-syd`, Central Coast repeaters should allow `au-nsw-gos`, Newcastle and Hunter repeaters should allow `au-nsw-ntl`, and Illawarra repeaters should allow `au-nsw-wol`.

Take extra care when adding additional regions or operating near a border, particularly with repeaters that have wide coverage into neighbouring regions. Over-allowing can undo the boundaries that regions are meant to create.

### Companions

Companions should generally add the same regions as their local repeaters. You can do this via the app UI. 
If you have zero-hop repeaters nearby, you can use the "Discover Regions" function to find what regions the repeaters around are configured to repeat.

Adding regions isn't required to receive traffic scoped to it, but it is required to send it.

## Channels

MeshCore channels are used to separate different kinds of conversations on the mesh. Keep public traffic simple and predictable so new users can find help, test their node, and understand which channel is appropriate for their message.

### Types

| Type | How it works | Typical use |
| --- | --- | --- |
| Public | The default shared channel available to MeshCore users. | General chat, first contact, and simple coordination. |
| Hashtag | A named channel with a key generated from the channel name. | Regional chat, topic channels, testing, and repeatable community channels. |
| Private | A channel using a private key shared only with trusted participants. | Small teams, event operations, or conversations that should not be readable by the broader mesh. |

The Public channel and hashtag channels should be treated as public. They may be heard by repeaters, other users and observers (nodes that publish to the internet). <br/>
Private channels are only private if the key stays private. Do not reuse a private channel name or key for unrelated groups.

### Generic Channels

Useful channels used mesh-wide.

| Key | Suggested region scope | Purpose |
| --- | --- | --- |
| Public | None | General chat for all mesh users. |
| `#test` | `au-nsw` or IATA | Connection testing. Bots may auto-reply to `test`, `ping`, or `path`. |
| `#emergency` | None | Emergency communications only. |
| `#alerts` | None | Automatic situation alerts such as fires. |

### Regional Channels

Scoped to a particular region. These are also listed in each region's popup on the interactive map above.<br/>
*Note: Check with the NSW Mesh community before creating a new long-lived regional or operational channel.*

| Key | Suggested region scope | Purpose |
| --- | --- | --- |
| `#nsw` | `au-nsw` | State-wide coordination. |
| `#sydney` | `au-nsw-syd` | Sydney metro conversation and coordination. |
| `#macarthur` | `au-nsw-syd` | Macarthur conversation and coordination. |
| `#nepean` | `au-nsw-syd` | Nepean conversation and coordination. |
| `#centralcoast` | `au-nsw-gos` | Central Coast conversation and coordination. |
| `#illawarra` | `au-nsw-wol` | Illawarra and Wollongong conversation and coordination. |
| `#newcastle` | `au-nsw-ntl` | Newcastle and Hunter conversation and coordination. |
| `#midnorthcoast` | `TBC` | Mid-North Coast conversation and coordination. |
