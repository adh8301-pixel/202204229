# Implementation Plan: 할 일 관리(Todo)

**Branch**: `001-todo-app` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)
**Input**: 위 스펙 + 기술 방향 — "Next.js App Router의 API Routes(app/api/tasks/route.ts 등)로 REST 엔드포인트를 만든다. ORM은 Prisma를 쓰고, 데이터베이스는 로컬 SQLite 파일(dev.db)을 사용한다. 별도의 서버 설정이나 외부 서비스 가입은 필요 없다."

## Summary
할 일 CRUD(추가/조회/토글/삭제)를 Next.js App Router의 Route Handler(`app/api/tasks/**`)로 구현하고, Prisma ORM을 통해 로컬 SQLite 파일(`prisma/dev.db`)에 저장한다. 외부 서비스나 별도 서버 설정 없이 `npm run dev` 하나로 동작해야 한다.

## Technical Context
- **Language/Version**: TypeScript (Next.js App Router)
- **Primary Dependencies**: Next.js, Prisma ORM, `@prisma/client`
- **Storage**: SQLite 로컬 파일 (`prisma/dev.db`)
- **Testing**: 미지정 (필요 시 이후 단계에서 결정)
- **Target Platform**: 로컬 Node.js 개발 서버, 외부 서비스/클라우드 가입 불필요
- **Project Type**: 단일 Next.js 웹앱 (프론트엔드 + API 라우트 통합)
- **Constraints**: 별도 서버 설정 불필요, [constitution](../../.specify/memory/constitution.md)의 3원칙(App Router+TS, JSON 응답 통일, `any` 금지) 준수

## Constitution Check
- **I. Next.js App Router + TypeScript**: `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts` 등 App Router Route Handler + `.ts`로만 작성 → 충족
- **II. 통일된 JSON API 응답**: 모든 엔드포인트가 아래 공통 `ApiResponse<T>` 형태로만 응답 → 충족
- **III. `any` 타입 금지**: Prisma가 생성하는 `Task` 타입과 명시적 요청/응답 타입만 사용, `any` 미사용 → 충족

위반 사항 없음 (Complexity Tracking 불필요).

## Project Structure
```
mini-todo-sqlite/
├── prisma/
│   ├── schema.prisma          # Task 모델 정의 (datasource: sqlite, file:./dev.db)
│   └── dev.db                 # 로컬 SQLite 파일 (git 추적 제외)
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts       # GET(목록+필터), POST(생성)
│   │       └── [id]/
│   │           └── route.ts   # PATCH(완료 토글), DELETE(삭제)
│   └── page.tsx                # 목록 UI (추가/토글/삭제/필터)
├── lib/
│   └── prisma.ts              # PrismaClient 싱글턴 (dev 환경 핫리로드 대응)
└── types/
    └── api.ts                 # 공통 ApiResponse<T> 타입
```

## Phase 0: Research
자세한 내용은 [research.md](./research.md) 참고.
- Prisma + SQLite 연결 설정 (`datasource db { provider = "sqlite", url = "file:./dev.db" }`)
- Next.js dev 환경에서 PrismaClient 다중 인스턴스 방지를 위한 싱글턴 패턴 필요
- Route Handler에서 `NextRequest.json()`으로 body 파싱, `NextResponse.json()`으로 통일된 응답 반환

## Phase 1: Design & Contracts
- 데이터 모델: [data-model.md](./data-model.md)
- API 계약: [contracts/tasks-api.md](./contracts/tasks-api.md)

### 공통 응답 타입
```ts
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

## Complexity Tracking
해당 없음 — constitution 위반 사항 없음.
