import supertokens from "supertokens-node"
import Dashboard from "supertokens-node/recipe/dashboard"
import Session from "supertokens-node/recipe/session"
import ThirdParty from "supertokens-node/recipe/thirdparty"
// import EmailPassword from "supertokens-node/recipe/emailpassword"
import { initUser } from "./internal/users"
import { useEnvVar } from "./utils"


export function initSupertokens() {
    supertokens.init({
        framework: "express",
        supertokens: {
            connectionURI: useEnvVar("SUPERTOKENS_CORE_URL"),
            apiKey: useEnvVar("SUPERTOKENS_API_KEY"),
        },
        appInfo: {
            appName: useEnvVar("APP_NAME"),
            websiteDomain: useEnvVar("APP_ORIGIN"),
            apiDomain: useEnvVar("APP_ORIGIN"),
            apiBasePath: "/api/auth",
        },
        recipeList: [
            ThirdParty.init({
                signInAndUpFeature: {
                    providers: [{
                        config: {
                            thirdPartyId: "google",
                            clients: [{
                                clientId: useEnvVar("AUTH_GOOGLE_CLIENT_ID"),
                                clientSecret: useEnvVar("AUTH_GOOGLE_CLIENT_SECRET"),
                            }]
                        }
                    }],
                },
                override: {
                    functions: (originalImplementation) => ({
                        ...originalImplementation,
                        signInUp: async (input) => {
                            const res = await originalImplementation.signInUp(input)

                            // some kind of error, skip
                            if (res.status !== "OK")
                                return res

                            // just a refresh
                            if (input.session !== undefined)
                                return res

                            // new user sign up
                            if (res.createdNewRecipeUser && res.user.loginMethods.length === 1) {
                                await initUser(
                                    res.user,
                                    res.rawUserInfoFromProvider.fromUserInfoAPI!
                                )
                            }
                            // existing user sign in
                            else {
                                console.log("Existing user sign in:", res.user.emails[0])
                                // If needed: Post sign in logic
                            }
                            return res
                        }
                    })
                }
            }),
            // EmailPassword.init(),
            Session.init(),
            Dashboard.init(),
        ],
        telemetry: false,
    })
}
