import { ipcMain, BrowserWindow } from 'electron'
import speech from '@google-cloud/speech'

import './credentials'

export default function init(window: BrowserWindow) {
  const client = new speech.SpeechClient()

  const recognizeStream = client
    .streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
        audioChannelCount: 1,
      },
      interimResults: true,
    })
    .on('error', console.error)
    .on('data', data => {
      const d = data.results.map(res => ({
        text: res.alternatives[0].transcript,
        final: res.isFinal,
      }))
      window.webContents.send('text', d)
    })
    .on('end', () => {
      console.log('end')
    })

  ipcMain.on('audio', (e, arg) => {
    recognizeStream.write(arg)
  })

  return () => {

  }
}
