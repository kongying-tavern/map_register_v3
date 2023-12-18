export const getDigest = async (data: Blob, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-1') => {
  const digestBuffer = await crypto.subtle.digest(algorithm, await data.arrayBuffer())
  return [...new Uint8Array(digestBuffer)].map(num => num.toString(16).padStart(2, '0')).join('')
}
