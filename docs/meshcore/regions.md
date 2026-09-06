---
title: Regions
---

import CopyCommand from '@site/src/components/CopyCommand';
import RegionMap from '@site/src/components/RegionMap';

# Regions

In MeshCore, the term "region" often refers to two distinct but related concepts:

1. **Geographic Regions:** The physical, real-world areas defined on a map, represented by an IATA code. This is commonly referred to as an "IATA region" or simply "IATA", and is the same thing you'll find representing regions on tools such as MeshMapper, CoreScope, etc. (e.g. SYD, WOL).
2. **Region Scopes:** The actual "region" tags applied to packets and configured on repeaters (e.g. `au-nsw`, `au-nsw-syd`) that determine how far that packet is repeated. There are typically 3 layers of region scopes, being the country scope (`au`), the state scope (`au-nsw`) and the IATA scope (`au-nsw-syd`).

### Reducing Congestion

Region scopes act as whitelist filters, creating a containment system for mesh traffic. Configuring a repeater with specific region scopes gives the repeater permission to forward traffic tagged with those scopes. In practice this "scopes" traffic down to an intentional area, keeping local traffic local and only reaching further into the mesh when is relevant. Note that this configuration does not affect a repeater's coverage or routing.

For example, configuring a Wollongong repeater with `au`, `au-nsw`, and `au-nsw-wol` ensures it only repeats traffic relevant to those scopes. If a local conversation is happening up in Sydney using the `au-nsw-syd` scope, the Wollongong repeater will drop those packets. This contains the Sydney traffic within its own geographic region, preventing it from being needlessly repeated down south. The same happens at a state level, forwarding on `au-nsw` messages while ignoring other state scopes like `au-vic`.

A Sydney-specific message belongs in a Sydney channel scoped to `au-nsw-syd`; a state-wide message belongs in an NSW channel scoped to `au-nsw`; general first contact can stay unscoped in Public. See [Channels](./channels) for how these scopes map to specific channels.

The main purpose of doing this is to preserve airtime. RF airtime is a finite resource across the entire shared mesh with only so much to go around. Higher airtime utilisation also reduces network reliability as the occurrence of packet collisions (where multiple packets are in-flight simultaneously) increases. Region scoping traffic helps contain traffic where it makes sense to, freeing up that airtime for the rest of the mesh. The aim is not to reduce people's usage or the spread of the network, but rather optimising shared network resources where possible which contributes to a better functioning mesh for all.
<div className="nswmesh-callout">

For a deeper explanation of MeshCore regions, see Zindello Industries' article.<br/>
[MeshCore Regions: what they are, how they work, and why they matter.](https://zindello.com.au/meshcore-regions-what-they-are-how-they-work-and-why-they-matter/)
</div>

## Region Map

You can click on the geographic regions in the map below for suggestions on which region scopes to include on your repeater or companion based on its location. You can also try the [Eastmesh Region Tool](https://regions.eastmesh.au).
If you're close to a border, you may choose to include extra scopes depending on local geography or repeater links as is discussed later in the [Repeaters](./repeaters) section.

<RegionMap geojson="/geo/All-NSW-Regions-Mini.geojson" /> <br/>
*Note: this map is only intended as a guide and not as a prescriptive resource. It is kept up-to-date as best as possible but actual local configurations may differ.*

### Scope Format

The region scope format uses lower-case components separated by hyphens. <br/>
Format: `<country>-<state>-<iata>`. Example: `au-nsw-syd`.

| Part | Example | Meaning |
| --- | --- | --- |
| Country | `au` | Australia. |
| State | `nsw` | New South Wales. |
| IATA | `syd` | Typically the nearest major airport IATA code. |

For communities that border multiple states (e.g. Albury/Wodonga) they may be using an area specific 2nd tier like `au-hume`.

## Repeaters

As mentioned above, configuring region scopes tells a repeater what it should repeat. Only the region scopes it has been configured to explicitly allow will be forwarded on; everything else is dropped by default.

All NSW (and ACT) repeaters should allow `au` and `au-nsw`. Generally you should only add the IATA-level region scope that matches the repeater's geographic location. For example, Sydney repeaters should allow `au-nsw-syd`, Newcastle and Hunter repeaters should allow `au-nsw-ntl`, etc. as is suggested in the region map.

While the suggested scopes work for the vast majority of situations, what region scopes you should allow your repeater to repeat is not concrete. There is room for a bit of fuzziness in situations such as when a repeater provides an irreplaceable local link (like if two WOL repeaters rely on a third SYD repeater in-between to connect with each other) or provides significant ground coverage inside a neighbouring region that is not catered to by local region repeaters. However, extra care should be taken when adding scopes beyond what is generally recommended for any given geographic region, particularly with high-profile repeaters that have wide coverage into its local region. This is because over-allowing scopes can dissolve the boundaries that regions are designed to create (such as if a WOL repeater has wide WOL region coverage while also allowing SYD traffic, the border between the two regions is partially dissolved). There is a balance between providing maximum coverage while limiting cross-regional traffic pollution that needs to be assessed in each instance.

An example configuration would be as follows:<br/>
*Note: You can copy CLI commands for a region straight from a region's popup on the map above.*
| Region | Suggested use | CLI command | Who |
| --- | --- | --- | --- |
| `au` | Australia-wide scoped traffic. | <CopyCommand command="region put au" /><br /><CopyCommand command="region allowf au" /> | Everyone |
| `au-nsw` | NSW-wide scoped traffic. | <CopyCommand command="region put au-nsw" /><br /><CopyCommand command="region allowf au-nsw" /> | Everyone |
| `au-nsw-syd` | Sydney scoped traffic. | <CopyCommand command="region put au-nsw-syd" /><br /><CopyCommand command="region allowf au-nsw-syd" /> | Sydney |
| Save | Save the regions. | <CopyCommand command="region save" /> | Everyone |

## Companions

Companions should generally add the same region scopes as their local repeaters following the example above.
When out and about, if you have repeaters nearby (that you can hear directly) you can use the "Discover Regions" function inside the app to find what regions local repeaters are configured to allow.

Note that adding scopes to your companion only creates a list for you to choose from when choosing what to scope your messages to in any given channel. Adding regions to your companion isn't required to receive scoped traffic, if your companion hears traffic of any scope you will receive it.

When chatting on the mesh, you should try to use the smallest scope that makes sense for a channel. For example if you're chatting in the #sydney channel, there is no reason that traffic needs to reach the rest of the NSW mesh, so you should scope to `au-nsw-syd`. This is particularly relevant if you intend to use bots, which is talked more about in the [Bots](./bots) page.