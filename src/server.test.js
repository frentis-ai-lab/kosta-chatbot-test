const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const GeminiService = require('./geminiService');

// GeminiService 모듈을 모킹
jest.mock('./geminiService');

describe('ChatbotServer API 테스트', () => {
  let app;
  let mockGeminiService;
  
  beforeEach(() => {
    // Express 앱 생성
    app = express();
    app.use(bodyParser.json());
    
    // 모의 GeminiService 인스턴스 생성
    mockGeminiService = new GeminiService();
    
    // sendMessage 메서드 모킹
    mockGeminiService.sendMessage = jest.fn().mockImplementation(async (message) => {
      if (!message) {
        throw new Error('메시지는 비어있지 않아야 합니다.');
      }
      return '테스트 응답입니다.';
    });
    
    // clearHistory 메서드 모킹
    mockGeminiService.clearHistory = jest.fn();
    
    // 라우트 설정
    app.post('/api/chat', async (req, res) => {
      try {
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
        
        // Gemini API로 메시지 전송
        const response = await mockGeminiService.sendMessage(message);
        
        // 응답 반환
        res.json({ success: true, response });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message || '메시지 처리 중 오류가 발생했습니다.'
        });
      }
    });
    
    app.post('/api/chat/clear', (req, res) => {
      try {
        mockGeminiService.clearHistory();
        res.json({ success: true, message: '대화 기록이 초기화되었습니다.' });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message || '대화 기록 초기화 중 오류가 발생했습니다.'
        });
      }
    });
  });
  
  test('POST /api/chat 엔드포인트가 유효한 메시지에 응답해야 함', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '안녕하세요' })
      .set('Accept', 'application/json');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.response).toBe('테스트 응답입니다.');
    expect(mockGeminiService.sendMessage).toHaveBeenCalledWith('안녕하세요');
  });
  
  test('POST /api/chat 엔드포인트가 빈 메시지 필드를 거부해야 함', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({})
      .set('Accept', 'application/json');
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('메시지 필드가 필요합니다.');
  });
  
  test('POST /api/chat 엔드포인트가 비문자열 메시지를 거부해야 함', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 123 })
      .set('Accept', 'application/json');
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('메시지는 문자열이어야 합니다.');
  });
  
  test('POST /api/chat/clear 엔드포인트가 대화 기록을 초기화해야 함', async () => {
    const res = await request(app)
      .post('/api/chat/clear')
      .set('Accept', 'application/json');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('대화 기록이 초기화되었습니다.');
    expect(mockGeminiService.clearHistory).toHaveBeenCalled();
  });
}); 