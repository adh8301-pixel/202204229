# mini-todo-sqlite Constitution

## Core Principles

### I. Next.js App Router + TypeScript
프로젝트는 Next.js의 App Router(`app/` 디렉터리) 구조를 기반으로 하며, 모든 코드는 TypeScript(`.ts`/`.tsx`)로 작성한다. Pages Router(`pages/` 디렉터리) 방식은 사용하지 않는다.

### II. 통일된 JSON API 응답
모든 API 라우트(`app/api/**/route.ts`)의 응답은 항상 JSON 형식으로 반환한다. 성공/실패 여부와 관계없이 일관된 응답 구조(예: `{ success: boolean, data?, error? }`)를 따르며, 에러 발생 시에도 HTML 에러 페이지가 아닌 JSON으로 상태 코드와 에러 메시지를 반환한다.

### III. `any` 타입 금지
TypeScript 코드에서 `any` 타입을 사용하지 않는다. 타입이 불명확한 경우 `unknown`을 사용한 뒤 타입 가드로 좁히거나, 명시적인 인터페이스/타입을 정의한다. 외부 라이브러리 타입이 없는 경우 별도의 타입 선언 파일을 작성한다.

## Governance

이 constitution은 mini-todo-sqlite 프로젝트의 다른 모든 개발 관행보다 우선한다. 코드 리뷰 및 PR은 위 세 원칙 준수 여부를 확인해야 하며, 원칙에서 벗어나야 할 경우 그 이유를 명시적으로 문서화해야 한다.

**Version**: 1.0.0 | **Ratified**: 2026-09-16 | **Last Amended**: 2026-09-16
