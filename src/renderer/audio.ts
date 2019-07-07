import { ipcRenderer } from 'electron'

navigator.mediaDevices
  .getUserMedia({
    audio: true,
  })
  .then(startRecording)
  .catch(e => console.log(e))

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

function startRecording(stream: MediaStream) {
  const audioContext = new AudioContext({})

  const microphone = audioContext.createMediaStreamSource(stream),
    scriptProcessor = audioContext.createScriptProcessor(2048, 2, 2)

  microphone.connect(scriptProcessor)
  scriptProcessor.connect(audioContext.destination)
  scriptProcessor.addEventListener('audioprocess', streamAudioData)
}

const c = Math.pow(2, 15)
const streamAudioData = (e: any) => {
  const floatSamples = resample(e.inputBuffer.getChannelData(0), 44100, 8000)
  const arr = Int16Array.from(floatSamples.map(n => n * c))
  ipcRenderer.send('audio', arr)
}

ipcRenderer.on('text', (e, text) => {
  console.log('AUIUH', text)
})