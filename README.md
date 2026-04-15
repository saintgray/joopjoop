## 줍줍 (JoopJoop)

지역 커뮤니티 **분실물–습득물 매칭** 플랫폼입니다.

- **매칭**: 사진 유사도(dHash 64-bit) + 위치(반경) + 시간(±일) 기반 후보 추천
- **안전**: 신고/모더레이션(관리자 화면)
- **연결**: 채팅(스레드/메시지)
- **등록 UX**: 브라우저 GPS 대신 **카카오 지도 핀 선택**으로 위치 확정(사용자는 위경도 미노출)

## 기술 스택

- **Frontend/Server**: Next.js (App Router) + TypeScript + Tailwind
- **DB**: Local MySQL (3306)
- **ORM**: Prisma
- **이미지 처리**: `sharp` (업로드 이미지 정규화 + 해시 계산)
- **지도**: `react-kakao-maps-sdk` + Kakao Local REST(좌표→주소)

## 요구 사항

- Node.js (권장: 최신 LTS)
- MySQL 서버 (기본 포트 3306)

## 환경 변수

`.env` 파일에 아래 값을 설정합니다.

```dotenv
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/jubhaeng"

# Kakao Local REST API Key (Server-side only)
KAKAO_REST_API_KEY="YOUR_KAKAO_REST_API_KEY"

# Kakao Maps JavaScript Key (Client-side)
NEXT_PUBLIC_KAKAO_MAP_API_KEY="YOUR_KAKAO_JS_API_KEY"
```

참고:
- **REST 키**와 **JS 키**는 용도가 다릅니다. 지도 표시에는 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`가 필요합니다.
- 카카오 Developers에서 플랫폼(Web)에 `http://localhost:3000`를 등록해야 로컬에서 지도가 정상 로드됩니다.

## DB 준비 (로컬 MySQL)

MySQL에 DB를 만들고 Prisma 마이그레이션을 적용합니다.

```bash
# 1) (선택) DB 생성
mysql -h 127.0.0.1 -P 3306 -uroot -p -e "CREATE DATABASE IF NOT EXISTS jubhaeng CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

# 2) 의존성 설치
npm install

# 3) 스키마/테이블 생성
npx prisma migrate dev
```

## 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속합니다.

## 주요 기능 흐름

### 글 등록 (분실/습득)

- 경로: `/items/new`
- 위치 선택: **지도에서 핀 클릭/드래그 → 확정**
- 업로드 이미지: `public/uploads/<uuid>.jpg`로 저장 (서버에서 JPG로 정규화)
- 저장 데이터: `Item`에 `latitude/longitude/locationText/imagePHash` 등 저장

### 매칭 추천

- 등록 시점에 **반대 유형(분실↔습득)** 대상으로 후보 추천
- 기본 조건(서버 코드 기준):
  - 반경: 5km
  - 시간: ±30일
  - 이미지 유사도: 해밍거리 임계값 적용

### 채팅

- 스레드 생성: 아이템 상세에서 “채팅 시작”
- 채팅방: `/threads/[id]`
- API:
  - `POST /api/threads`
  - `GET /api/threads/[id]/messages`
  - `POST /api/threads/[id]/messages`

### 신고/모더레이션

- 신고 페이지: `/report?type=ITEM|MESSAGE|USER&id=...`
- 관리자 화면: `/mod/reports` (ADMIN/MOD만)
- API: `POST /api/reports`, `GET /api/reports`

## 이미지 업로드 제한/주의

- **HEIC/HEIF는 현재 미지원**입니다. JPG/PNG로 변환 후 업로드하세요.

## 프로젝트 구조(요약)

- `src/app/api/*`: API routes
- `src/app/items/*`: 글 목록/상세/등록
- `src/app/threads/*`: 채팅
- `src/app/mod/*`: 모더레이션
- `src/lib/db.ts`: Prisma 클라이언트
- `prisma/schema.prisma`: 스키마

## 개발 팁

- dev 서버가 여러 개 떠 있으면(3000/3001) UI가 “롤백된 것처럼” 보일 수 있습니다. 하나만 띄우고 확인하세요.

---

## License

Private project.
