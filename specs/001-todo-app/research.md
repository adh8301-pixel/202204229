# Phase 0 Research: 할 일 관리(Todo)

## Prisma + SQLite 연결
- **Decision**: `prisma/schema.prisma`의 datasource를 `provider = "sqlite"`, `url = env("DATABASE_URL")`로 설정하고, `.env`에 `DATABASE_URL="file:./dev.db"` 지정.
- **Rationale**: 별도 DB 서버 없이 파일 하나로 동작 → "외부 서비스 가입/서버 설정 불필요" 제약 충족.
- **Alternatives considered**: better-sqlite3 직접 사용(경량이지만 타입 안전성/마이그레이션 도구 부족으로 제외).

## PrismaClient 싱글턴
- **Decision**: `lib/prisma.ts`에서 `globalThis` 캐싱 패턴으로 PrismaClient를 하나만 생성.
- **Rationale**: Next.js dev 서버의 모듈 핫리로드 시마다 새 PrismaClient가 생성되면 SQLite 커넥션이 누적되어 오류 발생 가능.
- **Alternatives considered**: 요청마다 새 인스턴스 생성(개발 환경에서 커넥션 누수 문제로 제외).

## Route Handler 응답 규칙
- **Decision**: 모든 `app/api/tasks/**/route.ts`는 성공/실패 관계없이 `NextResponse.json(...)`으로만 응답하고, HTTP 상태 코드(200/201/400/404)를 함께 지정.
- **Rationale**: constitution의 "통일된 JSON API 응답" 원칙 충족 — 에러 시에도 HTML 에러 페이지 대신 JSON 반환.
- **Alternatives considered**: Next.js 기본 에러 페이지에 위임(원칙 위반으로 제외).

## 타입 안전성
- **Decision**: Prisma가 생성하는 `Task` 타입을 `@prisma/client`에서 그대로 사용하고, 요청 body는 `unknown`으로 받은 뒤 타입 가드로 검증.
- **Rationale**: constitution의 `any` 금지 원칙 충족.
- **Alternatives considered**: 요청 body를 `any`로 캐스팅 후 접근(원칙 위반으로 제외).

## 미해결 항목
없음 — 모든 기술적 컨텍스트가 확정됨.
