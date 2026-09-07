---
title: Regions
---

import CopyCommand from '@site/src/components/CopyCommand';
import RegionMap from '@site/src/components/RegionMap';

# Regions

On a shared mesh network, radio airtime is a finite resource. If every message were broadcast across every repeater, the network would quickly become congested and unreliable. 

In MeshCore, regions help solve part of this problem by defining boundaries for how some traffic travels. They allow the mesh to contain local traffic within a specific geographical area where it makes sense to, keeping the network quieter while still allowing state-wide or nation-wide messages through as normal.

To understand how regions work in practice, it helps to distinguish between the two concepts that the word "region" refers to:

* **Geographic Region:** The real-world area on a map where a node lives. In NSW, these are identified using standard airport codes (IATA), such as `SYD` for Sydney or `WOL` for Wollongong. You'll also see online tools like MeshMapper and CoreScope use IATAs to label regions.
* **Region Scope:** The actual tag attached to a packet (e.g., `au-nsw-syd`) that dictates which repeaters are permitted to retransmit it, and in turn how far it traverses the network.

### Scope Format

Region scopes in NSW use a hierarchy formatted as `<country>-<state>-<iata>`:

1. **Country Scope (`au`):** Reaches repeaters across the entire country.
2. **State Scope (`au-nsw`):** Reaches repeaters across the entire state.
3. **Local / IATA Scope (`au-nsw-syd`):** Reaches only repeaters servicing that specific local area.

For communities that border multiple states (e.g. Albury/Wodonga), they may use an area-specific second tier like `au-hume`.

### Reducing Congestion

Region scopes act as simple whitelist filters on repeaters. Configuring a repeater with specific region scopes gives it explicit permission to forward traffic tagged with those matching scopes; everything else is dropped by default.

For example, a Wollongong repeater configured with `au`, `au-nsw`, and `au-nsw-wol` will forward local chatter tagged with `au-nsw-wol`. However, if a local conversation occurs in Sydney tagged with `au-nsw-syd`, the Wollongong repeater ignores those packets. This keeps Sydney traffic local, preserving Wollongong’s own airtime and keeping network reliability up. 

This isolation ensures high activity in one area won't impact the mesh elsewhere. Heavy chatter in Newcastle shouldn't cause two neighbours in Sydney to drop messages. The same logic applies at the state level: containing `au-nsw` traffic prevents NSW targeted chatter from polluting the Victoria mesh. Traffic that is unscoped (represented by the `*` scope in firmware) or scoped to `au` will traverse the entire mesh.

For details on how these scopes map to channels, see the [Channels](./channels) page.

<div className="nswmesh-callout">

For a deeper explanation of MeshCore regions, see Zindello Industries' article.<br/>
[MeshCore Regions: what they are, how they work, and why they matter.](https://zindello.com.au/meshcore-regions-what-they-are-how-they-work-and-why-they-matter/)
</div>

## Region Map

Click on a geographic region in the map below to see recommended region scopes for your repeater or companion based on its location. You can also use the [Eastmesh Region Tool](https://regions.eastmesh.au).

If you're close to a border, you may choose to include extra scopes depending on local geography or repeater links, as discussed in the [Repeaters](./repeaters) section below.

<RegionMap geojson="/geo/All-NSW-Regions-Mini.geojson" /> <br/>
*Note: this map is intended to be a guide of what is being used and not as a prescriptive resource.*

## Repeaters

As mentioned above, configuring region scopes tells a repeater what it should repeat. Only the explicitly allowed scopes will be forwarded; everything else is dropped by default.

All NSW (and ACT) repeaters should allow `au` and `au-nsw`. Generally, you should only add the IATA-level region scope that matches the repeater's geographic location. For example, Sydney repeaters should allow `au-nsw-syd`, while Newcastle and Hunter repeaters should allow `au-nsw-ntl`.

While the suggested scopes work for the vast majority of situations, region boundaries aren't always set in stone. You might opt to add a neighboring scope if:
* Your repeater provides an irreplaceable link (e.g. two WOL repeaters rely on a SYD repeater in the middle to connect to each other).
* Your repeater provides significant ground coverage into a neighboring region that lacks local repeaters.

However, exercise extra caution when adding extra scopes, especially on high-profile repeaters with wide coverage. Over-allowing scopes dissolves the boundaries regions are meant to create. For example, if a high-coverage WOL repeater also allows SYD traffic, the border between the two regions is partially dissolved. It is a delicate balance between providing useful coverage and limiting cross-regional traffic pollution.

An example configuration would be as follows:<br/>
*Note: You can copy CLI commands for a region straight from a region's popup on the map above.*

| Region | Suggested use | CLI command | Who |
| --- | --- | --- | --- |
| `au` | Australia-wide scoped traffic. | <CopyCommand command="region put au" /><br /><CopyCommand command="region allowf au" /> | Everyone |
| `au-nsw` | NSW-wide scoped traffic. | <CopyCommand command="region put au-nsw" /><br /><CopyCommand command="region allowf au-nsw" /> | Everyone |
| `au-nsw-syd` | Sydney scoped traffic. | <CopyCommand command="region put au-nsw-syd" /><br /><CopyCommand command="region allowf au-nsw-syd" /> | Sydney |
| Save | Save the regions. | <CopyCommand command="region save" /> | Everyone |

## Companions

Companions should generally be configured with the same region scopes as their local repeaters. When you're out and about, you can use the "Discover Regions" function inside the app to see which regions local repeaters are configured to allow.

Note that adding a scope to your companion only populates the list you choose from when deciding how to scope your outgoing messages. You don't need to add a region to receive traffic from it, if your companion hears a packet of any scope, you will receive it.

When chatting on the mesh, always try to use the smallest scope that makes sense for the channel. For example, if you're chatting in the `#sydney` channel, there is no reason for that traffic to reach the rest of the NSW mesh, so you should scope to `au-nsw-syd`. This practice is especially critical if you intend to use bots, which is discussed further on the [Bots](./bots) page. With exception of bot channels, scopes are usually set and forget as it's often the channel that determines what scope is best rather than the specific discussion at the time (i.e. instead of changing your scope on the fly in Public, post those scoped messages to a more local channel like #nsw or #sydney).