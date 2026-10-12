<!-- Space: CVAC -->
<!-- Parent: Delivery Passport -->
<!-- Parent: Technology View -->
<!-- Parent: Data Architecture -->

# Data Structure View

A _structure view_ covers how information is organised: domains, conceptual and logical models, canonical definitions and how data is exchanged (events, APIs, files). It answers what the data is and how pieces relate, not yet where bytes live (see [Physical View](../physical-view/README.md)).
<!-- Include: ac:toc -->

## Legacy Data

The legacy system is Sam. See [Data Structure View - Sam](./sam/README.md) for detailed information regarding the relevant areas of Sam.

## Conceptual Data Domains

This conceptual view shows the primary data domains and ownership boundaries across the cattle vaccination landscape.

```mermaid
---
title: Conceptual Data Model
---
erDiagram
    classDef external stroke:#666

    Keeper
    Holding
    Herd
    Animal
    Location
    Vet
    OfficialVet
    AphaVet
    VDP
    VetVisit
    Person




    Keeper ||--o{ Holding : manages

    Holding ||--o{ Herd : contains

    Holding }o--|| Location : "is at" 

    Herd ||--o{ Animal : contains

    Vet ||--o{ VetVisit : conducts

    VetVisit }o--|| Holding : "conducted at"


    WorkOrder }o--|| Holding : "is for"

    WorkOrder }o--o| VDP : "is assigned to"
    WorkOrder }o--o| AphaVet : "is assigned to"

    WorkList }o--o{ Animal : "part of"
    
    WorkOrder |o--o{ WorkList : "generates"

    VetVisit ||--o{ AnimalVaccination : "carried out at"

    AnimalVaccination }o--|| Animal: "given to"

    AnimalVaccination ||--o{ OfficialVet : "administered by"

    VaccineBatch ||--o{ AnimalVaccination: "used for"

    DiluentBatch ||--o{ AnimalVaccination: "used for"

    

```



## Logical Data Model

This logical view describes how core entities relate across the TB workflow.

### Vaccination Work List

```mermaid
erDiagram

  WorkList {
    date dateCreated
    datetime lastRefresh
  }

  WorkListAnimal {
  }

  WorkOrder {
    date dueDate
  }

  Contact {
    string firstName
    string lastName
    phone phone
    email email
  }

  VaccinationVisit {
    date dateOfVisit
    boolean workListComplete
  }

  VaccineBatch {
    string batchNumber UK
    date expiryDate
    enum vaccineType
  }

  DiluentBatch {
    string batchNumber UK
    date expiryDate
  }

  Animal {
    string earTag UK
  }

  UnidentifiedAnimal {
    string temporaryAnimalIdentifier
    enum breed
    enum sex
    date dob
  }

  Location {
    address address
  }

  CPH {
    string cphCode UK
  }

  CPH }o--|| Location : "location"

  WorkList }o--|| CPH : "is for"

  WorkList ||--o{ WorkListAnimal : "includes"
  WorkListAnimal }o--|| Animal : "is"

  WorkList |o--o{ VaccinationVisit : "was carried out"

  WorkOrder |o--o{ WorkList : "is for"
  WorkOrder }o--|| CPH : "is for"
  WorkOrder }o--o| Contact : "assigned to"

  VaccinationVisit }o--|| Person : "administered by"
  VaccinationVisit }o--|| Person : "countersigned by"

  Vaccination {
    string notes
  }

  VaccinationVisit ||--o{ Vaccination : "administered on"

  Vaccination }o--|| VaccineBatch : "used"
  Vaccination }o--|| DiluentBatch : "used"

  Vaccination }o--o| Animal : "administered to"
  Vaccination }o--o| UnidentifiedAnimal : "administered to"

```

## Salesforce Data Model

This section defines the core Salesforce objects, their key fields and relationships in an ERD-style view.

### Work Order and Work List
```mermaid
erDiagram
  CV_WorkOrder__c {
%%    Lookup(APHA_CPH__c) CV_CPH__c FK
    Text CV_CPHCode__c
    Lookup(Contact) CV_Assignee__c FK
    Date CV_DueDate__c
  }

  CV_WorkList__c {
    Text CV_CPHCode__c
    DateTime CV_Created__c
    Lookup(CV_WorkOrder__c) CV_WorkOrder__c FK
  }

  CV_WorkListAnimal__c {
    Lookup(CV_WorkList__c) CV_WorkList__c FK
    Lookup(APHA_CommodityAnimal__c) CV_Animal__c FK
  }

  CV_WorkList__c }o--o| CV_WorkOrder__c : ""
  CV_WorkListAnimal__c }o--|| CV_WorkList__c : ""
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
