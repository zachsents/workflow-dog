import CreateProject from "./_components/create-project"
import ProjectsGrid from "./_components/projects-grid"


export default async function ProjectsPage() {
    return (<>
        <div className="flex justify-between gap-10">
            <h1 className="text-2xl font-bold">
                Projects
            </h1>
            <CreateProject />
        </div>
        <ProjectsGrid />
    </>)
}