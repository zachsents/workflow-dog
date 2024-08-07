import { isLoggedIn } from "@web/lib/auth"
import { createBrowserRouter } from "react-router-dom"
import ErrorPage from "./components/error-page"
import { WorkflowEdit, WorkflowRoot } from "./routes/edit-test"
import LoginCallback from "./routes/login-callback"
import LoginIndex from "./routes/login-index"
import LoginRoot from "./routes/login-root"
import ProjectRoot from "./routes/project-root"
import ProjectsList from "./routes/projects-list"
import Root from "./routes/root"
import ProjectOverview from "./routes/project-overview"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [{
            index: true,
            loader: async () => {
                window.location.replace("/")
                return null
            },
        }, {
            path: "/login",
            element: <LoginRoot />,
            children: [{
                index: true,
                element: <LoginIndex />,
            }, {
                path: "callback",
                element: <LoginCallback />,
            },]
        }, {
            path: "/app",
            loader: async () => {
                if (!(await isLoggedIn()))
                    return replace("/login")
                const projectId = window.localStorage.getItem("currentProjectId")
                if (projectId)
                    return replace(`/projects/${projectId}`)
                return replace("/projects")
            },
        }, {
            path: "/projects",
            children: [{
                index: true,
                path: "create?",
                element: <ProjectsList />,
                loader: loginLoader,
            }, {
                path: ":projectId",
                element: <ProjectRoot />,
                children: [{
                    index: true,
                    element: <ProjectOverview />,
                }]
            },],
        }, {
            path: "/workflows/:workflowId",
            element: <WorkflowRoot />,
            children: [{
                path: "edit",
                element: <WorkflowEdit />,
            }, {
                path: "trigger",
                element: <div></div>,
            }, {
                path: "history",
                element: <div></div>,
            },]
        },],
    },
])


async function loginLoader() {
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