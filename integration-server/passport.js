import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import passport from "passport"
import { getSecret } from "./secrets.js"
import { upsertIntegrationAccount, getIntegrationAccount, addAccountToTeam } from "./db.js"
import { callbackUrl } from "./callback.js"
import { google } from "googleapis"


export async function setupStrategies() {
    passport.serializeUser((user, callback) => {
        if (!user?.id)
            return callback("User does not have an id", null)

        callback(null, user.id)
    })

    passport.deserializeUser((id, callback) => {
        getIntegrationAccount(id)
            .then(account => callback(null, account))
            .catch(err => {
                console.error(err)
                callback(null, null)
            })
    })

    await Promise.all([
        setupGoogleStrategy(),
    ])
}


async function setupGoogleStrategy() {
    const [clientID, clientSecret] = await Promise.all([
        await getSecret("INTEGRATION_GOOGLE_CLIENT_ID"),
        await getSecret("INTEGRATION_GOOGLE_CLIENT_SECRET"),
    ])

    passport.use(new GoogleStrategy({
        clientID,
        clientSecret,
        callbackURL: callbackUrl("google"),
        state: true,
        passReqToCallback: true,
    }, async (req, accessToken, refreshToken, profile, callback) => {

        const tokenInfo = await new google.auth.OAuth2({
            clientId: clientID,
            clientSecret,
        }).getTokenInfo(accessToken)

        const account = await upsertIntegrationAccount(profile.provider, {
            displayName: profile.emails[0].value,
            accessToken,
            refreshToken,
            serviceUserId: profile.id,
            profile,
            scopes: tokenInfo.scopes,
        }).catch(err => callback(err, null))

        await addAccountToTeam(account.id, req.session.teamId)
            .catch(err => callback(err, null))

        callback(null, account)
    }))
}