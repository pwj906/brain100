# 뇌 훈련 게임

Next.js와 Supabase를 사용한 뇌 훈련 게임입니다. 사용자별로 레벨과 진행 스테이지를 저장하여 로그인 시 이어서 플레이할 수 있습니다.

## 주요 기능

- 🧠 3가지 뇌 영역별 게임 (기억력, 언어능력, 계산력)
- 📊 유저별 레벨 및 경험치 시스템
- 🎮 스테이지별 난이도 증가
- 💾 Supabase를 통한 데이터 영구 저장
- 🔐 NextAuth를 통한 소셜 로그인 (카카오)

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

## 설정 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth 설정
NEXTAUTH_SECRET=your_nextauth_secret_here
KAKAO_CLIENT_ID=your_kakao_client_id_here
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. 프로젝트 설정에서 URL과 anon key를 복사하여 환경 변수에 설정하세요.
3. SQL Editor에서 `supabase-setup.sql` 파일의 내용을 실행하여 테이블을 생성하세요.

### 3. 카카오 로그인 설정

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션을 생성하세요.
2. 플랫폼 설정에서 웹 플랫폼을 추가하고 사이트 도메인을 설정하세요.
3. 카카오 로그인을 활성화하고 Redirect URI를 설정하세요: `http://localhost:3000/api/auth/callback/kakao`
4. JavaScript 키를 환경 변수 `KAKAO_CLIENT_ID`에 설정하세요.

### 4. 개발 서버 실행

```bash
npm install
npm run dev
```

## 데이터베이스 스키마

### user_game_data 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 기본 키 |
| user_id | TEXT | 사용자 이메일 |
| brain_area | TEXT | 뇌 영역 (memory, language, calculation) |
| level | INTEGER | 현재 레벨 |
| exp | INTEGER | 현재 경험치 |
| exp_to_next | INTEGER | 다음 레벨까지 필요한 경험치 |
| current_stage | INTEGER | 현재 스테이지 |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 수정 시간 |

## 게임 시스템

### 뇌 영역별 게임

1. **기억력 (Memory)**
   - 카드 뒤집기 게임
   - 짝을 맞춰서 모든 카드를 제거하는 게임

2. **언어능력 (Language)**
   - 단어 맞추기 게임 (향후 구현 예정)

3. **계산력 (Calculation)**
   - 수식 맞추기 게임 (향후 구현 예정)

### 레벨업 시스템

- 게임 성공 시 경험치 획득
- 경험치가 일정량에 도달하면 레벨업
- 레벨업 시 다음 레벨까지 필요한 경험치가 20% 증가

### 스테이지 시스템

- 각 게임은 스테이지별로 난이도가 증가
- 스테이지 클리어 시 다음 스테이지로 진행
- 진행 상황은 데이터베이스에 자동 저장

## API 엔드포인트

### GET /api/user-game
사용자의 게임 데이터를 조회합니다.

**Query Parameters:**
- `userId`: 사용자 이메일

### POST /api/user-game
사용자의 게임 데이터를 저장/업데이트합니다.

**Request Body:**
```json
{
  "userId": "user@example.com",
  "brainArea": "memory",
  "level": 2,
  "exp": 15,
  "expToNext": 20,
  "currentStage": 3
}
```
!!

## 개발 모드

개발 환경(`localhost` 또는 `127.0.0.1`)에서는 로그인 없이도 게임을 플레이할 수 있습니다.

## 라이센스

MIT License