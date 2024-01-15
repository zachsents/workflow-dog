import { Avatar } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@web/modules/supabase"
import { deepCamelCase } from "@web/modules/util"
import { forwardRef } from "react"


function UserAvatar({ userId, fetch = false, name, email, photoUrl, ...props }, ref) {

    const { data: userData, isSuccess } = useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("users")
                .select("name, email, photo_url")
                .eq("id", userId)
                .single()
                .throwOnError()

            return deepCamelCase(data)
        },
        enabled: !!userId && fetch,
    })

    if (fetch && isSuccess) {
        name = userData?.name
        email = userData?.email
        photoUrl = userData?.photoUrl
    }

    const initial = (name || email)?.[0]?.toUpperCase() ?? "?"

    return (
        <Avatar
            src={photoUrl}
            name={initial}
            {...props}
            ref={ref}
        />
    )
}


export default forwardRef(UserAvatar)