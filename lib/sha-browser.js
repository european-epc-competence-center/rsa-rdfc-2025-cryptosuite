/*
 * Copyright (c) 2025 European EPC Competence Center GmbH. All rights reserved.
 */
/* eslint-env browser */
const crypto = self && (self.crypto || self.msCrypto);

/**
 * Hashes a string of data using SHA-256.
 *
 * @param {object} options - The options to use.
 * @param {string} options.algorithm - The algorithm to use
 *   (should be SHA-256 for PS256).
 * @param {string} options.string - The string to hash.
 *
 * @returns {Uint8Array} The hash digest.
 */
export async function sha({algorithm, string}) {
  // PS256 uses SHA-256, so we only support SHA-256
  if(algorithm !== 'SHA-256') {
    throw new Error(
      `Unsupported algorithm "${algorithm}". ` +
      'PS256 only supports SHA-256.');
  }
  const bytes = new TextEncoder().encode(string);
  return new Uint8Array(await crypto.subtle.digest(algorithm, bytes));
}

