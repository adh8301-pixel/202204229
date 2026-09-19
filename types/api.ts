export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type Priority = "HIGH" | "MEDIUM" | "LOW";

const PRIORITIES: readonly Priority[] = ["HIGH", "MEDIUM", "LOW"];

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}

export type TaskDto = {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
  createdAt: string;
};

export type TaskFilter = "all" | "active" | "done";
