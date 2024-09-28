import axios from "axios"
import { Queue, Worker } from "bullmq"
import IORedis from "ioredis"
import SuperJSON from "superjson"
import { ServerNodeDefinitions } from "workflow-packages/server"
import { z, ZodError } from "zod"
import { db } from "./db"
import { useEnvVar } from "./utils"
import type { Insertable } from "kysely"
import type { WorkflowRunOutputs } from "core/db"
import { decodeValue, encodeValue } from "workflow-packages/lib/value-types.server"
import _mapValues from "lodash/mapValues"


const connection = new IORedis({
    host: "redis",
    port: parseInt(useEnvVar("REDIS_PORT")),
    password: useEnvVar("REDIS_PASSWORD"),
    maxRetriesPerRequest: null,
})

/**
 * Simply acts as a proxy to our event-generation endpoint.
 * Some events will come in as webhooks directly to the API,
 * but others will happen as scheduled jobs through this queue.
 */
export const EVENT_QUEUE = new Queue("events", {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
    },
})

new Worker("events", async (job) => {
    console.log("[Bull] running job", job.name)
    const res = await axios.post(`http://api:${useEnvVar("PORT")}/run/x/${job.name}`, job.data)
    console.log("[Bull] job", job.name, "returned status", res.status)
}, { connection })


/**
 * Queue for running workflows. This is where the actual workflow
 * execution happens. In the future, we can throttle, prioritize,
 * and even scale this horizontally.
 */
export const RUN_QUEUE = new Queue("runs", {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
    },
})

new Worker("runs", async (job) => {
    console.log("[Bull] starting dry workflow run", job.data.workflowRunId)
    const [{ graph, workflow_id, project_id, event_payload }] = await Promise.all([
        db.selectFrom("workflow_runs")
            .innerJoin("workflow_snapshots", "workflow_snapshots.id", "workflow_runs.snapshot_id")
            .select(["graph", "workflow_runs.workflow_id", "project_id", "event_payload"])
            .where("workflow_runs.id", "=", job.data.workflowRunId)
            .executeTakeFirstOrThrow(),

        db.updateTable("workflow_runs")
            .set({ status: "running" })
            .where("id", "=", job.data.workflowRunId)
            .executeTakeFirstOrThrow(),
    ])

    const eventPayload = _mapValues(event_payload as object, v => decodeValue(JSON.parse(v)))
    let eventResponse: Record<string, any> | undefined

    console.log("[Bull] exec...", job.data.workflowRunId)

    const { nodes, edges } = z.object({
        nodes: z.object({
            id: z.string(),
            definitionId: z.string(),
        }).passthrough().array(),
        edges: z.object({
            id: z.string(),
            s: z.string(),
            sh: z.string(),
            t: z.string(),
            th: z.string(),
        }).array(),
    }).parse(SuperJSON.parse(graph))

    type NodeReturnType = Record<string, any> | void
    const resolveFns: Record<string, (value: PromiseLike<NodeReturnType> | NodeReturnType) => void> = {}
    const rejectFns: Record<string, (reason?: any) => void> = {}
    const promises = Object.fromEntries(nodes.map(n => [n.id, new Promise<NodeReturnType>((resolve, reject) => {
        resolveFns[n.id] = resolve
        rejectFns[n.id] = reject
    })] as const))

    nodes.forEach(async n => {
        const rawInputs = Object.fromEntries(
            await Promise.all(edges.filter(e => e.t === n.id).map(edge =>
                promises[edge.s]
                    .then(outputs => [edge.th, outputs?.[edge.sh]] as const)
                    .catch(() => [edge.th, undefined] as const)
            ))
        )

        if (Object.values(rawInputs).some(x => x === undefined)) {
            console.log("Skipping node", n.id, "because of missing inputs")
            return resolveFns[n.id](undefined)
        }

        const formedInputs = Object.entries(rawInputs).reduce((acc, [k, v]) => {
            if (/^\w+$/.test(k))
                return { ...acc, [k]: v }

            const arrMatch = k.match(/^(\w+)\.(\d+)$/)
            if (arrMatch) {
                const [, arrName, indexStr] = arrMatch
                const index = parseInt(indexStr)

                if (isNaN(index))
                    return acc

                const name = (n.handleStates as any)[arrName]?.multi?.names?.[index] as string | undefined

                if (name) {
                    acc[arrName] ??= {}
                    acc[arrName][name] = v
                } else {
                    acc[arrName] ??= []
                    acc[arrName][index] = v
                }

                return acc
            }

            return acc
        }, {} as Record<string, any>)

        // remove sparse array entries
        for (const v of Object.values(formedInputs)) {
            if (!Array.isArray(v)) continue
            for (let i = 0; i < v.length; i++)
                v[i] ??= null
        }

        console.log("Running node", n.id)

        const def = ServerNodeDefinitions[n.definitionId]
        if (!def) {
            console.warn("Missing node definition: " + n.definitionId)
            return rejectFns[n.id](new Error("Missing node definition: " + n.definitionId))
        }

        let rawOutputs: Awaited<ReturnType<typeof def["action"]>>
        try {
            rawOutputs = await def.action(formedInputs, {
                node: n,
                workflowId: workflow_id!,
                projectId: project_id!,
                eventPayload,
                respond: data => {
                    eventResponse = data
                },
            })
        } catch (err) {
            return rejectFns[n.id](err)
        }

        const outputs = rawOutputs
            ? Object.entries(rawOutputs).reduce((acc, [handleName, outputValue]) => {
                if ((n.handleStates as any)[handleName]?.listMode === "multi") {
                    const names = (n.handleStates as any)[handleName].multi.names as string[] | undefined
                    if (names && outputValue?.constructor === Object) {
                        names.forEach((name, i) => {
                            acc[`${handleName}.${i}`] = outputValue[name] ?? null
                        })
                    }
                    else if (!names && Array.isArray(outputValue)) {
                        outputValue.forEach((v, i) => {
                            acc[`${handleName}.${i}`] = v ?? null
                        })
                    }
                    return acc
                }
                acc[handleName] = outputValue
                return acc
            }, {} as Record<string, any>)
            : undefined

        resolveFns[n.id](outputs)
    })

    const [nodeErrors] = await Promise.all([
        // Aggregate node errors
        Promise.all(
            Object.entries(promises).map(async ([nodeId, promise]) =>
                [nodeId, await promise.then(() => undefined).catch(err => {
                    if (err instanceof ZodError) {
                        const flat = err.flatten()
                        return [
                            ...Object.values(flat.formErrors),
                            ...Object.values(flat.fieldErrors),
                        ].flat().join("\n")
                    }

                    return err.message
                })] as const
            )
        ).then(entries => Object.fromEntries(entries)),

        // Insert node outputs as records to workflow_run_outputs table
        Promise.all(
            Object.entries(promises).map(async ([nodeId, promise]) => {
                const outputRecords = Object.entries(await promise.catch(() => null) ?? {})
                    .filter(([, outputValue]) => outputValue !== undefined)
                    .map<Insertable<WorkflowRunOutputs>>(([handleId, outputValue]) => ({
                        workflow_run_id: job.data.workflowRunId,
                        is_global: false,
                        node_id: nodeId,
                        handle_id: handleId,
                        value: JSON.stringify(encodeValue(outputValue)),
                    }))

                if (outputRecords.length > 0)
                    await db.insertInto("workflow_run_outputs").values(outputRecords).execute()
            })
        ).catch(err => {
            console.error(err)
        }),

        // Wait for all execution promises to settle
        Promise.allSettled(Object.values(promises)),
    ])

    if (eventResponse) {
        await db.insertInto("workflow_run_outputs")
            .values(Object.entries(eventResponse).map(([handleId, data]) => ({
                workflow_run_id: job.data.workflowRunId,
                is_global: true,
                handle_id: handleId,
                value: JSON.stringify(encodeValue(data)),
            })))
            .execute()
    }

    await db.updateTable("workflow_runs")
        .set({
            status: "completed",
            node_errors: nodeErrors,
        })
        .where("id", "=", job.data.workflowRunId)
        .executeTakeFirstOrThrow()

    console.log("[Bull] finished workflow run", job.data.workflowRunId)
}, { connection, concurrency: 10 })
