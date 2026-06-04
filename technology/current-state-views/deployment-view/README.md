<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Current State Views -->

# Software Deployment View

A _deployment view_ describes where the system runs and how runtime environments are arranged.
<!-- Include: ac:toc -->

## Domain Deployment (Current)

This deployment view shows the current runtime footprint of the licensing domain, including ingress, service hosting boundaries, messaging components, and data services in the platform environment.

![Licensing Domain Current Deployment](../structure-view/images/licensing_domain_current_deployment.png)

## Domain Deployment (Future)

This deployment view shows the target-state hosting model and how services, queues, and integrations are expected to be deployed as the architecture evolves.

![Licensing Domain Future Deployment](../structure-view/images/licensing_domain_future_deployment.png)

## Bounded Context Deployments

These deployment diagrams show production deployment boundaries for each bounded context and how each context is independently hosted and scaled.

### License Submission Deployment

![License Submission Production Deployment](../structure-view/images/bounded-context/license-submission/deployment_production_license_submission.png)

### License Regulation Deployment

![License Regulation Production Deployment](../structure-view/images/bounded-context/license-regulation/deployment_production_license_regulation.png)

### License Notifications Deployment

![License Notifications Production Deployment](../structure-view/images/bounded-context/license-notifications/deployment_production_license_notifications.png)

## Operational Readiness Minimum

Before production release, deployment readiness must include:

- [ ] service and dependency alerts configured with clear ownership
- [ ] deployment rollback procedure documented and rehearsed
- [ ] restore and reconciliation paths defined for data-impacting releases
- [ ] release communication and incident triage routes confirmed
