import { TRPCClientError } from "@trpc/client"
import { handleGoogleCallback, isLoggedIn } from "@web/lib/auth"
import { createBrowserRouter, createRoutesFromElements, replace, Route, type LoaderFunction } from "react-router-dom"
import ErrorPage from "./components/error-page"
import { BrandLoader } from "./components/spinning-loader"
import { vtrpc } from "./lib/trpc"
import { t, url } from "./lib/utils"
import { WorkflowEdit, WorkflowRoot } from "./routes/edit-test"
import Login from "./routes/login"
import Project from "./routes/project"
import Projects from "./routes/projects"
import Root from "./routes/root"


const RETURN_TO_LOCAL_STORAGE_KEY = "login_return_to"
const LOADING_SCREEN = <BrandLoader className="w-screen h-screen text-[10rem]" />

const LOADERS = {
    App: () => {
        isLoggedIn().then(loggedIn => {
            const dest = loggedIn
                ? (t`/projects/${window.localStorage.getItem("currentProjectId")}` ?? "/projects")
                : "/login"
            window.rr.replace(dest)
        })
        return null
    },
    MustBeLoggedIn: async () => {
        return await isLoggedIn() ? null : replace("/login")
    },
    LoginCallback: () => {
        handleGoogleCallback().then(() => {
            const returnTo = localStorage.getItem(RETURN_TO_LOCAL_STORAGE_KEY)
            if (returnTo)
                localStorage.removeItem(RETURN_TO_LOCAL_STORAGE_KEY)
            window.rr.replace(returnTo || "/app")
        }).catch(err => {
            console.error(err)
            window.rr.replace(url("/login", {
                tm: err.message || "There was a problem logging you in.",
                return_to: localStorage.getItem(RETURN_TO_LOCAL_STORAGE_KEY),
            }))
        })
        return null
    },
    AcceptInvitation: async ({ params: { invitationId } }) => {
        if (!invitationId)
            return replace("/app")

        isLoggedIn().then(async loggedIn => {
            if (!loggedIn)
                return window.rr.replace(url("/login", {
                    return_to: window.location.pathname,
                    tm: "You need to log in first",
                }))

            await vtrpc.projects.team.acceptInvitation.mutate({
                invitationId
            }).then(r => {
                window.rr.replace(`/projects/${r.projectId}`)
            }).catch(err => {
                if (err instanceof TRPCClientError)
                    window.rr.replace(url("/projects", { tm: err.data?.message }))
                else throw err
            })
        })

        return null
    },
} satisfies Record<string, LoaderFunction>


export const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
        <Route index loader={() => replaceDocument("/")} />
        <Route path="app" element={LOADING_SCREEN} loader={LOADERS.App} />

        <Route path="login">
            <Route index element={<Login.Index />} />
            <Route path="callback" element={LOADING_SCREEN} loader={LOADERS.LoginCallback} />
        </Route>

        <Route path="projects" loader={LOADERS.MustBeLoggedIn}>
            <Route index path="create?" element={<Projects.Index />} />
            <Route path=":projectId" element={<Project.Layout />}>
                <Route index element={<Project.Index />} />
                <Route path="delete" element={<Project.Index deleting />} />
                <Route path="workflows">
                    <Route index element={<Project.Workflows />} />
                    <Route path="create" element={<Project.CreateWorkflow />} />
                </Route>
                <Route path="team" element={<Project.Team />} />
            </Route>
        </Route>

        <Route path="workflows/:workflowId" element={<WorkflowRoot />} loader={LOADERS.MustBeLoggedIn}>
            <Route index element={<WorkflowEdit />} />
        </Route>

        <Route path="invitations/:invitationId/accept" element={LOADING_SCREEN} loader={LOADERS.AcceptInvitation} />
    </Route>
))


/**
 * Replaces instead of redirecting to avoid the back button.
 * For use inside a loader function. Little hack to avoid
 * flickering the original page and keep loading indicator 
 * before replacing.
 */
function replaceDocument(location: string | URL) {
    const promise = new Promise<null>(resolve => {
        window.addEventListener("pagehide", () => resolve(null), {
            once: true,
        })
    })
    window.location.replace(location)
    return promise
}