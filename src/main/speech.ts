import { ipcMain, BrowserWindow } from 'electron'
import speech from '@google-cloud/speech'

import './credentials'

export default function init(window: BrowserWindow) {
  let recognizeStream,
    canWrite = false,
    timeout,
    lastSentResults = null

  function initRecStream() {
    const client = new speech.SpeechClient()
    console.log('init')
    canWrite = true
    if (recognizeStream) return

    function cleanup() {
      console.log('cleanup')
      recognizeStream = null
      if(lastSentResults){
        const interim = lastSentResults.filter(d => !d.final).map(d => ({...d, final: true}))
        window.webContents.send('text', interim)
      }
    }

    recognizeStream = client
      .streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 8000,
          languageCode: 'en-US',
          audioChannelCount: 1,
          //model: 'phone_call',
        },
        interimResults: true,
      })
      .on('error', e => {
        console.log('stream err', e)
        cleanup()
      })
      .on('data', data => {
        const d = data.results.map(res => {
          return {
            text: res.alternatives[0].transcript,
            final: res.isFinal,
          }
        })
        lastSentResults = d
        window.webContents.send('text', d)
      })
      .on('drain', () => {
        canWrite = true
      })
      .on('end', () => {
        console.log('stream end')
        cleanup()
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
      console.log('sstop')
      recognizeStream.destroy()
      recognizeStream = null
    }
  })

  return () => {}
}
