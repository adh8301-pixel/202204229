# Data Model: 할 일 관리(Todo)

## Task

spec.md의 "Todo" 엔티티에 대응하는 Prisma 모델. 모델명은 `app/api/tasks` 경로 및 향후 확장(마감일 등)을 고려해 `Task`로 명명한다.

| 필드        | 타입      | 제약                          | 설명                              |
|-------------|-----------|-------------------------------|-----------------------------------|
| `id`        | Int       | PK, autoincrement             | 식별자                            |
| `title`     | String    | 필수, 공백만으로 구성 불가    | 할 일 제목                        |
| `done`      | Boolean   | 필수, 기본값 `false`          | 완료 여부                         |
| `priority`  | String    | 필수, `HIGH`\|`MEDIUM`\|`LOW` 중 하나, 기본값 `MEDIUM` | 중요도 (생성 후 변경 가능) |
| `createdAt` | DateTime  | 필수, 기본값 `now()`          | 등록 시각 (목록 정렬 기준)        |

### Prisma Schema
```prisma
model Task {
  id        Int      @id @default(autoincrement())
  title     String
  done      Boolean  @default(false)
  priority  String   @default("MEDIUM")
  createdAt DateTime @default(now())
}
```

SQLite 데이터소스는 Prisma의 네이티브 `enum`을 지원하지 않으므로, `priority`는 `String` 컬럼으로 저장하고 애플리케이션 레벨에서 TS 유니온 타입(`"HIGH"|"MEDIUM"|"LOW"`)과 런타임 타입가드(`isPriority`, `types/api.ts`)로 검증한다.

### 검증 규칙 (FR-002 대응)
- `title`은 trim 후 길이가 1 이상이어야 함 (공백뿐인 문자열 거부).

### 정렬 규칙 (FR-004 대응)
- 목록 조회 시 `createdAt` 기준 내림차순(`orderBy: { createdAt: 'desc' }`) 정렬.

### 필터 규칙 (FR-008 대응)
- `filter=all` (기본): 전체 조회
- `filter=active`: `done = false`인 항목만
- `filter=done`: `done = true`인 항목만

### 우선순위 규칙 (FR-011~015 대응)
- 허용값: `HIGH`, `MEDIUM`, `LOW` 셋 중 하나.
- 생성 시 생략하면 기본값 `MEDIUM` 적용 (FR-012).
- 생성 후에도 변경 가능 (FR-013) — 완료 여부(`done`)와 독립적으로 수정 가능.
- 목록의 정렬·필터 기준으로는 사용하지 않으며, 카드에 시각적 표시 용도로만 사용 (FR-014).
- 허용값 외의 값으로 추가/변경 요청 시 거부 (FR-015).

### 상태 전이
- 생성 시: `done = false` 고정, `priority`는 요청값 또는 기본값 `MEDIUM` (spec FR-003, FR-012)
- 완료 변경 시: 요청에 포함된 `done` 값으로 갱신 (spec FR-005)
- 우선순위 변경 시: 요청에 포함된 `priority` 값으로 갱신, `done`에는 영향 없음 (spec FR-013)
- 삭제 시: 레코드 완전 제거 (soft delete 없음, spec FR-006)
