import { createClient } from "@supabase/supabase-js"
import { Database } from "../types/supabase-db"
import { getSecret } from "./google"

export async function supabaseServerAdmin() {
    return createClient<Database>(
        process.env.SUPABASE_URL!,
        await getSecret("SUPABASE_SERVICE_KEY", false),
    )
}