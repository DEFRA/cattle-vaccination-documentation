<!-- Space: CVAC -->
<!-- Parent: Technology Working Area -->

# Cattle Vaccination Service

The **Cattle Vaccination Service** enables field vets to digitally record and submit TB skin test results for cattle. It provides a web interface for vets to view their assigned workorders, look up cattle at a holding, record day-1 and day-2 skin measurements for each animal and submit completed results to APHA via Salesforce.

## What the Service Does

1. **Workorders** — vets log in and see their scheduled TB testing workorders, fetched from APHA via the APHA Integration Bridge
2. **Holdings lookup** — for a given workorder the service retrieves the holding details and the list of live cattle at that location (via the W3SI Livestock API)
3. **Case creation** — a Salesforce case is opened for the test event, linked to the CPH holding number
4. **Test result submission** — the vet records inoculation measurements (day 1) and reading measurements (day 2) for each animal; results are stored in Salesforce as `APHA_TestPart__c` and `APHA_TestPartResult__c` records

## Documentation Structure

This hub is organised following the [Delivery Group Hub Template](https://eaflood.atlassian.net/wiki/spaces/Exemplarde/overview?homepageId=5770445463):

- **Product Outcomes** — service outcomes aligned to the programme SoW
- **Users** — user needs research and epic user needs
- **Service Design** — service design artefacts
- **Technology** — architecture models, diagrams and assurance (including the Solution Overview)
- **Delivery Passport** — operational view, service context, team, risks and decisions
