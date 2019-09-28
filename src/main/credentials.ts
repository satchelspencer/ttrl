import fs from 'fs'
import path from 'path'
import { app, ipcMain } from 'electron'

//import cred from '../../cred/gcred.json'

const out = path.resolve(app.getPath('userData'), 'gcred.json')
let hasCred = false

function validCred(path) {
  try {
    const raw = fs.readFileSync(path, 'utf8'),
      cred = JSON.parse(raw)
    return cred && cred.type === 'service_account' ? cred : false
  } catch (e) {
    return false
  }
}

/* check if we already have valid credentials in appData */
const current = validCred(out)
if (current) {
  hasCred = current.project_id
  process.env.GOOGLE_APPLICATION_CREDENTIALS = out
}

ipcMain.on('connect', event => {
  event.reply('credentials', hasCred)
})

ipcMain.on('setCred', (event, path: string) => {
  const cred = validCred(path)
  hasCred = cred.project_id
  if (cred) {
    fs.writeFileSync(out, JSON.stringify(cred))
    process.env.GOOGLE_APPLICATION_CREDENTIALS = out
    event.reply('credentials', hasCred)
  }
})
