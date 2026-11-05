import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import type { Course } from '@/domain/courses';
import { useNavigate } from '@tanstack/react-router';
import { useTasksByCourse } from '@/hooks/tasks/useTasksByCourse';

interface CourseCardProps {
  course: Course;
  professor?: string;
  progress?: number;
  currentTask?: string;
  daysRemaining?: number;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  professor = "Prof. Leo Víquez",
  progress = 80,
}) => {

  const navigate = useNavigate();

  const { tasksQuery } = useTasksByCourse(course.id)

  const closestTask = useMemo(() => {
    return tasksQuery.data?.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]
  }, [tasksQuery.data])

  // Get professor initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClick = () => {
    navigate({
      to: "/dashboard/courses/$courseId",
      params: {
        courseId: course.id
      }
    })
  }

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-lg cursor-pointer hover:ring ring-primary`} onClick={handleClick}>
      <CardHeader className="pb-3">
        {/* Course title and credits */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight dark:text-white">
              {course.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {course.getFormattedCode()}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {course.credits} Créditos
          </Badge>
        </div>

        {/* Professor */}
        <div className="flex items-center gap-2 mt-3">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(professor)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {professor}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress section */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progreso</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2"
          />
        </div>

        {/* Current task */}
        <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">
                {closestTask?.title}
              </span>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 text-green-600 border-green-600/20 bg-green-50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-400/20"
            >
              {closestTask?.getTimeUntilDue()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Demo component
// const Demo = () => {
//   const sampleCourse = new Course(
//     "1",
//     "Bases de Datos",
//     "IC-3201",
//     3,
//     "period-1"
//   );

//   return (
//     <div className="min-h-screen bg-background p-8">
//       <div className="max-w-4xl mx-auto space-y-8">
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl font-bold">CourseCard Component</h1>
//           <p className="text-muted-foreground">
//             Component de tarjeta de curso universitario con soporte para modo oscuro
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-6 justify-center">
//           {/* Light version simulation */}
//           <div className="space-y-2">
//             <h3 className="text-sm font-medium text-center">Modo Claro</h3>
//             <CourseCard
//               course={sampleCourse}
//               professor="Prof. Leo Víquez"
//               progress={80}
//               currentTask="Tarea 2 - SQL"
//               daysRemaining={8}
//             />
//           </div>

//           {/* Different progress example */}
//           <div className="space-y-2">
//             <h3 className="text-sm font-medium text-center">Progreso Diferente</h3>
//             <CourseCard
//               course={new Course("2", "Algoritmos y Estructuras", "IC-2001", 4, "period-1")}
//               professor="Prof. María González"
//               progress={45}
//               currentTask="Proyecto Final"
//               daysRemaining={15}
//             />
//           </div>

//           {/* Another course example */}
//           <div className="space-y-2">
//             <h3 className="text-sm font-medium text-center">Otro Curso</h3>
//             <CourseCard
//               course={new Course("3", "Programación Orientada a Objetos", "IC-2101", 5, "period-1")}
//               professor="Prof. Carlos Rodríguez"
//               progress={92}
//               currentTask="Examen Final"
//               daysRemaining={3}
//             />
//           </div>
//         </div>

//         <div className="text-center">
//           <p className="text-sm text-muted-foreground">
//             Cambia el tema del navegador para ver el modo oscuro en acción
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };