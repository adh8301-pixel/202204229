import type { Task } from "@/app/generated/prisma/client";
import { isPriority, type TaskDto } from "@/types/api";

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    title: task.title,
    done: task.done,
    priority: isPriority(task.priority) ? task.priority : "MEDIUM",
    createdAt: task.createdAt.toISOString(),
  };
}
