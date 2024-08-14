import { isLoggedIn } from "@web/lib/auth"
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import ErrorPage from "./components/error-page"
import Login from "./routes/login"
import Project from "./routes/project"
import Projects from "./routes/projects"
import Root from "./routes/root"
import { WorkflowEdit, WorkflowRoot } from "./routes/edit-test"


export const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
        <Route index loader={() => replace("/")} />
        <Route path="app" loader={appLoader} />
        <Route path="login" element={<Login.Layout />}>
            <Route index element={<Login.Index />} />
            <Route path="callback" element={<Login.Callback />} />
        </Route>
        <Route path="projects" loader={loggedInLoader}>
            <Route index path="create?" element={<Projects.Index />} />
            <Route path=":projectId" element={<Project.Layout />}>
                <Route index element={<Project.Index />} />
                <Route path="delete" element={<Project.Index deleting />} />
                <Route path="workflows">
                    <Route index element={<Project.Workflows />} />
                    <Route path="create" element={<Project.CreateWorkflow />} />
                </Route>
            </Route>
        </Route>
        <Route path="workflows/:workflowId" element={<WorkflowRoot />} loader={loggedInLoader}>
            <Route index element={<WorkflowEdit />} />
        </Route>
    </Route>
))


async function appLoader() {
    if (!(await isLoggedIn()))
        return replace("/login")

    const projectId = window.localStorage.getItem("currentProjectId")
    if (projectId)
        return replace(`/projects/${projectId}`)

    return replace("/projects")
}


async function loggedInLoader() {
    return await isLoggedIn() ? null : replace("/login")
}


/**
 * Replaces instead of redirecting to avoid the back button.
 * For use inside a loader function. Little hack to avoid
 * flickering the original page and keep loading indicator 
 * before replacing.
 */
function replace(location: string | URL) {
    const promise = new Promise<null>(resolve => {
        window.addEventListener("pagehide", () => resolve(null), {
            once: true,
        })
    })
    window.location.replace(location)
    return promise
}