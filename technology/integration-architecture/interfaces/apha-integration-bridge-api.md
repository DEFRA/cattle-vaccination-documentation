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

# APHA Integration Bridge API

**APHA Integration Bridge API** is a CDP-hosted proxy service that bridges the cattle vaccination backend to APHA's holdings and workorders APIs.

## Purpose

The cattle vaccination backend calls the Integration Bridge rather than APHA APIs directly. The bridge handles APHA-specific transport concerns (SOAP wrapping, internal routing) so the cattle vaccination service deals only with clean REST JSON.

## Endpoints Used

| Method | Path | Description |
|---|---|---|
| `POST` | `/holdings/find` | Bulk lookup of holdings by ID array |
| `GET` | `/workorders` | Retrieve TB workorders by `startDate`, `endDate` and `country` |

## Authentication

Bearer token obtained from **[AWS Cognito](./aws-cognito.md)**. The backend fetches a token using client credentials and passes it as `Authorization: Bearer {token}` on every request.

A `x-api-key` header is injected in local/dev environments via the `DEV_API_KEY` config variable.

## Configuration

| Variable | Description |
|---|---|
| `APHA_API_BASE_URL` | Base URL for the APHA Integration Bridge |

## Operational Readiness Minimum

Before production release, this integration path should have:

- [x] APHA API failure alerts configured
- [x] correlation IDs propagated in requests and logs
- [x] retry behaviour documented
- [ ] APHA integration DR test scheduled
