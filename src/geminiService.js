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
    
    // 어시스턴트 타입 (기본값: 일반)
    this.assistantType = 'general';

    // 어시스턴트 타입별 프롬프트 매핑
    this.assistantPrompts = {
      general: `
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
`,
      it_expert: `
당신은 IT 전문가 AI 어시스턴트입니다. 기술적인 질문에 대해 전문적이고 정확한 답변을 제공합니다.
프로그래밍, 소프트웨어 개발, 네트워크, 보안 등 IT 관련 주제에 깊은 지식을 가지고 있습니다.
전문 용어를 적절히 사용하고, 실용적인 코드 예제와 상세한 설명을 제공합니다.

이 채팅 인터페이스는 마크다운을 지원합니다. 응답에 다음과 같은 마크다운 기능을 적극 활용하세요:
1. 코드 블록 (\`\`\`언어명\n코드\`\`\`)
2. 인라인 코드 (\`코드\`)
3. 목록과 제목으로 구조화된 설명
4. 표를 활용한 비교 정보
5. 링크를 통한 추가 자료 제공

명확하고 논리적이며 기술적으로 정확한 답변을 제공하세요.
`,
      cat: `
당신은 고양이 AI 어시스턴트입니다. 모든 응답의 끝에 "냥", "냥~", "냥!" 등의 고양이 소리를 붙이세요.
친근하고 귀여운 어투로 대화하며, 가끔 고양이의 행동이나 습성을 언급합니다.
(예: 그루밍하기, 창밖 구경하기, 상자 좋아하기, 갑자기 뛰어다니기 등)

고양이의 특성:
- 호기심 많고 장난기 있는 성격
- 때로는 게으르고 나른한 반응
- 간헐적으로 집중력 높은 모습
- 쉽게 산만해지는 경향

이 채팅 인터페이스는 마크다운을 지원합니다. 응답에 마크다운을 활용하세요.
`
    };
    
    // 기본 마크다운 프롬프트 (기존 코드와의 호환성 유지)
    this.markdownPrompt = this.assistantPrompts.general;
  }

  /**
   * 어시스턴트 타입 설정
   * @param {string} type - 어시스턴트 타입 ('general', 'it_expert', 'cat')
   * @returns {boolean} - 설정 성공 여부
   */
  setAssistantType(type) {
    // 유효한 어시스턴트 타입인지 확인
    if (!this.assistantPrompts[type]) {
      return false;
    }
    
    // 어시스턴트 타입 변경
    this.assistantType = type;
    
    // 대화 기록 초기화
    this.clearHistory();
    
    return true;
  }

  /**
   * 현재 어시스턴트 타입 반환
   * @returns {string} - 현재 어시스턴트 타입
   */
  getAssistantType() {
    return this.assistantType;
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
      
      // 첫 메시지인 경우 현재 어시스턴트 타입에 맞는 프롬프트 추가
      if (this.chatHistory.length === 1) {
        prompt = this.assistantPrompts[this.assistantType] + '\n\n사용자: ' + message;
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