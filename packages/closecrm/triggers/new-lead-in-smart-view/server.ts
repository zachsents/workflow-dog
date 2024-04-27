import { createServerTriggerDefinition } from "@pkg/types"
import { google } from "googleapis"
import { getAuth, parent, safeId } from "@web/lib/server/google"
import shared from "./shared"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { getClient, produceHash, querySmartView } from "@pkg/closecrm/lib"


const schedulerJobId = (smartViewId: string) => parent(`jobs/${safeId(`closecrm_smartview_poll_${smartViewId}`)}`)


export default createServerTriggerDefinition(shared, {
    onChange: async (oldTrigger, newTrigger, workflowId) => {

        const supabase = await supabaseServerAdmin()

        const oldAccountId = oldTrigger?.config?.closeAccount
        const oldSmartViewId = oldTrigger?.config?.smartViewId
        const newAccountId = newTrigger?.config?.closeAccount
        const newSmartViewId = newTrigger?.config?.smartViewId

        if (oldSmartViewId === newSmartViewId && oldAccountId === newAccountId)
            return

        const scheduler = google.cloudscheduler({
            version: "v1",
            auth: getAuth(),
        })

        async function handleOld() {
            if (!oldAccountId || !oldSmartViewId)
                return

            const areOtherWorkflowsUsingThisSmartView = await supabase
                .from("workflows")
                .select("*", { count: "exact", head: true })
                .eq("trigger->>type", "https://triggers.workflow.dog/closecrm/new-lead-in-smart-view")
                .eq("trigger->config->>smartViewId", oldSmartViewId)
                .neq("id", workflowId)
                .throwOnError()
                .then(q => q.count! > 0)

            if (areOtherWorkflowsUsingThisSmartView)
                return

            await scheduler.projects.locations.jobs.delete({
                name: schedulerJobId(oldSmartViewId),
            })
        }

        async function handleNew() {
            if (!newAccountId || !newSmartViewId)
                return

            const token = await getServiceAccountToken(supabase, newAccountId) as any
            const close = getClient(token.key)

            const leadIds = await querySmartView(close, newSmartViewId)
            const historyId = `closecrm_smartview_poll_${produceHash(leadIds)}`

            await Promise.all([
                scheduler.projects.locations.jobs.create({
                    parent: parent(""),
                    requestBody: {
                        name: schedulerJobId(newSmartViewId),
                        description: `CloseCRM Smart View Poll for Smart View ID: ${newSmartViewId}`,
                        // every 5 minutes
                        schedule: "*/5 * * * *",
                        httpTarget: {
                            uri: `${process.env.NEXT_PUBLIC_API_URL}/internal/closecrm-poll-smart-view`,
                            httpMethod: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: Buffer.from(JSON.stringify({
                                smartViewId: newSmartViewId,
                            })).toString("base64"),
                        },
                    },
                }).catch(err => {
                    if (!err.message.includes("already exists"))
                        throw err
                    console.debug("Job already exists, skipping creation.", newAccountId)
                }),
                supabase
                    .from("kv")
                    .insert({
                        key: historyId,
                        value: { smartViewId: newSmartViewId, leadIds },
                    })
            ])

            return { historyId }
        }

        const [returnData] = await Promise.all([
            handleNew(),
            handleOld(),
        ])

        return returnData || {}
    },
})
