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

# APHA Integration Bridge

**APHA Integration Bridge** is a CDP-hosted service intended to expose a consistent view of data from a variety of sources within APHA.

## Purpose

For Cattle Vaccination, the APHA Integratino Bridge plays a key role in making data from Sam available, at least read-only, to view within Salesforce.

## Endpoints Used
NOTE: At the timing of writing this is from the alpha prototype only.

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

- [ ] APHA API failure alerts configured
- [ ] correlation IDs propagated in requests and logs
- [ ] retry behaviour documented
- [ ] APHA integration DR test scheduled
