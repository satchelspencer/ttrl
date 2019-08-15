import { ipcRenderer } from 'electron'

function resample(buffer: any, fromSampleRate: any, toSampleRate: any) {
  const frac = fromSampleRate / toSampleRate,
    newLength = Math.floor(buffer.length / frac),
    result = new Float32Array(newLength)

  let oindex = 0,
    iIndex = 0
  while (oindex < result.length) {
    const nextiIndex = Math.floor((oindex + 1) * frac)
    let sum = 0,
      count = 0
    for (var i = iIndex; i < nextiIndex && i < buffer.length; i++) {
      sum += buffer[i]
      count++
    }
    result[oindex] = sum / count
    oindex++
    iIndex = nextiIndex
  }
  return result
}

const audioContext = new AudioContext({}),
  c = Math.pow(2, 15)

let active = false,
  currentStream = null

function init(deviceId: string) {
  if (currentStream) currentStream.getTracks().forEach(track => track.stop())
  navigator.mediaDevices
    .getUserMedia({
      audio: {deviceId : deviceId?{exact: deviceId}:undefined},
    })
    .then((stream: MediaStream) => {
      currentStream = stream
      const microphone = audioContext.createMediaStreamSource(stream),
        scriptProcessor = audioContext.createScriptProcessor(2048, 2, 2)

      microphone.connect(scriptProcessor)
      scriptProcessor.connect(audioContext.destination)
      scriptProcessor.addEventListener('audioprocess', (e: any) => {
        if (!active) return
        const floatSamples = resample(e.inputBuffer.getChannelData(0), 44100, 8000)
        const arr = Int16Array.from(floatSamples.map(n => n * c))
        ipcRenderer.send('audio', arr)
      })
    })
    .catch(e => console.log(e))
}

let cb: any = null
ipcRenderer.on('text', (e, text) => {
  cb && cb(text)
})

export default function listen(deviceId: string, callback: (text: any) => void) {
  init(deviceId)
  active = true
  cb = callback
  return () => {
    active = false
    ipcRenderer.send('stop')
  }
}
