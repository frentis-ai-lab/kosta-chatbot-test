# Gemini API 챗봇

Gemini API를 사용하여 만든 간단한 챗봇 애플리케이션입니다. CLI와 웹 인터페이스 모두 지원합니다.

## 기능

- Gemini API를 통한 자연어 처리
- 대화 기록 유지 및 관리
- 간단한 명령어 지원 (종료, 대화 기록 초기화)
- 웹 인터페이스 지원

## 스크린샷

![웹 인터페이스](https://via.placeholder.com/800x450.png?text=Gemini+API+챗봇+웹+인터페이스)

## 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- NPM (v6 이상)
- Gemini API 키 (https://ai.google.dev/ 에서 얻을 수 있음)

### 설치 방법

1. 저장소 클론
```bash
git clone <repository-url>
cd kosta-chatbot-test
```

2. 의존성 패키지 설치
```bash
npm install
```

3. 환경 변수 설정
   - 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가:
```
GEMINI_API_KEY=your_api_key_here
```

### 실행 방법

#### CLI 모드
```bash
npm run start:cli
# 또는
RUN_MODE=cli npm start
```

#### 웹 서버 모드
```bash
npm run start:web
# 또는
npm start  # 기본값은 웹 서버 모드
```

웹 서버는 기본적으로 http://localhost:3000 에서 실행됩니다.

## 사용 방법

### CLI 모드
- 챗봇에 메시지 전송: 프롬프트에 메시지를 입력하고 Enter 키를 누릅니다.
- 대화 기록 초기화: `clear`를 입력합니다.
- 종료: `exit` 또는 `quit`를 입력합니다.

### 웹 인터페이스
1. 웹 브라우저에서 http://localhost:3000 으로 접속합니다.
2. 하단의 입력란에 메시지를 작성하고 전송 버튼을 클릭합니다.
3. 우측 상단의 휴지통 아이콘을 클릭하여 대화 기록을 초기화할 수 있습니다.

## API 엔드포인트

웹 서버 모드에서는 다음 API 엔드포인트를 제공합니다:

- `POST /api/chat`: 메시지 전송
  - 요청 본문: `{ "message": "사용자 메시지" }`
  - 응답: `{ "success": true, "response": "AI 응답" }`

- `POST /api/chat/clear`: 대화 기록 초기화
  - 응답: `{ "success": true, "message": "대화 기록이 초기화되었습니다." }`

## 테스트

```bash
npm test
```

## 라이센스

MIT 라이센스

## 개발 계획

- 대화 기록 저장 기능
- 고급 대화 컨텍스트 관리
- 다중 사용자 세션 지원 