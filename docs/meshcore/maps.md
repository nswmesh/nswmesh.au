---
title: Maps
---

# MeshCore Maps

Maps are built from observer data. Observer services listen to MeshCore traffic and publish packets, node adverts, position data, and other metadata to map or analytics services over the internet.

Public maps are useful for checking nearby repeaters, understanding rough coverage, and seeing whether observer data is being received. They should not be treated as a complete or private view of the mesh.

## Map Resources

| Map | Link | Data source | Notes |
| --- | --- | --- | --- |
| NSWMesh CoreScope | [corescope.nswmesh.au](https://corescope.nswmesh.au) | NSWMesh MQTT | NSWMesh CoreScope map. |
| NSWMesh MQTT LiveMap | [map.nswmesh.au](https://map.nswmesh.au/) | NSWMesh MQTT | NSWMesh mqtt-live-map (alternate). |
| NSWMesh Interference | [interference.nswmesh.au](https://interference.nswmesh.au/) | ACMA | A guidance tool for checking nearby licensed radio services and potential interference when selecting repeater or node locations. It helps identify crowded spectrum areas and supports more informed MeshCore deployment planning across the 915 MHz band. |
| Beefmesh | [beefmesh.link](https://beefmesh.link) | NSWMesh MQTT | Beefmesh map. |
| EastMesh | [map.eastmesh.au](https://map.eastmesh.au/) | EastMesh observers | Aus Eastern Mesh live map. |
| EastMesh CoreScope | [core.eastmesh.au](https://core.eastmesh.au/) | EastMesh observers | EastMesh CoreScope view. |
| MeshMapper | [syd.meshmapper.net](https://syd.meshmapper.net/) | LetsMesh | Sydney MeshMapper coverage map. See the [MeshMapper wiki](https://wiki.meshmapper.net/). |
| MeshSydney CoreSense | [meshsydney.com/coresense-map](https://meshsydney.com/coresense-map) | CoreSense observer data | Live node, RF link, and packet animation map for Sydney. |

## Location Privacy

Anything sent in adverts or public channels may be collected by observers and shown on public maps. Set an approximate location if you want your node to be useful for coverage planning without publishing an exact address.

If your node is missing from a map, check that it is advertising, has a location configured, is using the expected radio settings, and is within range of an observer feeding that map.
