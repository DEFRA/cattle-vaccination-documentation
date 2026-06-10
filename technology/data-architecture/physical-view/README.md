<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Data Architecture -->

# Data Physical View

A _physical view_ is the data counterpart of [Software Deployment View](../../current-state-views/deployment-view/README.md), showing which databases, lakes, buckets, topics and files hold data.
<!-- Include: ac:toc -->

**BOILERPLATE BELOW - NEEDS UPDATING**

## Current Data Stores

The cattle vaccination backend is stateless — it owns no database, queue or topic. All persistent state lives in Salesforce, which acts as the system of record for TB test cases, test parts and results. APHA and Livestock data is read-only at the point of request and is not cached or replicated.

```mermaid
flowchart LR
  Backend(CattleVaccinationBackend)
  SalesforceOrg(SalesforceOrg)
  AphaApi(AphaApi)
  LivestockApi(LivestockApi)

  Backend -->|"reads workorders and holdings"| AphaApi
  Backend -->|"reads cattle on holding"| LivestockApi
  Backend -->|"creates and reads cases, test parts, results"| SalesforceOrg
```

## Data Ownership

This view shows which system owns each class of data and the direction of writes.

```mermaid
flowchart LR
  SalesforceOrg(SalesforceOrg)
  AphaApi(AphaApi)
  LivestockApi(LivestockApi)

  CaseRecord(Case)
  TestPartRecord(APHA_TestPart__c)
  TestResultRecord(APHA_TestPartResult__c)
  WorkorderData(WorkorderData)
  HoldingData(HoldingData)
  CattleData(CattleOnHoldingData)

  SalesforceOrg -->|"owns"| CaseRecord
  SalesforceOrg -->|"owns"| TestPartRecord
  SalesforceOrg -->|"owns"| TestResultRecord
  AphaApi -->|"owns"| WorkorderData
  AphaApi -->|"owns"| HoldingData
  LivestockApi -->|"owns"| CattleData
```

## Access and Boundaries

The BFF runs in a protected VPC and reaches all external data stores over HTTPS. There is no data replication, caching layer or message bus.

```mermaid
flowchart LR
  Vet(FieldVet)
  Frontend(CattleVaccinationFrontend)
  Backend(CattleVaccinationBackend)
  Cognito(AwsCognito)
  AphaBridge(AphaIntegrationBridge)
  AphaApi(AphaApi)
  LivestockApi(LivestockApi)
  SalesforceOrg(SalesforceOrg)

  Vet -->|"HTTPS"| Frontend
  Frontend -->|"HTTPS via API Gateway"| Backend
  Backend -->|"OAuth2 client credentials"| Cognito
  Backend -->|"HTTPS"| AphaBridge
  AphaBridge -->|"HTTPS"| AphaApi
  Backend -->|"HTTPS"| LivestockApi
  Backend -->|"HTTPS REST API v62.0"| SalesforceOrg
```
