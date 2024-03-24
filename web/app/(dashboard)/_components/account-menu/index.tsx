import { supabaseServer } from "@web/lib/server/supabase"
import AccountMenuClient from "./client"


export default async function AccountMenu() {

    const { data: { user } } = await supabaseServer().auth.getUser()

    const fallback = (user?.user_metadata?.name as string || user?.email)
        ?.match(/(?<!\w)./g)?.slice(0, 2).join("").toUpperCase() ?? "?"

    const photoSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

    return <AccountMenuClient {...{ fallback, photoSrc }} />
}