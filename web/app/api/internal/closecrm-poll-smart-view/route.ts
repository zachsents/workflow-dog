import { getClient, produceHash, querySmartView } from "@pkg/closecrm/lib"
import { errorResponse } from "@web/lib/server/router"
import { getServiceAccountToken } from "@web/lib/server/service-accounts"
import { supabaseServerAdmin } from "@web/lib/server/supabase"
import axios from "axios"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"


export async function POST(req: NextRequest) {
    const validation = bodySchema.safeParse(await req.json())
    if (!validation.success)
        return errorResponse("Invalid request body", 400)

    const { smartViewId } = validation.data

    const supabase = await supabaseServerAdmin()

    const matchingWorkflows = await supabase
        .from("workflows")
        .select("id, trigger->config->>closeAccount, trigger->data->>historyId")
        .eq("trigger->config->>smartViewId", smartViewId)
        .eq("trigger->>type", "https://triggers.workflow.dog/closecrm/new-lead-in-smart-view")
        .throwOnError()
        .then(q => q.data)

    if (!matchingWorkflows || matchingWorkflows.length === 0)
        return errorResponse("No matching workflows found", 404)

    const serviceAccountId = matchingWorkflows[0].closeAccount

    const token = await getServiceAccountToken(supabase, serviceAccountId) as { key: string } | null

    if (!token)
        return errorResponse("Service account token not found", 404)

    const close = getClient(token.key)
    const currentLeadIds = await querySmartView(close, smartViewId)
    const currentHistoryId = `closecrm_smartview_poll_${produceHash(currentLeadIds)}`

    const workflowsWithDifferences = matchingWorkflows
        .filter(w => w.historyId !== currentHistoryId)

    if (workflowsWithDifferences.length === 0)
        return NextResponse.json({ success: true, message: "No differences" })

    await Promise.all([
        ...workflowsWithDifferences.map(w =>
            supabase
                .rpc("set_workflow_trigger_field", {
                    _workflow_id: w.id,
                    path: ["data", "historyId"],
                    value: currentHistoryId,
                })
                .throwOnError()
        ),
        supabase.from("kv").insert({
            key: currentHistoryId,
            value: { smartViewId, leadIds: currentLeadIds },
        })
    ])

    const workflowExecutionRequests = workflowsWithDifferences.flatMap(async w => {
        const previousLeadIds = await supabase
            .from("kv")
            .select("leadIds:value->leadIds")
            .eq("key", w.historyId)
            .single()
            .then(q => (q.data?.leadIds || []) as string[])

        const newLeads = currentLeadIds.filter(id => !previousLeadIds.includes(id))

        return newLeads.map(async leadId => axios.post(`${process.env.INTERNAL_API_URL}/workflows/${w.id}/run`, {
            triggerData: { leadId, smartViewId },
        }).catch(err => {
            console.debug(`Error executing workflow ${w.id}: ${err.message}`)
        }))
    })

    await Promise.all(workflowExecutionRequests)

    return NextResponse.json({ success: true })
}


const bodySchema = z.object({
    smartViewId: z.string(),
})

/*
- different workflows could have different "historyIds", so we need to at least store that ID in the workflow trigger data
- don't want to store the entire history in each workflow because it could consist of thousands of leads, so we'll just store the history ID
- we need the history ID to be unique to each dataset, so we'll use a hash
- we'll need to store the actual leads somewhere to be able to diff them, so we'll need to store the leads in a separate kv store keyed by the history ID
*/