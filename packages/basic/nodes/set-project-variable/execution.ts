import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { createClient } from "@supabase/supabase-js"
import { assertArgProvided } from "@pkg/lib"


export default createExecutionNodeDefinition(shared, {
    action: async ({ value }, { node, projectId }) => {
        assertArgProvided(node.data.state?.key, "variable name")
        assertArgProvided(value, "value")

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

        await supabase
            .from("project_variables")
            .upsert({
                project_id: projectId,
                key: node.data.state?.key,
                value,
            }, {
                onConflict: "project_id, key"
            })
            .throwOnError()

        return {}
    },
})
