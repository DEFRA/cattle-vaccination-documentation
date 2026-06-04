<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->
<!-- Parent: Current State Views -->

# Software Journey View

A _journey view_ describes key flows and scenarios across components.
<!-- Include: ac:toc -->

## License Submission Creation Journey

This journey shows the end-to-end flow for creating a new license submission, from user initiation through frontend/backend processing, persistence, and event publication.

![License Submission Creation Journey](../structure-view/images/bounded-context/license-submission/license_submission_creation.png)

## License Submission Update Journey

This journey shows how an existing submission is retrieved, updated, validated, and persisted, including the integration points used to propagate change events.

![License Submission Update Journey](../structure-view/images/bounded-context/license-submission/license_submission_update.png)

## Submission-to-Notifications Event Journey

This journey shows how submission events are consumed by the notifications context and forwarded to downstream integrations, including queue-mediated handoff boundaries.

![License Submission Notifications Journey](../structure-view/images/bounded-context/license-notifications/license_submission_notifications.png)
