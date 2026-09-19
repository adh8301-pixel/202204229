import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function internalErrorResponse(error: unknown) {
  console.error(error);
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: "서버 오류가 발생했습니다." },
    { status: 500 },
  );
}
