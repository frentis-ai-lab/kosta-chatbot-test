const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const GeminiService = require('./geminiService');

/**
 * 웹 챗봇 서버 클래스
 * Express를 이용한 웹 서버와 API 엔드포인트 제공
 */
class ChatbotServer {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.app = express();
    this.geminiService = new GeminiService();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.startServer();
  }

  /**
   * 미들웨어 설정
   */
  setupMiddleware() {
    // CORS 설정
    this.app.use(cors());
    
    // JSON 요청 본문 파싱
    this.app.use(bodyParser.json());
    
    // 정적 파일 제공
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  /**
   * 라우트 설정
   */
  setupRoutes() {
    // 메인 페이지
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    // 메시지 전송 API
    this.app.post('/api/chat', this.validateChatRequest.bind(this), async (req, res) => {
      try {
        const { message } = req.body;
        
        // Gemini API로 메시지 전송
        const response = await this.geminiService.sendMessage(message);
        
        // 응답 반환
        res.json({ success: true, response });
      } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({
          success: false,
          error: '메시지 처리 중 오류가 발생했습니다.'
        });
      }
    });
    
    // 대화 기록 초기화 API
    this.app.post('/api/chat/clear', (req, res) => {
      try {
        this.geminiService.clearHistory();
        res.json({ success: true, message: '대화 기록이 초기화되었습니다.' });
      } catch (error) {
        console.error('대화 기록 초기화 오류:', error);
        res.status(500).json({
          success: false,
          error: '대화 기록 초기화 중 오류가 발생했습니다.'
        });
      }
    });

    // 어시스턴트 타입 조회 API
    this.app.get('/api/assistant/type', (req, res) => {
      try {
        const assistantType = this.geminiService.getAssistantType();
        res.json({ 
          success: true, 
          type: assistantType 
        });
      } catch (error) {
        console.error('어시스턴트 타입 조회 오류:', error);
        res.status(500).json({
          success: false,
          error: '어시스턴트 타입 조회 중 오류가 발생했습니다.'
        });
      }
    });

    // 어시스턴트 타입 설정 API
    this.app.post('/api/assistant/set-type', this.validateAssistantTypeRequest.bind(this), (req, res) => {
      try {
        const { type } = req.body;
        const success = this.geminiService.setAssistantType(type);
        
        if (success) {
          res.json({
            success: true,
            message: `어시스턴트 타입이 ${type}으로 변경되었습니다.`,
            type
          });
        } else {
          res.status(400).json({
            success: false,
            error: '유효하지 않은 어시스턴트 타입입니다.'
          });
        }
      } catch (error) {
        console.error('어시스턴트 타입 설정 오류:', error);
        res.status(500).json({
          success: false,
          error: '어시스턴트 타입 설정 중 오류가 발생했습니다.'
        });
      }
    });
  }

  /**
   * 채팅 요청 검증
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   * @param {Function} next - 다음 미들웨어 함수
   */
  validateChatRequest(req, res, next) {
    const { message } = req.body;
    
    // 메시지 필드 검증
    if (!message) {
      return res.status(400).json({
        success: false,
        error: '메시지 필드가 필요합니다.'
      });
    }
    
    // 메시지 타입 검증
    if (typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '메시지는 문자열이어야 합니다.'
      });
    }
    
    // 메시지 길이 검증
    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '메시지는 비어있지 않아야 합니다.'
      });
    }
    
    // 다음 미들웨어 실행
    next();
  }

  /**
   * 어시스턴트 타입 요청 검증
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   * @param {Function} next - 다음 미들웨어 함수
   */
  validateAssistantTypeRequest(req, res, next) {
    const { type } = req.body;
    
    // 타입 필드 검증
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'type 필드가 필요합니다.'
      });
    }
    
    // 타입 형식 검증
    if (typeof type !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'type은 문자열이어야 합니다.'
      });
    }
    
    // 다음 미들웨어 실행
    next();
  }

  /**
   * 서버 시작
   */
  startServer() {
    this.app.listen(this.port, () => {
      console.log(`서버가 http://localhost:${this.port} 에서 실행 중입니다.`);
    });
  }
}

// 서버 시작
new ChatbotServer(); 