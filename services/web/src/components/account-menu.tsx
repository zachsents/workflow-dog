import { IconLoader } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Avatar, AvatarFallback } from "@ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@ui/dropdown-menu"
import { useUser } from "@web/lib/auth"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { signOut } from "supertokens-web-js/recipe/session"

export default function AccountMenu() {

    const { data: user } = useUser()

    const userEmailInitial = user?.emails[0][0].toUpperCase() ?? " "

    const { mutate: startSignOut, isPending, isSuccess } = useMutation({
        mutationFn: async () => {
            const signingOut = signOut()
            toast.promise(signingOut, {
                loading: "Signing out...",
            })
            await signingOut
            window.location.href = "/login"
        },
    })

    const isSigningOut = isPending || isSuccess

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar className="hover:scale-110 transition-transform">
                    {/* {photoSrc &&
                        <AvatarImage src={isSigningOut ? "" : photoSrc} />} */}
                    <AvatarFallback>
                        {isSigningOut
                            ? <IconLoader className="animate-spin w-[1em] h-[1em]" />
                            : userEmailInitial}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link to="/projects">
                        Projects
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => void startSignOut()}
                >
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}