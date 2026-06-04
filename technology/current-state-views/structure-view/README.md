<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Current State Views -->

# Software Structure View

A _structure view_ describes the decomposition of the solution into containers and the boundaries between them.
<!-- Include: ac:toc -->

The Cattle Vaccination domain is composed of one delivery bounded context — **Cattle Vaccination** — supported by three external integration boundaries: **Salesforce** (case management), **APHA** (workorders and holdings) and **Livestock** (cattle data). The diagrams below are organised bounded-context-first, following the [C4 model](https://c4model.com/): each context shown with its own context and container views, then zooming out to whole-domain views.

## Bounded Contexts

### Cattle Vaccination

The core delivery bounded context. A web frontend lets field vets view TB workorders and submit skin test results. A stateless Node.js/Hapi BFF sits behind it, orchestrating calls to APHA, Livestock and Salesforce.

#### Context

![Cattle Vaccination Context](images/bounded-context/cattle-vaccination/cattle_vaccination_bounded_context_context.png)

#### Container

![Cattle Vaccination Container](images/bounded-context/cattle-vaccination/cattle_vaccination_bounded_context_container.png)

#### Backend Component

![Cattle Vaccination Backend Component](images/bounded-context/cattle-vaccination/cattle_vaccination_backend_component.png)

### Salesforce

The Salesforce CRM stores all TB test case data — cases, test parts and per-animal results. APHA officers manage cases here directly; the cattle vaccination backend writes to it via the Salesforce REST API.

#### Context

![Salesforce Context](images/bounded-context/salesforce/salesforce_bounded_context_context.png)

#### Container

![Salesforce Container](images/bounded-context/salesforce/salesforce_bounded_context_container.png)

### APHA

The APHA bounded context groups the APHA Integration Bridge (a CDP proxy service), the AWS Cognito instance used for authentication, and the underlying APHA holdings and workorders APIs.

#### Context

![APHA Context](images/integrations/apha/apha_bounded_context_context.png)

#### Container

![APHA Container](images/integrations/apha/apha_bounded_context_container.png)

### Livestock

The W3SI Defra livestock gateway, used to retrieve live cattle at a given holding.

## Domain Context

Zooming out — all bounded contexts and actors in one picture.

![Domain Context](images/cvac_domain_current_context.png)

## Domain Containers

All containers across the domain in a single view.

![Domain Containers](images/cvac_domain_current_container.png)
