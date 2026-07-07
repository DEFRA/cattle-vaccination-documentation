<!-- Space: CVAC -->
<!-- Parent: Delivery Passport -->
<!-- Parent: Technology View -->
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

For Cattle Vaccination, the APHA Integration Bridge plays a key role in making data from Sam available, at least read-only, to view within Salesforce.

## Data Exchange Mechanisms

Today the Bridge only exposes data on-demand via a RESTful API. The target state is for it to expose three complementary mechanisms:

| Mechanism | Purpose | Status |
|---|---|---|
| **Bulk** | Initial bootstrapping of data in consuming systems | Target state; transport TBC |
| **Batch** | Keeping consuming systems up-to-date on a scheduled basis | Target state; transport TBC |
| **On-demand** | Requesting individual records via RESTful API | Existing |

The transports for Bulk and Batch (e.g. file export, message queue, paginated API) have not been decided; this page will be updated once that design work is done.

## Endpoints Used (On-Demand)
NOTE: At the timing of writing this is from the alpha prototype only.

| Method | Path | Description |
|---|---|---|
| `POST` | `/holdings/find` | Lookup of holdings by ID array |
| `GET` | `/workorders` | Retrieve TB workorders by `startDate`, `endDate` and `country` |

## Authentication

Bearer token obtained from **[AWS Cognito](./aws-cognito.md)**. The backend fetches a token using client credentials and passes it as `Authorization: Bearer {token}` on every request.

A `x-api-key` header is injected in local/dev environments via the `DEV_API_KEY` config variable.

This applies to the on-demand API today; authentication for the future Bulk and Batch mechanisms is TBD pending their transport design.

## Configuration

| Variable | Description |
|---|---|
| `APHA_API_BASE_URL` | Base URL for the APHA Integration Bridge |

## Failure Modes & Mitigations

Generic failure modes that apply across all three mechanisms:

| Failure Mode | Mitigation |
|---|---|
| Auth failure (Cognito outage, expired/invalid token) | Token cached and refreshed ahead of expiry; alert on repeated `401`s; circuit breaker to avoid hammering a failing token endpoint |
| API/service unavailable or timing out | Retry with backoff for idempotent requests; circuit breaker; alert on sustained failure |
| Network partition between CDP and Salesforce network | Correlation IDs propagated through requests and logs to aid diagnosis; alerting on connectivity loss |
| Unexpected or invalid data shape (schema drift) | Schema validation on ingest; quarantine/dead-letter invalid records rather than silently dropping or corrupting downstream data; alert on validation failures |

Mechanism-specific considerations:

- **On-demand**: a failed request is visible immediately to the calling user/flow (e.g. a Salesforce screen). Mitigation: fail gracefully with a clear error in the UI rather than a raw error; only retry safe (idempotent, e.g. `GET`) requests automatically.
- **Bulk**: a failure partway through leaves a consuming system with an incomplete initial dataset, which may not be obvious to users. Mitigation: bulk loads should be resumable/idempotent, and validated (e.g. record counts or checksums against source) before being considered complete and switched into use.
- **Batch**: a missed or failed scheduled run causes silent data staleness — consumers keep working off out-of-date data without an obvious error. Mitigation: monitor and alert on missed/failed batch runs, track and surface a last-successful-run/data-freshness indicator to consumers, and periodically reconcile against source.

## Operational Readiness Minimum

Before production release, this integration path should have:

- [ ] APHA API failure alerts configured
- [ ] correlation IDs propagated in requests and logs
- [ ] retry behaviour documented
- [ ] APHA integration DR test scheduled
- [ ] bulk load validation (e.g. record counts/checksums) before cutover
- [ ] batch run monitoring — alerting on missed/failed runs, and data freshness visible to consumers
