<!-- Space: CVAC -->
<!-- Parent: Cattle Vaccination Service -->
<!-- Parent: Technology -->

<!-- Macro: :status:([^:]+):([^:]*):(.+):
     Template: ac:status
     Title: ${1}
     Color: ${2}
     Subtle: ${3} -->

# Integration Architecture

| System                                                               | Purpose                                          | Status                          | Notes                                       |
|----------------------------------------------------------------------|--------------------------------------------------|---------------------------------|---------------------------------------------|
| [APHA Integration Bridge](./interfaces/example-partner-api.md)      | Holdings lookup and workorders retrieval         | :status:Integrated:Green:false: | Bearer token via AWS Cognito                |
| [AWS Cognito](./interfaces/example-identity-provider.md)            | OAuth2 token issuer for APHA auth                | :status:Integrated:Green:false: | Client credentials; token caching           |
| [Livestock API](./interfaces/future-data-provider.md)               | Cattle-on-holding data                           | :status:Integrated:Green:false: | W3SI Defra gateway; bearer token            |
| [Salesforce](./interfaces/salesforce.md)                            | Case management — cases, test parts, results     | :status:Integrated:Green:false: | OAuth2 client credentials; composite API    |

## Integration Status Descriptions

- :status:Deferred:Grey:false: - decision or build deferred until requirements or timeline are clearer
- :status:Confirmed:Blue:false: - in scope; not yet building or not yet live everywhere
- :status:Integrating:Yellow:false: - building and/or testing across environments
- :status:Integrated:Green:false: - live in production and monitored (as applicable)
- :status:Retiring:Red:false: - integrated but earmarked for decommission
