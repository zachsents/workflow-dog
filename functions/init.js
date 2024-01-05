import admin from "firebase-admin"
import { setGlobalOptions } from "firebase-functions/v2"

admin.initializeApp()
setGlobalOptions({ maxInstances: 10 })

export const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })


export const auth = admin.auth()