// 환경 변수 로드
require('dotenv').config();

// API 키 설정
const apiKey = process.env.GEMINI_API_KEY || ''; // 실제 사용시 API 키를 설정해야 합니다.

// 모델 설정
const modelConfig = {
  model: 'gemini-2.0-flash', // 기본 모델
  temperature: 0.7,    // 생성 다양성 (0.0 ~ 1.0)
  maxOutputTokens: 2048, // 최대 출력 토큰 수
};

module.exports = {
  apiKey,
  modelConfig,
}; 