"use client";

import { useEffect, useState } from "react";
import { isPriority, type ApiResponse, type Priority, type TaskDto, type TaskFilter } from "@/types/api";

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "미완료" },
  { value: "done", label: "완료" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "HIGH", label: "높음" },
  { value: "MEDIUM", label: "보통" },
  { value: "LOW", label: "낮음" },
];

const PRIORITY_BADGE_CLASS: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function Home() {
  const [tasks, setTasks] = useState<TaskDto[] | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);

  async function loadTasks(currentFilter: TaskFilter) {
    const res = await fetch(`/api/tasks?filter=${currentFilter}`);
    const json: ApiResponse<TaskDto[]> = await res.json();
    if (json.success) {
      setTasks(json.data);
    }
  }

  useEffect(() => {
    let ignore = false;

    fetch(`/api/tasks?filter=${filter}`)
      .then((res) => res.json())
      .then((json: ApiResponse<TaskDto[]>) => {
        if (!ignore && json.success) {
          setTasks(json.data);
        }
      });

    return () => {
      ignore = true;
    };
  }, [filter]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });
    const json: ApiResponse<TaskDto> = await res.json();

    if (!json.success) {
      setError(json.error);
      return;
    }

    setTitle("");
    setPriority("MEDIUM");
    loadTasks(filter);
  }

  async function handleToggle(id: number, nextDone: boolean) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: nextDone }),
    });
    const json: ApiResponse<TaskDto> = await res.json();
    if (json.success) {
      loadTasks(filter);
    }
  }

  async function handlePriorityChange(id: number, nextPriority: Priority) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: nextPriority }),
    });
    const json: ApiResponse<TaskDto> = await res.json();
    if (json.success) {
      loadTasks(filter);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("이 할 일을 삭제할까요?")) {
      return;
    }
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    const json: ApiResponse<{ id: number }> = await res.json();
    if (json.success) {
      loadTasks(filter);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          할 일 목록
        </h1>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded border border-black/[.08] bg-white px-3 py-2 text-black dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
          />
          <select
            value={priority}
            onChange={(e) => {
              const next = e.target.value;
              if (isPriority(next)) setPriority(next);
            }}
            className="rounded border border-black/[.08] bg-white px-2 py-2 text-sm text-black dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-foreground px-4 py-2 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            추가
          </button>
        </form>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === f.value
                  ? "bg-foreground text-background"
                  : "border border-black/[.08] text-black dark:border-white/[.145] dark:text-zinc-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {tasks === null ? (
          <p className="text-sm text-zinc-500">불러오는 중...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-zinc-500">할 일이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded border border-black/[.08] bg-white px-3 py-2 dark:border-white/[.145] dark:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggle(task.id, !task.done)}
                  className="h-4 w-4"
                />
                <span
                  className={`flex-1 text-black dark:text-zinc-50 ${
                    task.done ? "text-zinc-400 line-through dark:text-zinc-600" : ""
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE_CLASS[task.priority]}`}
                >
                  {PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.label}
                </span>
                <select
                  value={task.priority}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (isPriority(next)) handlePriorityChange(task.id, next);
                  }}
                  className="rounded border border-black/[.08] bg-white px-1 py-1 text-xs text-black dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
