/*!
 * Copyright (c) 2025 European EPC Competence Center GmbH. All rights reserved.
 */
import * as RsaMultikey from '@eecc/rsa-multikey';

export async function createVerifier({verificationMethod}) {
  const key = await RsaMultikey.from(verificationMethod);
  const verifier = key.verifier();
  return verifier;
}

