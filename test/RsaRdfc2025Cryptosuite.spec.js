/*!
 * Copyright (c) 2025 European EPC Competence Center GmbH. All rights reserved.
 */
import {expect} from 'chai';

import jsigs from 'jsonld-signatures';
const {purposes: {AssertionProofPurpose}} = jsigs;

import * as RsaMultikey from '@eecc/rsa-multikey';
import {
  credential,
  initializeKeyPair
} from './mock-data.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {cryptosuite as rsaRdfc2025Cryptosuite} from '../lib/index.js';

import {loader} from './documentLoader.js';

const documentLoader = loader.build();

describe('RsaRdfc2025Cryptosuite', () => {
  let rsaMultikeyKeyPair;
  let mockPublicRsaMultikey;
  let controllerDocRsaMultikey;

  before(async () => {
    // Initialize key pair before tests
    const initialized = await initializeKeyPair();
    rsaMultikeyKeyPair = initialized.rsaMultikeyKeyPair;
    mockPublicRsaMultikey = initialized.mockPublicRsaMultikey;
    controllerDocRsaMultikey = initialized.controllerDocRsaMultikey;

    // Update document loader with key pair data
    loader.addStatic(
      rsaMultikeyKeyPair.controller,
      controllerDocRsaMultikey
    );
    loader.addStatic(
      mockPublicRsaMultikey.id,
      mockPublicRsaMultikey
    );
  });

  describe('exports', () => {
    it('it should have proper exports', async () => {
      expect(rsaRdfc2025Cryptosuite).to.exist;
      expect(rsaRdfc2025Cryptosuite.name).to.equal('rsa-rdfc-2025');
      expect(rsaRdfc2025Cryptosuite.requiredAlgorithm).to.eql(['PS256']);
      expect(rsaRdfc2025Cryptosuite.canonize).to.be.a('function');
      expect(rsaRdfc2025Cryptosuite.createVerifier).to.be.a('function');
    });
  });

  describe('canonize()', () => {
    it('should canonize using RDFC-1.0 w/ n-quads', async () => {
      const unsignedCredential = JSON.parse(JSON.stringify(credential));

      let result;
      let error;
      try {
        result = await rsaRdfc2025Cryptosuite.canonize(
          unsignedCredential, {documentLoader});
      } catch(e) {
        console.log('e', e);
        error = e;
      }

      expect(error).to.not.exist;
      expect(result).to.exist;
      /* eslint-disable max-len */
      const expectedResult = `<http://example.edu/credentials/1872> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org#AlumniCredential> .
<http://example.edu/credentials/1872> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://www.w3.org/2018/credentials#VerifiableCredential> .
<http://example.edu/credentials/1872> <https://www.w3.org/2018/credentials#credentialSubject> <https://example.edu/students/alice> .
<http://example.edu/credentials/1872> <https://www.w3.org/2018/credentials#issuanceDate> "2010-01-01T19:23:24Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<http://example.edu/credentials/1872> <https://www.w3.org/2018/credentials#issuer> <https://example.edu/issuers/565049> .
<https://example.edu/students/alice> <https://schema.org#alumniOf> "Example University" .\n`;
      /* eslint-enable max-len */
      result.should.equal(expectedResult);
    });
  });

  describe('createVerifier()', () => {
    it('should create a verifier with RSA Multikey', async () => {
      let verifier;
      let error;
      try {
        const keyPair = await RsaMultikey.from({...rsaMultikeyKeyPair});
        verifier = await rsaRdfc2025Cryptosuite.createVerifier({
          verificationMethod: keyPair
        });
      } catch(e) {
        error = e;
      }

      expect(error).to.not.exist;
      expect(verifier).to.exist;
      verifier.algorithm.should.equal('PS256');
      expect(verifier.id).to.exist;
      verifier.verify.should.be.a('function');
    });
  });

  describe('sign()', () => {
    it('should sign a document', async () => {
      const unsignedCredential = JSON.parse(JSON.stringify(credential));
      const keyPair = await RsaMultikey.from({...rsaMultikeyKeyPair});
      const date = '2023-03-01T21:29:24Z';
      const suite = new DataIntegrityProof({
        signer: keyPair.signer(), date, cryptosuite: rsaRdfc2025Cryptosuite
      });

      let error;
      try {
        await jsigs.sign(unsignedCredential, {
          suite,
          purpose: new AssertionProofPurpose(),
          documentLoader
        });
      } catch(e) {
        error = e;
      }

      expect(error).to.not.exist;
    });

    it('should fail to sign with incorrect signer algorithm', async () => {
      const keyPair = await RsaMultikey.from({...rsaMultikeyKeyPair});
      const date = '2023-03-01T21:29:24Z';
      const signer = keyPair.signer();
      signer.algorithm = 'wrong-algorithm';

      let error;
      try {
        new DataIntegrityProof({
          signer, date, cryptosuite: rsaRdfc2025Cryptosuite
        });
      } catch(e) {
        error = e;
      }

      const errorMessage = `The signer's algorithm "${signer.algorithm}" ` +
        `is not a supported algorithm for the cryptosuite. The supported ` +
        `algorithms are: ` +
        `"${rsaRdfc2025Cryptosuite.requiredAlgorithm.join(', ')}".`;

      expect(error).to.exist;
      expect(error.message).to.equal(errorMessage);
    });
  });

  describe('verify()', () => {
    let signedCredential;

    before(async () => {
      const unsignedCredential = JSON.parse(JSON.stringify(credential));

      const keyPair = await RsaMultikey.from({...rsaMultikeyKeyPair});
      const date = '2023-03-01T21:29:24Z';
      const suite = new DataIntegrityProof({
        signer: keyPair.signer(), date, cryptosuite: rsaRdfc2025Cryptosuite
      });

      signedCredential = await jsigs.sign(unsignedCredential, {
        suite,
        purpose: new AssertionProofPurpose(),
        documentLoader
      });
    });

    it('should verify a document', async () => {
      const suite = new DataIntegrityProof({
        cryptosuite: rsaRdfc2025Cryptosuite
      });
      const result = await jsigs.verify(signedCredential, {
        suite,
        purpose: new AssertionProofPurpose(),
        documentLoader
      });

      expect(result.verified).to.be.true;
    });

    it('should fail verification if "proofValue" is not string', async () => {
      const suite = new DataIntegrityProof({
        cryptosuite: rsaRdfc2025Cryptosuite
      });
      const signedCredentialCopy =
        JSON.parse(JSON.stringify(signedCredential));
      // intentionally modify proofValue type to not be string
      signedCredentialCopy.proof.proofValue = {};

      const result = await jsigs.verify(signedCredentialCopy, {
        suite,
        purpose: new AssertionProofPurpose(),
        documentLoader
      });

      const {error} = result.results[0];

      expect(result.verified).to.be.false;
      expect(error.name).to.equal('TypeError');
      expect(error.message).to.equal(
        'The proof does not include a valid "proofValue" property.'
      );
    });
  });
});

