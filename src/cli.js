const readline = require('readline');
const GeminiService = require('./geminiService');

/**
 * CLI 챗봇 애플리케이션 클래스
 */
class ChatbotCLI {
  constructor() {
    // 입출력 인터페이스 설정
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Gemini 서비스 인스턴스 생성
    try {
      this.geminiService = new GeminiService();
      this.startChat();
    } catch (error) {
      console.error('초기화 오류:', error.message);
      this.exitChat();
    }
  }

  /**
   * 챗봇 시작
   */
  startChat() {
    console.log('='.repeat(50));
    console.log('Gemini API 챗봇에 오신 것을 환영합니다!');
    console.log('종료하려면 "exit" 또는 "quit"을 입력하세요.');
    console.log('대화 기록을 초기화하려면 "clear"를 입력하세요.');
    console.log('='.repeat(50));
    
    this.promptUser();
  }

  /**
   * 사용자 입력 프롬프트 표시
   */
  promptUser() {
    this.rl.question('사용자: ', async (input) => {
      // 입력 처리
      const trimmedInput = input.trim();
      
      // 종료 명령 처리
      if (['exit', 'quit'].includes(trimmedInput.toLowerCase())) {
        return this.exitChat();
      }
      
      // 대화 기록 초기화 명령 처리
      if (trimmedInput.toLowerCase() === 'clear') {
        this.geminiService.clearHistory();
        console.log('대화 기록이 초기화되었습니다.');
        return this.promptUser();
      }
      
      // 빈 입력 처리
      if (!trimmedInput) {
        console.log('메시지를 입력해주세요.');
        return this.promptUser();
      }
      
      try {
        // Gemini API에 메시지 전송
        console.log('처리 중...');
        const response = await this.geminiService.sendMessage(trimmedInput);
        console.log('AI: ' + response);
      } catch (error) {
        console.error('오류:', error.message);
      }
      
      // 다음 입력 대기
      this.promptUser();
    });
  }

  /**
   * 챗봇 종료
   */
  exitChat() {
    console.log('챗봇을 종료합니다. 안녕히 가세요!');
    this.rl.close();
  }
}

// 애플리케이션 시작
new ChatbotCLI(); 