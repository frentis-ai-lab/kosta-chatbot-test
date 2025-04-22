const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

/**
 * Gemini 서비스 클래스
 * Gemini API와의 통신을 담당
 */
class GeminiService {
  constructor() {
    // API 키 유효성 검사
    if (!config.apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요.');
    }
    
    // Generative AI 인스턴스 초기화
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    
    // 모델 인스턴스 생성
    this.model = this.genAI.getGenerativeModel(config.modelConfig);
    
    // 대화 기록
    this.chatHistory = [];
  }

  /**
   * 텍스트 메시지 전송 및 응답 수신
   * @param {string} message - 사용자 메시지
   * @returns {Promise<string>} - AI 응답
   */
  async sendMessage(message) {
    try {
      // 사용자 메시지 저장
      this.chatHistory.push({ role: 'user', parts: [{ text: message }] });
      
      // 프롬프트 생성
      const prompt = this.chatHistory.map(msg => msg.parts[0].text).join('\n');
      
      // 응답 생성
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // AI 응답 저장
      this.chatHistory.push({ role: 'model', parts: [{ text: response }] });
      
      return response;
    } catch (error) {
      console.error('Gemini API 호출 중 오류 발생:', error);
      return '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.';
    }
  }

  /**
   * 대화 기록 초기화
   */
  clearHistory() {
    this.chatHistory = [];
  }
}

module.exports = GeminiService; 