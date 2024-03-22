"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"


export default function AccountMenuClient({
    photoSrc,
    fallback,
}: {
    photoSrc: string
    fallback: string
}) {
    const supabase = useSupabaseBrowser()
    const router = useRouter()

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className="hover:scale-110 transition-transform">
                    {photoSrc &&
                        <AvatarImage src={photoSrc} />}
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem asChild>
                    <Link href="/projects">
                        Projects
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={signOut}
                >
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}