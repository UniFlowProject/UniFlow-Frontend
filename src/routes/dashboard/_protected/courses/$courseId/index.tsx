import { createFileRoute } from "@tanstack/react-router"
import { useCourse } from "@/hooks/courses"
import { useTasksByCourse } from "@/hooks/tasks/useTasksByCourse"
import { CourseSpecific } from "@/components/courses/CourseSpecific"
// import { TabCourse } from "@/components/courses/TabCourse"
import { TasksTable } from "@/components/tasks/TasksTable2"

export const Route = createFileRoute(
  "/dashboard/_protected/courses/$courseId/"
)({
  component: RouteComponent,
})

function RouteComponent() {


  const { courseId } = Route.useParams()
  const courseQuery = useCourse(courseId)
  const { tasksQuery } = useTasksByCourse(courseId)

  if (courseQuery.isLoading) return <div>Cargando curso...</div>
  if (courseQuery.error) return <div>Error: {courseQuery.error.message}</div>
  if (!courseQuery.data) return <div>Curso no encontrado</div>

  const course = courseQuery.data
  const tasks = tasksQuery.data ?? []

  return (
    <div className="grid grid-cols-1 lg:grid gap-6 max-w-8xl mx-auto ">
      {/* Columna izquierda */}
      <div className="lg space-y-4">
        {/* Card del curso compacta */}
        <CourseSpecific
          course={course}
          progress={85}
          hours={25}
          projects={2}
          tasks={tasks.length}
          professor="Prof. Leo Víquez"
          schedule="Lun 7:55-11:30"
          className="text-sm"
          onEdit={(s) => {
            console.log("Edit course", s);
          }}
          onDelete={(s) => {
            console.log("Delete course", s);
          }}
        />

        {/* Tabs compactas */}
        {/* <TabCourse course={course} tasks={tasks} defaultTab="resumen" /> */}

        <TasksTable tasks={tasks} isLoading={tasksQuery.isLoading} error={tasksQuery.error} />
      </div>



    </div>
  )
}
