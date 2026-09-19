# API Contract: /api/tasks

모든 응답은 공통 타입을 따른다.

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

## GET /api/tasks
목록 조회 (최신 등록순, 필터 지원)

- **Query**: `filter` = `all` (기본) | `active` | `done`
- **200**: `{ success: true, data: Task[] }`

## POST /api/tasks
할 일 추가

- **Body**: `{ title: string, priority?: "HIGH" | "MEDIUM" | "LOW" }`
- **201**: `{ success: true, data: Task }` — `done: false`, `priority`는 지정값 또는 기본값 `"MEDIUM"`으로 생성
- **400**: `{ success: false, error: "title은 필수이며 공백일 수 없습니다." }` — title 누락/공백
- **400**: `{ success: false, error: "priority는 HIGH/MEDIUM/LOW 중 하나여야 합니다." }` — priority가 지정됐지만 유효하지 않은 값

## PATCH /api/tasks/:id
부분 업데이트 (완료 여부 및/또는 우선순위 변경)

- **Body**: `{ done?: boolean, priority?: "HIGH" | "MEDIUM" | "LOW" }` — `done`, `priority` 중 최소 하나 필요. 값을 명시적으로 전달해야 하며(예: 토글하려면 클라이언트가 `!현재값`을 계산해서 전송), 서버가 암묵적으로 반전시키지 않는다.
- **200**: `{ success: true, data: Task }` — 요청에 포함된 필드만 갱신
- **400**: `{ success: false, error: "수정할 필드(done, priority)가 없습니다." }` — body에 `done`, `priority` 둘 다 없음
- **400**: `{ success: false, error: "done은 boolean이어야 합니다." }` — `done`이 boolean이 아님
- **400**: `{ success: false, error: "priority는 HIGH/MEDIUM/LOW 중 하나여야 합니다." }` — `priority`가 유효하지 않은 값
- **404**: `{ success: false, error: "해당 할 일을 찾을 수 없습니다." }`

## DELETE /api/tasks/:id
삭제 (클라이언트에서 확인(confirm) 후 호출)

- **200**: `{ success: true, data: { id: number } }`
- **404**: `{ success: false, error: "해당 할 일을 찾을 수 없습니다." }`

### Task 직렬화 형태
```ts
type Task = {
  id: number;
  title: string;
  done: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string; // ISO 8601
};
```
