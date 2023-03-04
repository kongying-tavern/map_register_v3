interface IntervalPayload {
  name: string
  interval?: number
  action: 'set' | 'clear'
}

const missionMap: Record<string, number> = {}

self.onmessage = ({ data }: MessageEvent<string>) => {
  const { name, interval = 1000, action } = JSON.parse(data) as IntervalPayload

  if (action === 'set') {
    missionMap[name] = self.setInterval(() => {
      self.postMessage(name)
    }, interval)
  }
  else if (action === 'clear') {
    self.clearInterval(missionMap[name])
    delete missionMap[name]
  }
}
