<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Data Architecture -->

# Data Structure View

A _structure view_ covers how information is organised: domains, conceptual and logical models, canonical definitions and how data is exchanged (events, APIs, files). It answers what the data is and how pieces relate, not yet where bytes live (see [Physical View](../physical-view/README.md)).
<!-- Include: ac:toc -->

## Conceptual Data Domains

This conceptual view shows the primary data domains and ownership boundaries across the licensing landscape.

```mermaid
flowchart LR
  Applicant(Applicant)
  SubmissionDomain(LicenseSubmissionDomain)
  NotificationsDomain(LicenseNotificationsDomain)
  RegulationDomain(LicenseRegulationDomain)
  DefraIdentity(DefraIdentity)
  GovUkNotify(GovUkNotify)

  Applicant -->|"submits application data"| SubmissionDomain
  SubmissionDomain -->|"publishes submission events"| NotificationsDomain
  NotificationsDomain -->|"forwards notification events"| GovUkNotify
  SubmissionDomain -->|"shares case data"| RegulationDomain
  SubmissionDomain -->|"verifies identity token"| DefraIdentity
```

## Logical Data Model

This logical view describes how core entities relate across the submission and regulation process.

```mermaid
flowchart LR
  ApplicantEntity(Applicant)
  SubmissionEntity(LicenseSubmission)
  DocumentEntity(SupportingDocument)
  CaseEntity(RegulatoryCase)
  DecisionEntity(RegulatoryDecision)
  NotificationEntity(NotificationEvent)

  ApplicantEntity -->|"owns"| SubmissionEntity
  SubmissionEntity -->|"contains"| DocumentEntity
  SubmissionEntity -->|"creates or updates"| CaseEntity
  CaseEntity -->|"results in"| DecisionEntity
  SubmissionEntity -->|"emits"| NotificationEntity
```

## Collection and Attribute Model

This section defines the core Mongo collections, their key attributes and relationships in an ERD-style view.

```mermaid
erDiagram
  licenseSubmissions {
    ObjectId _id
    string submissionReference
    string applicantId
    string status
    datetime submittedAt
    datetime updatedAt
    object answers
    string[] documentIds
  }

  regulatoryCases {
    ObjectId _id
    ObjectId submissionId
    string caseReference
    string assignedTeam
    string decisionStatus
    datetime decisionAt
    object[] notes
    datetime updatedAt
  }

  notificationEvents {
    ObjectId _id
    ObjectId submissionId
    string eventType
    string channel
    string recipient
    string providerStatus
    datetime publishedAt
    datetime processedAt
  }

  licenseSubmissions ||--o{ regulatoryCases : "drives case creation"
  licenseSubmissions ||--o{ notificationEvents : "emits events for"
  regulatoryCases ||--o{ notificationEvents : "may trigger additional"
```

## Data Exchange Boundaries

This exchange view maps the main data contracts and transfer mechanisms between bounded contexts.

```mermaid
flowchart LR
  SubmissionApi(SubmissionApi)
  SubmissionEvents(SubmissionEventContract)
  NotificationsQueue(NotificationsQueue)
  RegulationApi(RegulationApi)
  NotifyApi(NotifyApi)

  SubmissionApi -->|"writes submission data via api"| SubmissionEvents
  SubmissionEvents -->|"event payload via sns or sqs"| NotificationsQueue
  NotificationsQueue -->|"consumed events"| RegulationApi
  NotificationsQueue -->|"notification request payload"| NotifyApi
```
