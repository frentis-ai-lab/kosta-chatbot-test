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
    
    // 마크다운 지원 안내 프롬프트
    this.markdownPrompt = `
당신은 도움이 되는 AI 어시스턴트입니다. 이 채팅 인터페이스는 마크다운을 지원합니다.
가능하면 응답을 마크다운으로 작성해주세요. 특히 다음과 같은 마크다운 기능을 활용하세요:

1. 제목과 소제목 (# ## ###)
2. 목록 (- * 1. 2.)
3. 강조 (**bold**, *italic*)
4. 링크 [텍스트](URL)
5. 코드 블록 (\`\`\`코드\`\`\`)
6. 표 (마크다운 표 형식)
7. 인용 (> 인용문)

필요할 때 이러한 마크다운 요소를 사용하여 읽기 쉽고 구조화된 응답을 제공해주세요.
`;
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
      let prompt = '';
      
      // 첫 메시지인 경우 마크다운 지원 안내 추가
      if (this.chatHistory.length === 1) {
        prompt = this.markdownPrompt + '\n\n사용자: ' + message;
      } else {
        // 대화 기록 기반 프롬프트 생성
        prompt = this.chatHistory.map(msg => {
          const role = msg.role === 'user' ? '사용자' : 'AI';
          return `${role}: ${msg.parts[0].text}`;
        }).join('\n');
      }
      
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