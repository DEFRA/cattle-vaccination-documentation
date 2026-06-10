<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Data Architecture -->

# Data Structure View

A _structure view_ covers how information is organised: domains, conceptual and logical models, canonical definitions and how data is exchanged (events, APIs, files). It answers what the data is and how pieces relate, not yet where bytes live (see [Physical View](../physical-view/README.md)).
<!-- Include: ac:toc -->

## Conceptual Data Domains

This conceptual view shows the primary data domains and ownership boundaries across the cattle vaccination landscape.

```mermaid
flowchart LR
  Vet(FieldVet)
  TestCaseDomain(TestCaseDomain)
  WorkorderDomain(WorkorderDomain)
  CattleDomain(CattleDomain)
  SalesforceOrg(SalesforceOrg)
  AphaApi(AphaApi)
  LivestockApi(LivestockApi)

  Vet -->|"submits TB test data"| TestCaseDomain
  TestCaseDomain -->|"persisted in"| SalesforceOrg
  WorkorderDomain -->|"owned by"| AphaApi
  CattleDomain -->|"owned by"| LivestockApi
  Vet -->|"reads workorders"| WorkorderDomain
  Vet -->|"reads cattle on holding"| CattleDomain
```

## Logical Data Model

This logical view describes how core entities relate across the TB skin test workflow.

```mermaid
flowchart LR
  Vet(FieldVet)
  Workorder(Workorder)
  Holding(Holding)
  Cattle(CattleOnHolding)
  Case(TbTestCase)
  TestPart(TestPart)
  TestResult(TestResult)

  Vet -->|"assigned"| Workorder
  Workorder -->|"covers"| Holding
  Holding -->|"has"| Cattle
  Vet -->|"creates"| Case
  Case -->|"linked to"| Workorder
  Case -->|"contains"| TestPart
  TestPart -->|"has"| TestResult
```

## Salesforce Data Model

This section defines the core Salesforce objects, their key fields and relationships. These are the only persistent records owned by the cattle vaccination domain.

```mermaid
erDiagram
  Case {
    string Id
    string CaseNumber
    string Status
    string WorkorderId
  }

  APHA_TestPart__c {
    string Id
    string CaseId
    string AnimalId
    datetime TestDate
  }

  APHA_TestPartResult__c {
    string Id
    string TestPartId
    string Measurement
    string Outcome
  }

  Case ||--o{ APHA_TestPart__c : "has test parts"
  APHA_TestPart__c ||--o{ APHA_TestPartResult__c : "has results"
```

## Data Exchange Boundaries

This exchange view maps the data contracts and transfer mechanisms between bounded contexts. All exchanges are synchronous HTTPS — there are no events, queues or topics.

```mermaid
flowchart LR
  Backend(CattleVaccinationBackend)
  AphaBridge(AphaIntegrationBridge)
  AphaApi(AphaApi)
  LivestockApi(LivestockApi)
  SalesforceOrg(SalesforceOrg)

  Backend -->|"POST /holdings/find, GET /workorders"| AphaBridge
  AphaBridge -->|"proxies HTTPS"| AphaApi
  Backend -->|"GET /cattle-on-holding"| LivestockApi
  Backend -->|"REST API v62.0 — Case, APHA_TestPart__c, APHA_TestPartResult__c"| SalesforceOrg
```
