# Acceptable Use Policy — UHRP Storage Host

**Host:** uhrp.equusv.com
**Operator:** Covegi AB
**Last updated:** 2026-08-15

## 1. Purpose

This policy governs use of this UHRP (Universal Hash Resolution Protocol) storage host. The host stores and serves files uploaded by authenticated users of the platform.

## 2. Permitted Use

The host may be used to store content that:

- Is uploaded by an authenticated identity in accordance with the platform's normal upload flow
- Does not infringe on the rights of any third party
- Complies with the prohibited use restrictions below

## 3. Prohibited Use

The host may not be used to store content that:

- Infringes copyright, trademark, or other intellectual property rights
- Is unlawful under the laws of Sweden or the European Union
- Contains malware or is intended to facilitate unauthorized access to any system
- Violates the privacy or personal data rights of any individual

## 4. Accountability and Traceability

Every file uploaded to this host is cryptographically associated with the identity key of the uploading party at the time of upload. This association is embedded in the on-chain advertisement token (`uploader_identity_key`) and cannot be altered after the fact. This allows the operator to identify the source of any given upload in response to a legitimate report or legal request.

## 5. Content Encryption and Privacy

Each uploaded file is encrypted to the identity key of its owner at the time of upload. Only the owner can decrypt and view the file's contents; the host stores encrypted bytes and cannot inspect what it holds. As a result, third parties cannot discover a policy violation simply by encountering the content, since it is not visible to anyone other than its owner. Enforcement of this policy therefore relies on reports from the owner, from parties the owner has shared access with, or from other legitimate channels, rather than on visual discovery by unrelated third parties.

## 6. Reporting a Violation

Anyone who believes content hosted on this service violates this policy, or infringes their rights, may report it to the operator at: [contact email to be added].

Reports should include:
- The UHRP URL of the content in question
- A description of the alleged violation
- Contact information for the reporting party

## 7. Takedown Process

Upon receiving a valid report, or at the operator's own discretion where a violation is evident, the operator will:

1. Revoke the on-chain advertisement for the affected content, so it is no longer discoverable through the UHRP network
2. Remove the underlying file from the host's storage
3. Retain a record of the takedown action for compliance purposes

Takedown actions are performed by the operator using an administrator-authenticated endpoint. Only identities explicitly authorized by the operator may perform a takedown.

UHRP is a federated storage protocol: other independent operators may host and advertise copies of the same content without this host's involvement. A takedown on this host revokes this host's advertisement and removes this host's copy; it does not affect copies independently hosted elsewhere on the network by other operators.

## 8. Retention and Availability

Files are hosted for the retention period specified at upload time. The operator makes reasonable efforts to ensure content remains available for its stated retention period, subject to this policy and applicable law.

## 9. Changes to This Policy

This policy may be updated as the service evolves. Material changes will be reflected in the "Last updated" date above.
