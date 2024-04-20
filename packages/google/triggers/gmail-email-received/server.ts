import { createServerTriggerDefinition } from "@pkg/types"
import { google } from "googleapis"
import { getAuth, parent, safeId } from "@web/lib/server/google"
import shared from "./shared"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"


const GmailPubSubTopic = parent("topics/trigger-gmail-email-received", false)

const schedulerJobId = (accountId: string) => parent(`jobs/${safeId(`gmail_inbox_watch_${accountId}`)}`)


export default createServerTriggerDefinition(shared, {
    onChange: async (oldTrigger, newTrigger, workflowId) => {

        const supabase = await supabaseServerAdmin()

        const oldAccountId = oldTrigger?.config?.googleAccount
        const newAccountId = newTrigger?.config?.googleAccount

        if (oldAccountId === newAccountId)
            return

        const gmail = google.gmail("v1")
        const scheduler = google.cloudscheduler({
            version: "v1",
            auth: getAuth(),
        })

        async function handleOldAccount() {
            if (!oldAccountId)
                return

            const areOtherWorkflowsUsingThisAccount = await supabase
                .from("workflows")
                .select("*", { count: "exact", head: true })
                .eq("trigger->>type", "https://triggers.workflow.dog/google/gmail-email-received")
                .eq("trigger->config->>googleAccount", oldAccountId)
                .neq("id", workflowId)
                .throwOnError()
                .then(q => q.count! > 0)

            if (areOtherWorkflowsUsingThisAccount)
                return

            async function stopWatch() {
                const token = await getServiceAccountToken(supabase, oldAccountId) as { access_token: string } | null
                await gmail.users.stop({
                    userId: "me",
                    access_token: token?.access_token!,
                })
            }

            await Promise.all([
                stopWatch(),
                scheduler.projects.locations.jobs.delete({
                    name: schedulerJobId(oldAccountId),
                }),
            ])
        }

        async function handleNewAccount() {
            if (!newAccountId)
                return

            async function startWatch() {
                const token = await getServiceAccountToken(supabase, newAccountId) as { access_token: string } | null
                const { data: { historyId } } = await gmail.users.watch({
                    userId: "me",
                    requestBody: {
                        labelIds: ["INBOX"],
                        labelFilterBehavior: "include",
                        topicName: GmailPubSubTopic,
                    },
                    access_token: token?.access_token!,
                })
                return historyId
            }

            const [historyId] = await Promise.all([
                startWatch(),
                scheduler.projects.locations.jobs.create({
                    parent: parent(""),
                    requestBody: {
                        name: schedulerJobId(newAccountId),
                        description: `Gmail Inbox Watch for Google Account: ${newAccountId}`,
                        schedule: "0 0 * * *",
                        httpTarget: {
                            uri: `${process.env.NEXT_PUBLIC_API_URL}/internal/gmail-inbox-refresh-watch`,
                            httpMethod: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: Buffer.from(JSON.stringify({
                                serviceAccountId: newAccountId,
                            })).toString("base64"),
                        },
                    },
                }).catch(err => {
                    if (!err.message.includes("already exists"))
                        throw err
                    console.debug("Job already exists, skipping creation.", newAccountId)
                }),
            ])

            return { historyId }
        }

        const [returnData] = await Promise.all([
            handleNewAccount(),
            handleOldAccount(),
        ])

        return returnData || {}
    },
})
