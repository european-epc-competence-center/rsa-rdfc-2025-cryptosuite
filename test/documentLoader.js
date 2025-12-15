/*!
 * Copyright (c) 2025 European EPC Competence Center GmbH. All rights reserved.
 */
import * as didMethodKey from '@digitalbazaar/did-method-key';
import * as RsaMultikey from '@eecc/rsa-multikey';
import {CachedResolver} from '@digitalbazaar/did-io';
import dataIntegrityContext from '@digitalbazaar/data-integrity-context';
import multikeyContext from '@digitalbazaar/multikey-context';
import {securityLoader} from '@digitalbazaar/security-document-loader';
// eslint-disable-next-line sort-imports
import {citizenshipV4RC1Context} from './mock-data.js';

export const loader = securityLoader();

// Set up DID resolver for did:key: URIs (only RSA support needed)
const resolver = new CachedResolver();
const didKeyDriver = didMethodKey.driver();
// Register RSA multikey support for did:key: resolution
// Note: We only register RSA, not x25519 or other key types
didKeyDriver.use({
  multibaseMultikeyHeader: 'z', // RSA multikey header
  fromMultibase: RsaMultikey.from
});
resolver.use(didKeyDriver);
loader.setDidResolver(resolver);

// Note: Static documents will be added in test setup after key generation

loader.addStatic(
  dataIntegrityContext.constants.CONTEXT_URL,
  dataIntegrityContext.contexts.get(dataIntegrityContext.constants.CONTEXT_URL)
);

loader.addStatic(
  multikeyContext.constants.CONTEXT_URL,
  multikeyContext.contexts.get(multikeyContext.constants.CONTEXT_URL)
);

loader.addStatic(
  'https://www.w3.org/ns/credentials/examples/v2',
  {
    '@context': {
      '@vocab': 'https://www.w3.org/ns/credentials/examples#'
    }
  });

loader.addStatic(
  'https://w3id.org/citizenship/v4rc1',
  citizenshipV4RC1Context);

