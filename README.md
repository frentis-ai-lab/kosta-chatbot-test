# Gemini API 챗봇

Gemini API를 사용하여 만든 간단한 챗봇 애플리케이션입니다. 현재는 명령줄 인터페이스(CLI)로 구현되어 있습니다.

## 기능

- Gemini API를 통한 자연어 처리
- 대화 기록 유지 및 관리
- 간단한 명령어 지원 (종료, 대화 기록 초기화)

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

```bash
npm start
```

## 사용 방법

- 챗봇에 메시지 전송: 프롬프트에 메시지를 입력하고 Enter 키를 누릅니다.
- 대화 기록 초기화: `clear`를 입력합니다.
- 종료: `exit` 또는 `quit`를 입력합니다.

## 테스트

```bash
npm test
```

## 라이센스

MIT 라이센스

## 개발 계획

- 웹 인터페이스 추가
- 대화 기록 저장 기능
- 고급 대화 컨텍스트 관리 