<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Integration Architecture -->
<!-- Parent: Integration Interfaces -->

<!-- Macro: :box:([^:]+):([^:]*):(.+):
     Template: ac:box
     Icon: true
     Name: ${1}
     Title: ${2}
     Body: ${3} -->

# Livestock API

**Livestock API** is the W3SI Defra livestock gateway used to look up cattle at a given holding.

## Purpose

Any time an up-to-date list of cattle on a holding is required this will be used to obtain that data.

## Endpoints Used

| Method | Path | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/cattle-on-holding` | `LocationID`, `IncludeDeadAnimals=N` | Returns cattle registered at the given CPH holding |

## Authentication

Static bearer token passed as `Authorization: Bearer {token}`. The token is provided per environment via CDP secrets.

An HTTP proxy agent (`ProxyAgent` via `undici`) is used if `HTTP_PROXY` is configured in the environment.

## Configuration

NOTE: This is correct for the alpha prototype

| Variable | Description |
|---|---|
| `LIVESTOCK_API_BASE_URL` | Base URL for the W3SI Livestock API |
| `LIVESTOCK_API_TOKEN` | Bearer token (sensitive) |

## Operational Readiness Minimum

Before production release, this integration path should have:

- [ ] Livestock API failure alerts configured
- [ ] correlation IDs in requests and logs
- [ ] token rotation process documented
- [ ] Livestock API DR test scheduled
