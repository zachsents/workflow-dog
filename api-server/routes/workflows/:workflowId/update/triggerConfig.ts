import { getAuthenticatedClient } from "@api/db.js"
import { Request, Response } from "express"


export async function post(req: Request, res: Response) {
    const client = await getAuthenticatedClient(req)

    const { data: { trigger } } = await client.from("workflows")
        .select("trigger")
        .eq("id", req.params.workflowId)
        .single()
        .throwOnError()

    await client.from("workflows")
        .update({
            trigger: {
                ...trigger,
                config: {
                    ...trigger.config,
                    ...req.body,
                }
            }
        })
        .eq("id", req.params.workflowId)
        .throwOnError()

    console.debug(`Updated fields (${Object.keys(req.body)}) in trigger config for workflow (${req.params.workflowId})`)

    res.sendStatus(204)
}