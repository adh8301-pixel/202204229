import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toTaskDto } from "@/lib/task-dto";
import { internalErrorResponse } from "@/lib/api-error";
import { isPriority, type ApiResponse, type TaskDto, type TaskFilter } from "@/types/api";

function parseFilter(value: string | null): TaskFilter {
  return value === "active" || value === "done" ? value : "all";
}

export async function GET(request: NextRequest) {
  try {
    const filter = parseFilter(request.nextUrl.searchParams.get("filter"));

    const where =
      filter === "active"
        ? { done: false }
        : filter === "done"
          ? { done: true }
          : {};

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<TaskDto[]>>({
      success: true,
      data: tasks.map(toTaskDto),
    });
  } catch (error) {
    return internalErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);

    const title =
      typeof body === "object" && body !== null && "title" in body
        ? (body as { title: unknown }).title
        : undefined;

    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "title은 필수이며 공백일 수 없습니다." },
        { status: 400 },
      );
    }

    const rawPriority =
      typeof body === "object" && body !== null && "priority" in body
        ? (body as { priority: unknown }).priority
        : undefined;

    if (rawPriority !== undefined && !isPriority(rawPriority)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "priority는 HIGH/MEDIUM/LOW 중 하나여야 합니다." },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: { title: title.trim(), priority: rawPriority ?? "MEDIUM" },
    });

    return NextResponse.json<ApiResponse<TaskDto>>(
      { success: true, data: toTaskDto(task) },
      { status: 201 },
    );
  } catch (error) {
    return internalErrorResponse(error);
  }
}
