<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Data Architecture -->

# Data Evolution View

An _evolution view_ describes the data landscape over time with legacy sources, current state and target models or platforms.
<!-- Include: ac:toc -->

## Legacy Data Landscape

This legacy view represents older submission and case data pathways prior to domain separation and event-driven integration patterns.

```mermaid
flowchart LR
  LegacyUi(LegacyUi)
  LegacyDb(LegacyRelationalDb)
  LegacyBatch(LegacyBatchExports)
  LegacyCaseTool(LegacyCaseTool)

  LegacyUi -->|"stores application data"| LegacyDb
  LegacyDb -->|"nightly extract files"| LegacyBatch
  LegacyBatch -->|"imports case data"| LegacyCaseTool
```

## Current Data Landscape

This current-state view reflects the active licensing data topology with submission storage and asynchronous downstream sharing.

```mermaid
flowchart LR
  SubmissionApi(SubmissionApi)
  MongoCurrent(SubmissionMongo)
  EventTopic(SubmissionEventsTopic)
  NotificationsQueue(NotificationsQueue)
  RegulationQueue(RegulationQueue)

  SubmissionApi -->|"writes submission records"| MongoCurrent
  SubmissionApi -->|"publishes change events"| EventTopic
  EventTopic -->|"event subscription"| NotificationsQueue
  EventTopic -->|"event subscription"| RegulationQueue
```

## Target Data Landscape

This target-state view shows the intended steady-state model with clearer ownership boundaries, canonical events, and governed archival paths.

```mermaid
flowchart LR
  SubmissionDomain(SubmissionDomainStore)
  RegulationDomain(RegulationDomainStore)
  CanonicalEvents(CanonicalEventContracts)
  AnalyticsStore(AnalyticsDataProduct)
  ArchiveStore(LongTermArchive)

  SubmissionDomain -->|"publishes canonical events"| CanonicalEvents
  CanonicalEvents -->|"drives case processing"| RegulationDomain
  CanonicalEvents -->|"feeds curated analytics"| AnalyticsStore
  SubmissionDomain -->|"policy based archiving"| ArchiveStore
  RegulationDomain -->|"policy based archiving"| ArchiveStore
```

## Transition and Dual-Run

This transition view shows coexistence and reconciliation while legacy pathways are progressively decommissioned.

```mermaid
flowchart LR
  LegacyDb(LegacyDataStore)
  SubmissionNew(SubmissionMongo)
  MigrationJob(MigrationReconciliationJob)
  DualReadApi(DualReadApiLayer)
  Decommission(LegacyDecommission)

  LegacyDb -->|"historical backfill"| MigrationJob
  MigrationJob -->|"writes mapped records"| SubmissionNew
  LegacyDb -->|"temporary fallback reads"| DualReadApi
  SubmissionNew -->|"primary reads and writes"| DualReadApi
  MigrationJob -->|"reconciliation complete"| Decommission
```
