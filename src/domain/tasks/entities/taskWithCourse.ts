import { TaskStatus } from '../enums/task-status'
import { Task } from './task'
import type { TaskPriority } from '../enums/task-priority'

export class TaskWithCourse extends Task {
  constructor(
    id: string,
    title: string,
    dueDate: Date,
    priority: TaskPriority,
    courseId: string,
    public readonly courseName: string,
    public readonly courseCode: string,
    status: TaskStatus = TaskStatus.TODO,
    description?: string,
    estimatedTimeHours?: number,
    tags: Array<string> = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    completedAt?: Date
  ) {
    super(
      id,
      title,
      courseId,
      dueDate,
      priority,
      status,
      description,
      estimatedTimeHours,
      tags,
      createdAt,
      updatedAt,
      completedAt
    )

  }

  // Override de métodos que retornan Task para que retornen TaskWithCourse
  start(): TaskWithCourse {
    const updatedTask = super.start()
    return this.createFromTask(updatedTask)
  }

  complete(): TaskWithCourse {
    const updatedTask = super.complete()
    return this.createFromTask(updatedTask)
  }

  sendToReview(): TaskWithCourse {
    const updatedTask = super.sendToReview()
    return this.createFromTask(updatedTask)
  }

  updateStatus(newStatus: TaskStatus): TaskWithCourse {
    const updatedTask = super.updateStatus(newStatus)
    return this.createFromTask(updatedTask)
  }

  updateDetails(
    title: string,
    description?: string,
    dueDate?: Date,
    priority?: TaskPriority,
    estimatedTimeHours?: number
  ): TaskWithCourse {
    const updatedTask = super.updateDetails(title, description, dueDate, priority, estimatedTimeHours)
    return this.createFromTask(updatedTask)
  }

  addTag(tag: string): TaskWithCourse {
    const updatedTask = super.addTag(tag)
    return this.createFromTask(updatedTask)
  }

  removeTag(tag: string): TaskWithCourse {
    const updatedTask = super.removeTag(tag)
    return this.createFromTask(updatedTask)
  }

  // Método helper para crear TaskWithCourse desde Task
  private createFromTask(task: Task): TaskWithCourse {
    return new TaskWithCourse(
      task.id,
      task.title,
      task.dueDate,
      task.priority,
      task.courseId,
      this.courseName,
      this.courseCode,
      task.status,
      task.description,
      task.estimatedTimeHours,
      task.tags,
      task.createdAt,
      task.updatedAt,
      task.completedAt
    )
  }

  // Métodos adicionales específicos para TaskWithCourse
  getFullCourseName(): string {
    return `${this.courseCode} - ${this.courseName}`
  }

  getCourseDisplayName(): string {
    return `[${this.courseCode}] ${this.courseName}`
  }
}