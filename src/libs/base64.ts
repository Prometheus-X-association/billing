/**
 * Encodes a string to base64.
 * @param str The string to encode.
 * @returns The base64 encoded string.
 */
export function encodeToBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}

/**
 * Decodes a base64 string.
 * @param base64Str The base64 string to decode.
 * @returns The decoded string.
 */
export function decodeFromBase64(base64Str: string): string {
  return Buffer.from(base64Str, 'base64').toString('utf-8');
}
