<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->

# Data Architecture

This area describes the data this solution owns, how it is defined, structured, stored, moved and governed across its lifecycle. It mirrors the four lenses of [Current State Views](../current-state-views/README.md) — each Data view is the data counterpart of a software view:

| Data view                                    | Software counterpart                                                        | What it covers                                                                                                        |
|----------------------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| [Structure View](./structure-view/README.md) | [Structure View](../current-state-views/structure-view/README.md)           | Conceptual data domains, logical entities, the canonical record shape and the contracts used to exchange data.        |
| [Physical View](./physical-view/README.md)   | [Deployment View](../current-state-views/deployment-view/README.md)         | Where bytes actually live — MongoDB collections, S3 buckets, SQS queues, caches and managed AWS data services.        |
| [Lifecycle View](./lifecycle-view/README.md) | [Journey View](../current-state-views/journey-view/README.md)               | How data is created, transformed, moved, retained and removed as it travels through this solution's flows.            |
| [Evolution View](./evolution-view/README.md) | [Evolution View](../current-state-views/evolution-view/README.md)           | How the data landscape changes as the domain expands — what's there today, what's planned and the transition between. |

Like the current state views, each Data view describes the **whole solution data landscape** rather than touring it bounded context by bounded context.
