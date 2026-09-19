import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toTaskDto } from "@/lib/task-dto";
import { internalErrorResponse } from "@/lib/api-error";
import { Prisma } from "@/app/generated/prisma/client";
import { isPriority, type ApiResponse, type Priority, type TaskDto } from "@/types/api";

const NOT_FOUND_RESPONSE: ApiResponse<never> = {
  success: false,
  error: "해당 할 일을 찾을 수 없습니다.",
};

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json(NOT_FOUND_RESPONSE, { status: 404 });
  }

  const body: unknown = await request.json().catch(() => null);
  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const hasDone = "done" in record && record.done !== undefined;
  const hasPriority = "priority" in record && record.priority !== undefined;

  if (!hasDone && !hasPriority) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "수정할 필드(done, priority)가 없습니다." },
      { status: 400 },
    );
  }

  if (hasDone && typeof record.done !== "boolean") {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "done은 boolean이어야 합니다." },
      { status: 400 },
    );
  }

  if (hasPriority && !isPriority(record.priority)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "priority는 HIGH/MEDIUM/LOW 중 하나여야 합니다." },
      { status: 400 },
    );
  }

  const data: { done?: boolean; priority?: Priority } = {};
  if (hasDone) data.done = record.done as boolean;
  if (hasPriority) data.priority = record.priority as Priority;

  try {
    const task = await prisma.task.update({ where: { id }, data });

    return NextResponse.json<ApiResponse<TaskDto>>({
      success: true,
      data: toTaskDto(task),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(NOT_FOUND_RESPONSE, { status: 404 });
    }
    return internalErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json(NOT_FOUND_RESPONSE, { status: 404 });
  }

  try {
    await prisma.task.delete({ where: { id } });

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(NOT_FOUND_RESPONSE, { status: 404 });
    }
    return internalErrorResponse(error);
  }
}
