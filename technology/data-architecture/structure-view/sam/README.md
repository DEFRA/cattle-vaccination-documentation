<!-- Space: CVAC -->
<!-- Parent: Delivery Passport -->
<!-- Parent: Technology View -->
<!-- Parent: Data Architecture -->
<!-- Parent: Data Structure View -->

# Data Structure View - Sam

This _structure view_ for Sam covers how information is organised: domains, conceptual and logical models, canonical definitions and how data is exchanged (events, APIs, files). It answers what the data is and how pieces relate, not where bytes live (see [Physical View](../../physical-view/README.md)).
<!-- Include: ac:toc -->

## Conceptual Data Domains

This conceptual view shows the primary data domains within the SAM database that relate to TB testing activities and results.

```mermaid
flowchart LR
  Test("Test")
  PartTest("Part Test")
  TestSubject("Test Subject")
  TestResult("Test Result")
  Animal("Animal")
  Sample("Material / Sample")

  Event("Event")

  Test -->|"is subdivided into one or more"| PartTest
  Test -->|"associated with"| Event
  PartTest -->|"groups one or more"| TestSubject
  TestSubject -->|"is an"| Animal
  TestSubject -->|"may be a"| Sample
  TestSubject -->|"produces"| TestResult
```

## Logical Data Model

This logical view shows how the core SAM entities relate across the TB skin test workflow, mapping entity ownership and the primary navigation paths through the model.

```mermaid
flowchart LR
  TEST("TEST")
  PART_TEST("PART_TEST")
  ALT_LOC("ALTERNATIVE_TEST_LOCATION")
  TEST_IN_EVENT("TEST_IN_EVENT")
  EVENT("EVENT")
  ANTIGEN_BATCH("ANTIGEN_BATCH")
  TESTED_CAT("TESTED_ANIMAL_CATEGORY")
  TEST_SUBJECT("TEST_SUBJECT")
  ACTIVITY_MEASURE("ACTIVITY_INST_MEASUREMENT")
  TEST_RESULT("TEST_RESULT")
  TEST_RES_INTERP("TEST_RES_INTERPRETATION")
  RESULT_MEASURE("TEST_RESULT_MEASUREMENT")
  LESION("LESION_DETAILS")
  MATERIAL("MATERIAL")
  ANIMAL("ANIMAL")
  IND_REG("INDVDLY_REGISTERED_ANIMAL")
  ID_MECH("INDVDL_ANML_IDENTFN_MECH")
  BREED("BREED")

  TEST -->|"owns"| PART_TEST
  TEST -->|"owns"| ALT_LOC
  TEST -->|"linked via"| TEST_IN_EVENT
  TEST_IN_EVENT -->|"references"| EVENT
  TEST -->|"includes"| TEST_SUBJECT
  PART_TEST -->|"groups"| TEST_SUBJECT
  PART_TEST -->|"uses"| ANTIGEN_BATCH
  PART_TEST -->|"summarised by"| TESTED_CAT
  TEST_SUBJECT -->|"references"| ANIMAL
  TEST_SUBJECT -->|"may reference"| MATERIAL
  TEST_SUBJECT -->|"owns"| TEST_RESULT
  TEST_SUBJECT -->|"owns"| TEST_RES_INTERP
  TEST_SUBJECT -->|"owns"| ACTIVITY_MEASURE
  TEST_RESULT -->|"owns"| RESULT_MEASURE
  TEST_RESULT -->|"owns"| LESION
  RESULT_MEASURE -->|"references"| ACTIVITY_MEASURE
  ACTIVITY_MEASURE -->|"may reference"| MATERIAL
  MATERIAL -->|"sourced from"| ANIMAL
  ANIMAL -->|"is"| IND_REG
  IND_REG -->|"identified by"| ID_MECH
  ANIMAL -->|"of"| BREED
```

## SAM Physical Data Model

This section defines the core tables, their key fields and relationships in the SAM database (brp06 schema) for TB testing. The model is split into two focused diagrams: test execution and results, and animal identity.

### Test Execution and Results

```mermaid
erDiagram
  TEST {
    NUMBER TEST_PK PK
    NUMBER ASSET_PK FK
    NUMBER FEATURE_PK FK
    NUMBER OWNING_ORG_UNIT_PARTY_PK FK
    VARCHAR TEST_TYPE
    VARCHAR REASON_FOR_TEST
    VARCHAR RESULT_OF_TEST
    VARCHAR CPHH
    NUMBER QUANTITY_OF_ANIMALS
  }

  PART_TEST {
    NUMBER PART_TEST_PK PK
    NUMBER TEST_PK FK
    NUMBER ORGANISATION_PARTY_PK FK
    VARCHAR PART_TEST_TYPE
    VARCHAR RESULT_OF_PART_TEST
    TIMESTAMP FIRST_TEST_DATE
    TIMESTAMP SECOND_TEST_DATE
    VARCHAR TEST_PERFORMER_IDENTIFIER
    VARCHAR TEST_SIGNATORY_IDENTIFIER
  }

  ALTERNATIVE_TEST_LOCATION {
    NUMBER ALTERNATIVE_TEST_LOCATION_PK PK
    NUMBER TEST_PK FK
    VARCHAR LOCATION_NAME
    VARCHAR OS_MAP_REFERENCE
  }

  TEST_IN_EVENT {
    NUMBER TEST_IN_EVENT_PK PK
    NUMBER TEST_PK FK
    NUMBER EVENT_PK FK
    TIMESTAMP TEST_IN_EVENT_FROM_DATE
    TIMESTAMP TEST_IN_EVENT_TO_DATE
  }

  EVENT {
    NUMBER EVENT_PK PK
    VARCHAR EVENT_TYPE
    VARCHAR EVENT_CLASS_TYPE
    VARCHAR EVENT_NAME
    VARCHAR AH_INCIDENT_REFERENCE_NUMBER
    VARCHAR HEALTH_EVENT_TYPE
    TIMESTAMP EVENT_EFFECTIVE_FROM_DATE
    TIMESTAMP EVENT_EFFECTIVE_TO_DATE
  }

  ANTIGEN_BATCH {
    NUMBER ANTIGEN_BATCH_PK PK
    NUMBER PART_TEST_PK FK
    VARCHAR ANTIGEN_TYPE
    VARCHAR ANTIGEN_BATCH_NUMBER
  }

  TESTED_ANIMAL_CATEGORY {
    NUMBER TESTED_ANIMAL_CATEGORY_PK PK
    NUMBER PART_TEST_PK FK
    VARCHAR ANIMAL_CATEGORY
    NUMBER QUANTITY_TESTED
    NUMBER QUANTITY_NOT_TESTED
  }

  TEST_SUBJECT {
    NUMBER TEST_SUBJECT_PK PK
    NUMBER TEST_PK FK
    NUMBER PART_TEST_PK FK
    NUMBER ANIMAL_PK FK
    NUMBER MATERIAL_PK FK
    VARCHAR TEST_SUBJECT_TYPE
    VARCHAR TEST_SUBJECT_STATUS
    VARCHAR REASON_NOT_TESTED
    VARCHAR OVERALL_INTERPRETATION_BASIS
  }

  MATERIAL {
    NUMBER MATERIAL_PK PK
    NUMBER ANIMAL_PK FK
    VARCHAR MATERIAL_TYPE
    VARCHAR MATERIAL_NAME
    VARCHAR SAMPLE_ID
    VARCHAR REASON_FOR_SAMPLING
  }

  ACTIVITY_INST_MEASUREMENT {
    NUMBER ACTIVITY_INST_MEASUREMENT_PK PK
    NUMBER TEST_SUBJECT_PK FK
    NUMBER MATERIAL_PK FK
    VARCHAR MEASUREMENT_TYPE
    VARCHAR UNIT_OF_MEASUREMENT
    TIMESTAMP ACT_INST_MEASUREMENT_FRM_DAT
    TIMESTAMP ACT_INST_MEASUREMENT_TO_DAT
  }

  TEST_RESULT {
    NUMBER TEST_RESULT_PK PK
    NUMBER TEST_SUBJECT_PK FK
    VARCHAR TEST_RESULT_TYPE
    VARCHAR RESULT
    NUMBER COMBINED_MEASUREMENT
    VARCHAR DESCRIPTION_OF_RESULT
  }

  TEST_RES_INTERPRETATION {
    NUMBER TEST_RES_INTERPRETATION_PK PK
    NUMBER TEST_SUBJECT_PK FK
    VARCHAR TEST_INTERPRETATION_BASIS
    VARCHAR OVERALL_RESULT
    VARCHAR CUMULATIVE_OVERALL_RESULT
  }

  TEST_RESULT_MEASUREMENT {
    NUMBER TEST_RESULT_MEASUREMENT_PK PK
    NUMBER TEST_RESULT_PK FK
    NUMBER ACTIVITY_INST_MEASUREMENT_PK FK
  }

  LESION_DETAILS {
    NUMBER LESION_DETAILS_PK PK
    NUMBER TEST_RESULT_PK FK
    VARCHAR NODE_ORGAN
    VARCHAR DESCRIPTION
  }

  TEST ||--o{ PART_TEST : "owns"
  TEST ||--o{ TEST_SUBJECT : "includes"
  TEST ||--o{ ALTERNATIVE_TEST_LOCATION : "may have"
  TEST ||--o{ TEST_IN_EVENT : "linked via"
  TEST_IN_EVENT }o--|| EVENT : "references"
  PART_TEST |o--o{ TEST_SUBJECT : "groups"
  PART_TEST ||--o{ ANTIGEN_BATCH : "uses"
  PART_TEST ||--o{ TESTED_ANIMAL_CATEGORY : "summarised by"
  TEST_SUBJECT }o--o| MATERIAL : "may be"
  TEST_SUBJECT ||--o{ TEST_RESULT : "produces"
  TEST_SUBJECT ||--o{ TEST_RES_INTERPRETATION : "has"
  TEST_SUBJECT ||--o{ ACTIVITY_INST_MEASUREMENT : "measured by"
  TEST_RESULT ||--o{ TEST_RESULT_MEASUREMENT : "quantified by"
  TEST_RESULT ||--o{ LESION_DETAILS : "may have"
  TEST_RESULT_MEASUREMENT }|--|| ACTIVITY_INST_MEASUREMENT : "references"
  ACTIVITY_INST_MEASUREMENT }o--o| MATERIAL : "may relate to"
```

### Animal Identity

`TEST_SUBJECT` links to `ANIMAL` via `ANIMAL_PK`, and `MATERIAL` records the animal from which a sample was taken.

```mermaid
erDiagram
  ANIMAL {
    NUMBER ANIMAL_PK PK
    NUMBER BREED_PK FK
    NUMBER ANIMAL_SPECIES_PK FK
    VARCHAR ANIMAL_TYPE
    VARCHAR GENDER
    VARCHAR LIVESTOCK_TYPE
    VARCHAR BREED_CODE
  }

  INDVDLY_REGISTERED_ANIMAL {
    NUMBER ANIMAL_PK PK
    TIMESTAMP DATE_OF_BIRTH
    VARCHAR INDVDLY_REGST_ANIMAL_STATUS
    VARCHAR VERIFICATION_METHOD
  }

  INDVDL_ANML_IDENTFN_MECH {
    NUMBER INDVDL_ANML_IDENTFN_MECH_PK PK
    NUMBER ANIMAL_PK FK
    VARCHAR OFFICIAL_ANIMAL_IDENTIFIER
    VARCHAR OFFICIAL_ANIMAL_ID_TYPE
    TIMESTAMP INDVDL_ANML_ID_MCH_FROM_DATE
    TIMESTAMP INDVDL_ANML_ID_MCH_TO_DATE
  }

  BREED {
    NUMBER BREED_PK PK
    VARCHAR BREED_CODE
  }

  MATERIAL {
    NUMBER MATERIAL_PK PK
    NUMBER ANIMAL_PK FK
    VARCHAR MATERIAL_TYPE
    VARCHAR SAMPLE_ID
  }

  ANIMAL ||--o| INDVDLY_REGISTERED_ANIMAL : "is"
  INDVDLY_REGISTERED_ANIMAL ||--o{ INDVDL_ANML_IDENTFN_MECH : "identified by"
  ANIMAL }o--|| BREED : "of"
  MATERIAL }o--o| ANIMAL : "sourced from"
```

> **Note:** `BREED` lives in the AHBRP schema rather than brp06. `ANIMAL` denormalises the breed code via `BREED_CODE` to avoid cross-schema lookups.

## Data Exchange Boundaries

TBD
