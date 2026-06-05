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

# AWS Cognito

**AWS Cognito** provides OAuth2 token issuance for authenticating the cattle vaccination backend to the **APHA Integration Bridge**.

## Purpose

The backend uses the OAuth2 **client credentials** flow against the Cognito `/oauth2/token` endpoint to obtain a bearer token. That token is then attached as an `Authorization: Bearer` header on all outbound calls to the APHA Integration Bridge.

## Auth Flow

1. Backend sends a POST to `{APHA_COGNITO_URL}/oauth2/token` with `grant_type=client_credentials` and `Authorization: Basic base64(clientId:clientSecret)`
2. Cognito returns an access token and its TTL
3. Token is cached in-process; refreshed automatically 60 seconds before expiry
4. All APHA Integration Bridge requests carry `Authorization: Bearer {token}`

## Configuration

| Variable | Description |
|---|---|
| `APHA_COGNITO_URL` | Cognito token endpoint base URL (environment-specific) |
| `COGNITO_CLIENT_ID` | OAuth2 client ID (sensitive) |
| `COGNITO_CLIENT_SECRET` | OAuth2 client secret (sensitive) |

Each environment (dev, test, perf-test, ext-test, prod) has its own Cognito user pool URL and client credentials, configured via CDP secrets.

## Operational Readiness Minimum

Before production release, this integration path should have:

- [x] token fetch failure alerting configured
- [x] client credential rotation process documented
- [x] token caching and auto-refresh validated under load
- [ ] Cognito outage fallback behaviour documented
