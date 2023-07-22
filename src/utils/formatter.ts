export const urlFormatter = (_: unknown, __: unknown, url = '') => decodeURIComponent(url)

export const timeFormatter = (_: unknown, __: unknown, time = '') => new Date(time).toLocaleString()
