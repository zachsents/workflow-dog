import supertokens from "supertokens-node"
import Dashboard from "supertokens-node/recipe/dashboard"
import Session from "supertokens-node/recipe/session"
import ThirdParty from "supertokens-node/recipe/thirdparty"
// import EmailPassword from "supertokens-node/recipe/emailpassword"
import { db } from "./db"
import { resend } from "./resend"
import { useEnvVar } from "./utils"
import { createProject } from "./internal/projects"


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
            Session.init(),
            Dashboard.init(),
            ThirdParty.init({
                signInAndUpFeature: {
                    providers: [{
                        config: {
                            thirdPartyId: "google",
                            clients: [{
                                clientId: useEnvVar("AUTH_GOOGLE_CLIENT_ID"),
                                clientSecret: useEnvVar("AUTH_GOOGLE_CLIENT_SECRET"),
                                scope: ["profile", "email"],
                            }],
                        },
                    }],
                },
                override: {
                    functions: (originalImplementation) => ({
                        ...originalImplementation,
                        signInUp: async (input) => {
                            const res = await originalImplementation.signInUp(input)
                            const hasError = res.status !== "OK"
                            const isRefresh = input.session !== undefined

                            if (hasError || isRefresh)
                                return res

                            const isNewUser = res.createdNewRecipeUser && res.user.loginMethods.length === 1
                            const profile = res.rawUserInfoFromProvider.fromUserInfoAPI
                            const firstName: string | undefined = profile?.given_name ?? profile?.first_name
                            const lastName: string | undefined = profile?.family_name ?? profile?.last_name
                            const email: string | undefined = profile?.email ?? res.user.emails[0]

                            const tasks: Promise<any>[] = []

                            const userMetadataPromise = db.insertInto("user_meta").values({
                                id: res.user.id,
                                email,
                                first_name: firstName,
                                last_name: lastName,
                                name: profile?.name,
                                picture: profile?.picture,
                            }).onConflict(oc => oc.column("id").doUpdateSet(eb => ({
                                email: eb.ref("excluded.email"),
                                first_name: eb.ref("excluded.first_name"),
                                last_name: eb.ref("excluded.last_name"),
                                name: eb.ref("excluded.name"),
                                picture: eb.ref("excluded.picture"),
                            }))).executeTakeFirstOrThrow()
                            tasks.push(userMetadataPromise)

                            if (isNewUser) {
                                console.log("New user sign up:", email || "<unknown email>")

                                // Create starter project
                                const dbPromise = userMetadataPromise.then(() => db.transaction().execute(async trx => {
                                    let nameForProject: string | undefined = firstName ?? profile?.name
                                    if (nameForProject)
                                        nameForProject += nameForProject.endsWith("s") ? "'" : "'s"

                                    await createProject({
                                        name: `${nameForProject || "My"} Project`,
                                        creator: res.user.id,
                                    }, {
                                        dbHandle: trx,
                                    })
                                }))
                                tasks.push(dbPromise)

                                // Add user to resend list
                                if (email) {
                                    const resendPromise = resend.contacts.create({
                                        email, firstName, lastName,
                                        audienceId: useEnvVar("RESEND_GENERAL_AUDIENCE_ID"),
                                    })
                                    tasks.push(resendPromise)
                                }
                                else console.warn(`No email provided for new user sign up (User ID: ${res.user.id})`)
                            }
                            else {
                                console.log("Existing user sign in:", email || "<unknown email>")
                            }

                            await Promise.all(tasks)
                            return res
                        },
                    }),
                },
            }),
            // EmailPassword.init(),
        ],
        telemetry: false,
    })
}
