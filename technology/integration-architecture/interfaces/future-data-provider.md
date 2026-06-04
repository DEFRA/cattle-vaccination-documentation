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

When a vet selects a holding to test, the backend calls the Livestock API to retrieve the list of live cattle at that location. Dead animals are excluded from the response.

## Endpoints Used

| Method | Path | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/cattle-on-holding` | `LocationID`, `IncludeDeadAnimals=N` | Returns cattle registered at the given CPH holding |

## Authentication

Static bearer token passed as `Authorization: Bearer {token}`. The token is provided per environment via CDP secrets.

An HTTP proxy agent (`ProxyAgent` via `undici`) is used if `HTTP_PROXY` is configured in the environment.

## Configuration

| Variable | Description |
|---|---|
| `LIVESTOCK_API_BASE_URL` | Base URL for the W3SI Livestock API |
| `LIVESTOCK_API_TOKEN` | Bearer token (sensitive) |

## Operational Readiness Minimum

Before production release, this integration path should have:

- [x] Livestock API failure alerts configured
- [x] correlation IDs in requests and logs
- [ ] token rotation process documented
- [ ] Livestock API DR test scheduled
