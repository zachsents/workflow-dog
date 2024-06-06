import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { createClient } from "@supabase/supabase-js"
import { assertArgProvided } from "@pkg/lib"


export default createExecutionNodeDefinition(shared, {
    action: async ({ }, { node, projectId }) => {
        assertArgProvided(node.data.state?.key, "variable name")

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

        const value = await supabase
            .from("project_variables")
            .select("value")
            .eq("project_id", projectId)
            .eq("key", node.data.state?.key)
            .throwOnError()
            .then(q => q.data?.[0]?.value ?? null)

        if (value === undefined)
            throw new Error(`Project variable "${node.data.state?.key}" not found`)

        return { value }
    },
})
