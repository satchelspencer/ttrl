import { app, BrowserWindow, dialog } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import contextMenu from 'electron-context-menu'

contextMenu({
  showInspectElement: true,
})

import initSpeech from './speech'
import './svgo'

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: any = null

dialog.showErrorBox = (title, content) => console.log('err', title, content)

function createMainWindow() {
  const window = new BrowserWindow({
      width: 1280,
      height: 800,
    
      webPreferences: { nodeIntegration: true },
    }),
    windowUrl = isDevelopment
      ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
      : formatUrl({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file',
          slashes: true,
        })

  if (isDevelopment) window.webContents.openDevTools({ mode: 'detach' })

  window.loadURL(windowUrl)
  const destroySpeech = initSpeech(window)
  window.on('closed', () => {
    mainWindow = null
    destroySpeech()
  })
  
  return window
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) mainWindow = createMainWindow()
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
