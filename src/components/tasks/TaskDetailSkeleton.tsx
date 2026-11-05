import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  BookOpen,
  LoaderIcon,
  Calendar,
  Clock,
  TextIcon,
  Tag,
  Hash,
  History,
  MousePointerClick
} from 'lucide-react'

export function TaskDetailSkeleton() {
  return (
    <div className="container py-6 px-4 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="p-2" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* BentoGrid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 min-h-[600px]">

        {/* Course Information Skeleton - Large Card */}
        <Card className="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>

        {/* Progress Card Skeleton */}
        <Card className="lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LoaderIcon />
              Progreso de la Tarea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Due Date Skeleton - Tall Card */}
        <Card className="md:col-span-1 lg:col-span-1 xl:col-span-2 row-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Límite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-40 mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
          </CardContent>
        </Card>

        {/* Description Skeleton - Wide Card */}
        <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TextIcon />
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>

        {/* Tags Skeleton */}
        <Card className="md:col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-4 w-4" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps Skeleton */}
        <Card className="md:col-span-1 lg:col-span-1 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Separator orientation='vertical' />

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Separator orientation='vertical' />

            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Skeleton */}
        <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MousePointerClick />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}