import fs from 'fs'
import path from 'path'
import { app } from 'electron'

import cred from '../../cred/gcred.json'

const out = path.resolve(app.getPath('userData'), 'gcred.json')
console.log(out)
fs.writeFileSync(out, JSON.stringify(cred))
process.env.GOOGLE_APPLICATION_CREDENTIALS = out