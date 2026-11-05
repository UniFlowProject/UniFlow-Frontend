// TabCourse.tsx
import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  BarChart3,
  Clock,
  ListTodo,
  ClipboardList,
} from "lucide-react"

import type { Course } from "@/domain/courses"
import type { Task } from "@/domain/tasks"
import { TasksTable } from "../tasks/TasksTable2"

interface TabCourseProps {
  course: Course
  tasks: Task[]
  defaultTab?: string
}

export const TabCourse: React.FC<TabCourseProps> = ({
  course,
  defaultTab = "resumen",
}) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full max-w-6xl mx-auto">
      <TabsList className="grid grid-cols-4 w-full rounded-xl bg-muted/70 p-2 shadow-md h-14 gap-2">
        <TabsTrigger
          value="resumen"
          className="h-full w-full rounded-lg gap-2 border-l-4 px-4 flex items-center justify-center
                hover:scale-102 transition-all duration-300 cursor-pointer hover:border-primary
                data-[state=active]:bg-background"
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg font-semibold">Resumen</span>
        </TabsTrigger>

        <TabsTrigger
          value="proyectos"
          className="h-full w-full rounded-lg gap-2 border-l-4 px-4 flex items-center justify-center
                hover:scale-102 transition-all duration-300 cursor-pointer hover:border-primary
                data-[state=active]:bg-background"
        >
          <Clock className="h-6 w-6" />
          <span className="text-lg font-semibold">Proyectos</span>
        </TabsTrigger>

        <TabsTrigger
          value="tareas"
          className="h-full w-full rounded-lg gap-2 border-l-4 px-4 flex items-center justify-center
                hover:scale-102 transition-all duration-300 cursor-pointer hover:border-primary
                data-[state=active]:bg-background"
        >
          <ListTodo className="h-6 w-6" />
          <span className="text-lg font-semibold">Tareas</span>
        </TabsTrigger>

        <TabsTrigger
          value="notas"
          className="h-full w-full rounded-lg gap-2 border-l-4 px-4 flex items-center justify-center
                hover:scale-102 transition-all duration-300 cursor-pointer hover:border-primary
                data-[state=active]:bg-background"
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-lg font-semibold">Notas</span>
        </TabsTrigger>
      </TabsList>

      {/* Contenidos de cada tab */}
      <TabsContent
        value="resumen"
        className="mt-4 min-h-[300px] w-full bg-card rounded-xl border p-6"
      >
        <h2 className="text-xl font-semibold">Resumen</h2>
        <p className="text-sm text-muted-foreground">
          Aquí puedes ver el progreso general del curso {course.name}.
        </p>
      </TabsContent>

      <TabsContent
        value="proyectos"
        className="mt-4 min-h-[300px] w-full bg-card rounded-xl border p-6"
      >
        <h2 className="text-xl font-semibold">Proyectos</h2>
        <p className="text-sm text-muted-foreground">
          Aquí estarán listados tus proyectos del curso {course.name}.
        </p>
      </TabsContent>

      <TabsContent
        value="tareas"
        className="mt-4 min-h-[300px] w-full bg-card rounded-xl border p-6"
      >
        <TasksTable tasks={[]} isLoading={false} error={null} />
      </TabsContent>

      <TabsContent
        value="notas"
        className="mt-4 min-h-[300px] w-full bg-card rounded-xl border p-6"
      >
        <h2 className="text-xl font-semibold">Notas</h2>
        <p className="text-sm text-muted-foreground">
          Aquí aparecerán las notas de evaluaciones de {course.name}.
        </p>
      </TabsContent>
    </Tabs>
  );
}
