<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Data Architecture -->

# Data Physical View

A _physical view_ is the data counterpart of [Software Deployment View](../../current-state-views/deployment-view/README.md), showing which databases, lakes, buckets, topics and files hold data.
<!-- Include: ac:toc -->

## Current Data Stores

This physical view shows where operational licensing data is persisted and how storage responsibilities are split across bounded contexts.

```mermaid
flowchart LR
  SubmissionSvc(LicenseSubmissionService)
  RegulationSvc(LicenseRegulationService)
  NotificationsSvc(LicenseNotificationsService)
  MongoDb(MongoDbCluster)
  S3Store(S3DocumentStore)
  EventTopic(SnsTopic)
  EventQueue(SqsQueue)

  SubmissionSvc -->|"writes and reads submission data"| MongoDb
  SubmissionSvc -->|"stores document binaries"| S3Store
  SubmissionSvc -->|"publishes events"| EventTopic
  EventTopic -->|"fan out events"| EventQueue
  EventQueue -->|"consumed by notifications"| NotificationsSvc
  EventQueue -->|"consumed by regulation"| RegulationSvc
```

## Data Movement and Replication

This movement view highlights how data flows between stores and integration channels, including internal replication and asynchronous handoff.

```mermaid
flowchart LR
  SubmissionDb(SubmissionMongoPrimary)
  ReplicaNode(SubmissionMongoReplica)
  EventTopic(SubmissionEventsTopic)
  NotificationsQueue(NotificationsProcessingQueue)
  RegulationQueue(RegulationProcessingQueue)
  NotifyBridge(GovUkNotifyBridge)

  SubmissionDb -->|"replicates data"| ReplicaNode
  SubmissionDb -->|"emits domain events"| EventTopic
  EventTopic -->|"routes event copies"| NotificationsQueue
  EventTopic -->|"routes event copies"| RegulationQueue
  NotificationsQueue -->|"notification payloads"| NotifyBridge
```

## Backup and Recovery Boundaries

This recovery view shows backup ownership and restore boundaries for critical data platforms.

```mermaid
flowchart LR
  MongoPrimary(MongoDataStore)
  MongoBackups(MongoLogicalBackups)
  EbsSnapshots(EbsSnapshots)
  S3BackupVault(S3BackupVault)
  RestoreRunbook(RestoreRunbookProcess)
  ServiceTeam(ServiceTeam)
  PlatformTeam(PlatformTeam)

  MongoPrimary -->|"hourly logical backups"| MongoBackups
  MongoPrimary -->|"nightly snapshot backups"| EbsSnapshots
  MongoBackups -->|"stored in"| S3BackupVault
  EbsSnapshots -->|"copied to"| S3BackupVault
  S3BackupVault -->|"restore procedure"| RestoreRunbook
  ServiceTeam -->|"requests break glass"| PlatformTeam
  PlatformTeam -->|"authorises restore execution"| RestoreRunbook
```

