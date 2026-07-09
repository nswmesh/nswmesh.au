---
title: Observers
---

# MeshCore Observers

Observers are software services that listen to MeshCore traffic and forward messages or raw packets to other resources over the internet. They are commonly used to feed maps, dashboards, analyzers, and other visibility tools through MQTT.

An observer should be a listen-only service. It should not inject messages into the mesh, bridge internet chat into LoRa, or automate replies back onto the radio network.

## MQTT Destinations

> `IATA` refers to the nearest major airport code used to identify the approximate observer location.  
> Examples include `SYD` for Sydney, `NTL` for Newcastle, `BHS` for Bathurst, and `WOL` for Wollongong.  
> This is used for topic grouping and regional filtering within MQTT services and mapping tools.

The following MQTT services can receive MeshCore observer data. Confirm the current settings with each service before deploying a permanent observer.

| Service | Server | Port | Protocol | Auth | Format | Config | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [NSWMesh](https://corescope.nswmesh.au/) | `mqtt.nswmesh.au` | `1883` | MQTT | User/pass: `nswmesh`/`nswmesh` | meshcore/\{IATA\}/\{PUBLIC_KEY\}/packets | TBC | <a href="https://corescope.nswmesh.au/#/observers" aria-label="NSWMesh observer status" title="Observer status">↗</a> |
| [EastMesh](https://map.eastmesh.au) | `mqtt2.eastmesh.au` | `443` | WebSockets + TLS | auth token | meshcore/\{IATA\}/\{PUBLIC_KEY\}/packets | <a href="https://eastmesh.au/" aria-label="EastMesh observer configuration" title="Config document">↗</a> | <a href="https://core.eastmesh.au/#/observers" aria-label="EastMesh observer status" title="Observer status">↗</a> |
| [LetsMesh](https://analyzer.letsmesh.net/map) | `mqtt-us-v1.letsmesh.net` and/or `mqtt-eu-v1.letsmesh.net` | `443` | WebSockets + TLS | auth token | meshcore/\{IATA\}/\{PUBLIC_KEY\}/packets | <a href="https://analyzer.letsmesh.net/observer/onboard" aria-label="LetsMesh observer configuration" title="Config document">↗</a> | <a href="https://analyzer.letsmesh.net/status/observers?region=SYD,BHS,NOA,TRO,PQQ,MVH,WOL,NTL,ARM,KPS,GOS,MYA,MIM,GUL" aria-label="LetsMesh observer status" title="Observer status">↗</a> |
| [MeshMapper](https://meshmapper.net/) | `mqtt.meshmapper.net` | `443` | WebSockets + TLS | auth token | meshcore/\{IATA\}/\{PUBLIC_KEY\}/packets | <a href="https://wiki.meshmapper.net/mqtt-main/" aria-label="MeshMapper observer configuration" title="Config document">↗</a> | - |

## Notes

Use observers to improve visibility of the mesh, not to create another active node. A good observer placement is somewhere that can hear useful mesh traffic and has stable internet access.

If you are unsure which destination to use, ask in the NSW Mesh Discord before setting up a public observer.
