<!-- Space: CVAC -->
<!-- Parent: Delivery Passport -->
<!-- Parent: Technology View -->
<!-- Parent: Data Architecture -->

# Data Structure View

A _structure view_ covers how information is organised: domains, conceptual and logical models, canonical definitions and how data is exchanged (events, APIs, files). It answers what the data is and how pieces relate, not yet where bytes live (see [Physical View](../physical-view/README.md)).
<!-- Include: ac:toc -->

## Conceptual Data Domains

This conceptual view shows the primary data domains and ownership boundaries across the cattle vaccination landscape.

```mermaid
flowchart LR
  Case(Case)
  TestPart("Test Part")
  TestPartResult("Test Part Result")

  Case -->|"Is carried out in one or more"| TestPart
  TestPart -->|"has individual results for each animal"| TestPartResult
```

## Logical Data Model

This logical view describes how core entities relate across the TB skin test workflow.

```mermaid
flowchart LR
  Case(Case)
  TestPart("Test Part")
  TestPartResult("Test Part Result")

  Case -->|"owns"| TestPart
  TestPart -->|"owns"| TestPartResult
```

## Salesforce Data Model

This section defines the core Salesforce objects, their key fields and relationships in an ERD-style view.
The current model as from the **alpha prototype** and we know it needs to change.

```mermaid
erDiagram
  Case {
    Lookup(CPH) APHA_CPH__c
    Picklist APHA_ReasonForTest__c
    Picklist Status
    Date APHA_TestWindowEndDate__c
    Date APHA_TestWindowStartDate__c
    RollUpSummary(SUM_Test_Part) Total_Number_Not_Tested__c
    RollUpSummary(SUM_Test_Part) APHA_TotalNumberOfInconclusiveReactors__c
    RollUpSummary(SUM_Test_Part) APHA_TotalNumberOfReactors__c
    RollUpSummary(SUM_Test_Part) APHA_TotalNumberOfTested__c
  }

  TestPart {
    Master-Detail(Case) Case_c
    Date APHA_Day1__c
    Date APHA_Day2__c
    Time Test_Start_Time__c
    Text(255) APHA_IdentityOfCertifyingVet__c
    Lookup(User) APHA_IdentityOfReviewer__c
    Text(255) APHA_IdentityOfTester__c
    RollUpSummary(COUNT_Test_Part_Result) Number_Not_Tested__c
    RollUpSummary(COUNT_Test_Part_Result) APHA_NumberOfInconclusiveReactors__c
    RollUpSummary(COUNT_Test_Part_Result) APHA_NumberOfReactors__c
    RollUpSummary(COUNT_Test_Part_Result) APHA_NumberTested__c
  }

  TestPartResult {
    Master-Detail(Test_Part) APHA_TestPart__c
    Lookup(Case) Case__c
    Text(20) APHA_BatchAvian__c
    Text(20) APHA_BatchBovine__c
    Text(20) APHA_BatchDIVA__c
    Text(20) APHA_EarTagNo__c
    Picklist Not_Tested_Reason__c
    Picklist APHA_ResultAfterReview__c
    Formula(Text) APHA_ResultCalculated__c
    Number(3_0) APHA_TestDay1Avian__c
    Number(3_0) APHA_TestDay1Bovine__c
    Number(3_0) APHA_TestDay1DIVA__c
    Number(3_0) APHA_TestDay2Avian__c
    Number(3_0) APHA_TestDay2Bovine__c
    Number(3_0) APHA_TestDay2DIVA__c
    Picklist APHA_TestType__c
  }

  Case ||--o{ TestPart : "part of"
  TestPart ||--o{ TestPartResult : "part of"
```

## Data Exchange Boundaries

This exchange view maps the data contracts and transfer mechanisms between bounded contexts. All exchanges are synchronous HTTPS — there are no events, queues or topics.

TBD

<!-- ```mermaid
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
-->
