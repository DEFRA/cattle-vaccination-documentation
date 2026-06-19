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

For SICCT testing we will aim to follow the existing file format. At first sight the format does not look to be usable for DIVA without change, however we will try to obtain the schema documentation to verify this. It may be necessary to publish an extension to the schema.
