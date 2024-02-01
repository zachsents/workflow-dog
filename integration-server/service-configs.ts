import { getSecret } from "./secrets.js"
import merge from "lodash.merge"


/* -------------------------------------------------------------------------- */
/*                                   Configs                                  */
/* -------------------------------------------------------------------------- */

const serviceConfigs = await createConfigs({
    google: {
        grantConfig: {
            scope: ["email", "profile"],
            custom_params: {
                access_type: "offline",
                include_granted_scopes: true,
            },
            dynamic: ["scope"],
        },
        getDisplayName: (profile: any) => profile.email,
        getServiceUserId: (profile: any) => profile.sub,
    },
    close: {
        grantConfig: {
            authorize_url: "https://api.close.com/oauth2/authorize",
            access_url: "https://api.close.com/oauth2/token",
            oauth: 2,
            scope: ["all.full_access", "offline_access"],
        },
        getDisplayName: (profile: any) => "test",
        getServiceUserId: (profile: any) => "test",
    },
})

export default serviceConfigs
export const grantConfigs = generateGrantConfigs(serviceConfigs)


/* --------------------------------- Utility -------------------------------- */

async function createConfigs(configs: Record<string, any>) {
    const promiseEntries = Object.entries(configs).map(async ([name, config]) => {

        const [clientId, clientSecret] = await Promise.all([
            await getSecret(`INTEGRATION_${name.toUpperCase()}_CLIENT_ID`),
            await getSecret(`INTEGRATION_${name.toUpperCase()}_CLIENT_SECRET`),
        ])

        return [name, merge({
            name,
            clientId,
            clientSecret,
            grantConfig: {
                key: clientId,
                secret: clientSecret,
            },
        }, config)]
    })

    return Object.fromEntries(await Promise.all(promiseEntries))
}

function generateGrantConfigs(configs: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(configs).map(([name, config]) => [name, config.grantConfig])
    )
}