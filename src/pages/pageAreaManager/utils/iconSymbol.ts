export const IconSymbol = {
  plus: (x: number, y: number, r: number) => [
    ['M', x - r + 4, y],
    ['L', x - r + 2 * r - 4, y],
    ['M', x - r + r, y - r + 4],
    ['L', x, y + r - 4],
  ],

  delete: () => (x: number, y: number, r: number) => [
    ['M', x, y - 0.75 * r],
    ['L', x, y - 0.5 * r],
    ['M', x - 0.75 * r, y - 0.5 * r],
    ['L', x + 0.75 * r, y - 0.5 * r],
    ['M', x - 0.5 * r, y - 0.5 * r],
    ['L', x - 0.5 * r, y + 0.75 * r],
    ['L', x + 0.5 * r, y + 0.75 * r],
    ['L', x + 0.5 * r, y - 0.5 * r],
    ['M', x - 0.25 * r, y - 0.25 * r],
    ['L', x - 0.25 * r, y + 0.5 * r],
    ['M', x, y - 0.25 * r],
    ['L', x, y + 0.5 * r],
    ['M', x + 0.25 * r, y - 0.25 * r],
    ['L', x + 0.25 * r, y + 0.5 * r],
  ],
}

export const symbolPlus = (x: number, y: number, r: number) => [
  ['M', x - r + 4, y],
  ['L', x - r + 2 * r - 4, y],
  ['M', x - r + r, y - r + 4],
  ['L', x, y + r - 4],
]

export const symbolDelete = (x: number, y: number, r: number) => [
  ['M', x, y - 0.75 * r],
  ['L', x, y - 0.5 * r],
  ['M', x - 0.75 * r, y - 0.5 * r],
  ['L', x + 0.75 * r, y - 0.5 * r],
  ['M', x - 0.5 * r, y - 0.5 * r],
  ['L', x - 0.5 * r, y + 0.75 * r],
  ['L', x + 0.5 * r, y + 0.75 * r],
  ['L', x + 0.5 * r, y - 0.5 * r],
  ['M', x - 0.25 * r, y - 0.25 * r],
  ['L', x - 0.25 * r, y + 0.5 * r],
  ['M', x, y - 0.25 * r],
  ['L', x, y + 0.5 * r],
  ['M', x + 0.25 * r, y - 0.25 * r],
  ['L', x + 0.25 * r, y + 0.5 * r],
]
