import { getUser } from "@web/lib/server/auth"
import AccountMenuClient from "./client"


export default async function AccountMenu() {

    const user = await getUser()

    const fallback = (user?.name || user?.email)
        ?.match(/(?<!\w)./g)?.slice(0, 2).join("").toUpperCase() ?? "?"

    return <AccountMenuClient
        fallback={fallback}
        photoSrc={user?.image!}
    />
}