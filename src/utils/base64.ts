export const base64ToUint8Array = (base64: string) => {
  if (!base64)
    return new Uint8Array()
  const binString = decodeURIComponent(atob(base64))
  const binLen = binString.length
  const binArr = new Uint8Array(binLen)
  for (let i = 0; i < binLen; i++)
    binArr[i] = binString.charCodeAt(i)
  return binArr
}

export const uint8ArrayToBase64 = (data: Uint8Array) => {
  if (!data || !data.byteLength)
    return ''
  return btoa(String.fromCharCode(...data))
}
