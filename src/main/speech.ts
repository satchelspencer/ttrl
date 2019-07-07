import { ipcMain, BrowserWindow } from 'electron'
import speech from '@google-cloud/speech'

import './credentials'

export default function init(window: BrowserWindow) {
  const client = new speech.SpeechClient()

  let recognizeStream,
    canWrite = false,
    timeout

  function initRecStream() {
    canWrite = true
    if (recognizeStream) return

    function reset() {
      console.log('reset')
      recognizeStream.destroy()
      recognizeStream = null
      // clearTimeout(timeout)
      // timeout = setTimeout(reset, 10000)
    }

    recognizeStream = client
      .streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 8000,
          languageCode: 'en-US',
          audioChannelCount: 1,
          model: 'phone_call',
        },
        interimResults: true,
      })
      .on('error', e => {
        console.log('stream err', e)
        recognizeStream = null
      })
      .on('data', data => {
        // clearTimeout(timeout)
        // timeout = setTimeout(reset, 10000)
        const d = data.results.map(res => ({
          text: res.alternatives[0].transcript,
          final: res.isFinal,
        }))
        window.webContents.send('text', d)
      })
      .on('drain', () => {
        canWrite = true
      })
      .on('end', () => {
        console.log('stream end')
        recognizeStream = null
      })
  }

  ipcMain.on('audio', (e, arg) => {
    if (!recognizeStream) initRecStream()
    if (canWrite){
      canWrite = recognizeStream.write(arg)
    }
  })

  ipcMain.on('stop', () => {
    if (recognizeStream) {
      recognizeStream.destroy()
      recognizeStream = null
    }
  })

  return () => {}
}
