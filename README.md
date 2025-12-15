# RSA RDFC 2025 Data Integrity Cryptosuite _(@eecc/rsa-rdfc-2025-cryptosuite)_

> RSA RDFC 2025 Data Integrity Cryptosuite for use with jsonld-signatures compatible with digitalbazaar DataIntegrityProof

## ⚠️ Warning

**This cryptosuite (`rsa-rdfc-2025`) is NOT standardized.** It is an experimental implementation based on the ECDSA RDFC 2019 cryptosuite pattern, adapted for RSA keys using PS256 (RSA-PSS with SHA-256). Use at your own risk and be aware that:

- The specification may change without notice
- It should not be used in production systems without careful consideration

## Table of Contents

- [RSA RDFC 2025 Data Integrity Cryptosuite _(@eecc/rsa-rdfc-2025-cryptosuite)_](#rsa-rdfc-2025-data-integrity-cryptosuite-eeccrsa-rdfc-2025-cryptosuite)
  - [⚠️ Warning](#️-warning)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Security](#security)
  - [Install](#install)
  - [Usage](#usage)
  - [Contribute](#contribute)
  - [License](#license)

## Background

For use with https://github.com/digitalbazaar/jsonld-signatures v11.0 and above.

This cryptosuite implements RSA-PSS with SHA-256 (PS256) for Data Integrity proofs,
compatible with the [rsa-multikey](https://github.com/european-epc-competence-center/rsa-multikey)
library and with [digitalbazaar DataIntegrityProof](https://github.com/digitalbazaar/data-integrity).

See also related specs:

* [Verifiable Credential Data Integrity](https://w3c.github.io/vc-data-integrity/)

## Security

TBD

## Install

- Browsers and Node.js 18+ are supported.

To install from NPM:

```
npm install @eecc/rsa-rdfc-2025-cryptosuite
```

To install locally (for development):

```
git clone https://github.com/european-epc-competence-center/rsa-rdfc-2025-cryptosuite.git
cd rsa-rdfc-2025-cryptosuite
npm install
```

## Usage

The following code snippet provides a complete example of digitally signing
a verifiable credential using this library:

```javascript
import * as RsaMultikey from '@eecc/rsa-multikey';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {cryptosuite as rsaRdfc2025Cryptosuite} from
  '@eecc/rsa-rdfc-2025-cryptosuite';
import jsigs from 'jsonld-signatures';
const {purposes: {AssertionProofPurpose}} = jsigs;


// create the unsigned credential
const unsignedCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      AlumniCredential: 'https://schema.org#AlumniCredential',
      alumniOf: 'https://schema.org#alumniOf'
    }
  ],
  id: 'http://example.edu/credentials/1872',
  type: [ 'VerifiableCredential', 'AlumniCredential' ],
  issuer: 'https://example.edu/issuers/565049',
  issuanceDate: '2010-01-01T19:23:24Z',
  credentialSubject: {
    id: 'https://example.edu/students/alice',
    alumniOf: 'Example University'
  }
};

// create the keypair to use when signing
const controller = 'https://example.edu/issuers/565049';
const keyPair = await RsaMultikey.generate({
  controller,
  modulusLength: 2048 // or 3072, 4096
});

// export public key and add to document loader
const publicKey = await keyPair.export({publicKey: true, includeContext: true});
addDocumentToLoader({url: publicKey.id, document: publicKey});

// create key's controller document
const controllerDoc = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/multikey/v1'
  ],
  id: controller,
  assertionMethod: [publicKey]
};
addDocumentToLoader({url: controllerDoc.id, document: controllerDoc});

// create suite
const suite = new DataIntegrityProof({
  signer: keyPair.signer(), cryptosuite: rsaRdfc2025Cryptosuite
});

// create signed credential
const signedCredential = await jsigs.sign(unsignedCredential, {
  suite,
  purpose: new AssertionProofPurpose(),
  documentLoader
});

// results in the following signed VC
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "AlumniCredential": "https://schema.org#AlumniCredential",
      "alumniOf": "https://schema.org#alumniOf"
    },
    "https://w3id.org/security/data-integrity/v2"
  ],
  "id": "http://example.edu/credentials/1872",
  "type": [
    "VerifiableCredential",
    "AlumniCredential"
  ],
  "issuer": "https://example.edu/issuers/565049",
  "issuanceDate": "2010-01-01T19:23:24Z",
  "credentialSubject": {
    "id": "https://example.edu/students/alice",
    "alumniOf": "Example University"
  },
  "proof": {
    "type": "DataIntegrityProof",
    "created": "2023-03-01T21:29:24Z",
    "verificationMethod": "https://example.edu/issuers/565049#<multibase-public-key>",
    "cryptosuite": "rsa-rdfc-2025",
    "proofPurpose": "assertionMethod",
    "proofValue": "<multibase-signature>"
  }
}
```

## Contribute

PRs accepted.

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[New BSD License (3-clause)](LICENSE) © 2025 European EPC Competence Center GmbH

