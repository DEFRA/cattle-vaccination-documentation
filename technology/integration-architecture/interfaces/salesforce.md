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

# Salesforce

**Salesforce** is the CRM that will be used in the future to store and manage TB skin test and vaccination cases and records, and to view historical testing records.

## Purpose

Salesforce is APHA's strategic case management and workflow system. it will be the system of record for all TB vaccination data. It will become the system of record for testing data eventually.

## Custom Objects

NOTE: Correct for alpha prototype only.

| Object | Description |
|---|---|
| `Case` | TB test case; linked to a CPH holding (`APHA_CPH__c`), reason for test, test window dates |
| `APHA_TestPart__c` | A testing visit within a case; records day 1/day 2 dates, certifying vet and tester identity |
| `APHA_TestPartResult__c` | A single animal's result within a test part; records ear tag, test type, skin measurements |
| `APHA_CPH__c` | County/Parish/Holding identifier; looked up during case creation |

## Endpoints Used

| Method | Path | Description |
|---|---|---|
| `POST` | `/services/data/v62.0/composite/` | Composite request — CPH lookup + case creation in one call |
| `POST` | `/services/data/v62.0/composite/graph/` | Composite graph — batch creation of test parts and results |
| `GET` | `/services/data/v62.0/query/?q=SELECT...` | SOQL queries for case and test part retrieval |
| `GET` | `/services/data/v62.0/sobjects/Case/{id}` | Single case retrieval |

## Authentication

OAuth2 **client credentials** flow. The backend posts to `/services/oauth2/token` with `grant_type=client_credentials` and `client_id` / `client_secret`. The returned access token and instance URL are cached and auto-refreshed 60 seconds before expiry.

## Configuration

NOTE: Correct for alpha prototype only.

| Variable | Description |
|---|---|
| `SALESFORCE_URL` | Salesforce org instance URL |
| `SALESFORCE_CLIENT_ID` | Connected app client ID (sensitive) |
| `SALESFORCE_CLIENT_SECRET` | Connected app client secret (sensitive) |

## Operational Readiness Minimum

Before production release, this integration path should have:

- [ ] Salesforce API failure alerts configured
- [ ] token caching and auto-refresh validated
- [ ] composite request error handling tested
- [ ] Salesforce org DR runbook documented
