<!-- Space: CVAC -->
<!-- Parent: Delivery Passport -->
<!-- Parent: Technology View -->
<!-- Parent: Integration Architecture -->
<!-- Parent: Integration Interfaces -->

<!-- Macro: :box:([^:]+):([^:]*):(.+):
     Template: ac:box
     Icon: true
     Name: ${1}
     Title: ${2}
     Body: ${3} -->

# Handheld Devices

There are existing handheld devices which are currently used to support TB skin testing in the field.

**TB Master** is a dedicated device, which transfers data to and from Sam/iSam via a manual file download and upload.

**TB Pro** is an app-based system rather than a dedicated device.

## Data Exchange

Data exchange is currently via an XML file upload/download in Sam/iSam.

For SICCT testing we will aim to follow the existing file format. At first sight the format does not look to be usable for DIVA without change, however we will try to obtain the actual schema documentation to verify this. It may be necessary to publish an extension to the schema.

### Data format

A sample download, [sample-handheld-data.xml](./sample-data/sample-handheld-data.xml), shows the shape of the existing format. It is a pre-test **download**: a TB52 results form pre-populated with the animals assigned to a visit, with all result fields left blank for the vet to complete on the device before the file is re-uploaded.

Root element `xsd_1:AnimalHealthTB52` (namespace `ah_ExportImport`), validated against `AHTB52ResultsForm_V3.xsd`.

| Section | Field | Notes |
|---|---|---|
| `FormHeader` | `CPHH` | Holding identifier, 4-segment format (e.g. `35/140/0074/01`) rather than the usual 3-segment CPH |
| `FormHeader` | `ActivityId` | Sam workorder/activity reference (e.g. `WSA-38966`) — the natural key to correlate with workorders retrieved from the [APHA Integration Bridge](./apha-integration-bridge.md) |
| `FormHeader` | `DateDownloaded` | Timestamp the file was generated for download |
| `TestResults/TestSubjects` (repeated per animal) | `OAI` | Ear tag. Formats seen in the sample are inconsistent — standard `UK` + 12-digit tags, and an older-style tag containing an embedded space (`UKFT0316 00062`) — any parser needs to tolerate both |
| | `Breed` | Breed code (e.g. `LIM`, `LIMX`, `SAX`, `BRB`, `HEX`) |
| | `PreviousTestDate` / `PreviousTestResult` | Blank in the download; carried over from the animal's test history |
| | `Age/DateOfBirth`, `Gender`, `GroupName` | Animal attributes |
| | `SkinMeasurements/Avian` and `/Bovine` | Each has `BeforeInjection`, `After72Hours`, `DescriptionOfResult` — hardcoded to the two SICCT reagents only, all blank until completed in the field |
| | `OverallResult`, `Remarks`, `ReasonNotTested` | Completed by the vet |
| `TestDetails` | `Party/Contact/Organisation` + `Address` (BS7666-structured) | Keeper/holding details for the visit |
| | `TestArrangedDateTime`, `ReasonForTest` (e.g. `12M` for a routine 12-month test) | Visit scheduling — maps onto `APHA_ReasonForTest__c` and the test window in the alpha [data design](../../quality-assurance-view/solution-overview/solution-overview.md#431-data-design) |
| | `TestSubmittedInterpretationBasis` (e.g. `STANDARD`), `TestSubmittedInterpretationDatetime` | Interpretation methodology and when it was applied |
| | `BovineBatchNumber`, `AvianBatchNumber` | Reagent batch numbers captured once per visit, not per animal |
| | `Feature/OSMapReference` | Grid reference for the holding/visit location |

