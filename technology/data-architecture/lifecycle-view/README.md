<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Data Architecture -->

# Data Lifecycle View

A _lifecycle view_ is the data counterpart of [Software Journey View](../../current-state-views/journey-view/README.md), showing how data is created, transformed, shared, archived and deleted.
<!-- Include: ac:toc -->

## Submission Data Lifecycle

This lifecycle shows the primary stages for submission data from initial capture to archive or removal.

```mermaid
flowchart LR
  Created(Created)
  Validated(Validated)
  Persisted(Persisted)
  Shared(SharedByEvent)
  Archived(Archived)
  Deleted(Deleted)

  Created -->|"business validation"| Validated
  Validated -->|"write to data store"| Persisted
  Persisted -->|"publish lifecycle event"| Shared
  Shared -->|"retention period met"| Archived
  Archived -->|"deletion policy met"| Deleted
```

## Case and Regulation Data Lifecycle

This lifecycle shows how submission data becomes regulatory case data and decision outcomes.

```mermaid
flowchart LR
  SubmissionEvent(SubmissionEvent)
  CaseOpened(CaseOpened)
  CaseReviewed(CaseReviewed)
  DecisionRecorded(DecisionRecorded)
  ApplicantNotified(ApplicantNotified)

  SubmissionEvent -->|"consumed by regulation process"| CaseOpened
  CaseOpened -->|"assessment updates"| CaseReviewed
  CaseReviewed -->|"finalise decision data"| DecisionRecorded
  DecisionRecorded -->|"emit decision notification"| ApplicantNotified
```

## Retention and Deletion Paths

This lifecycle decision flow shows how retention and GDPR-style deletion paths are applied.

```mermaid
flowchart LR
  DataRecord(DataRecord)
  RetentionCheck{RetentionExpired}
  LegalHoldCheck{LegalHoldActive}
  ArchiveRecord(ArchiveRecord)
  DeleteRecord(DeleteRecord)
  KeepActive(KeepActive)

  DataRecord --> RetentionCheck
  RetentionCheck -->|"no"| KeepActive
  RetentionCheck -->|"yes"| LegalHoldCheck
  LegalHoldCheck -->|"yes"| ArchiveRecord
  LegalHoldCheck -->|"no"| DeleteRecord
```
