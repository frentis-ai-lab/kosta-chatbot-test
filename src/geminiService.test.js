// 의존성 모듈 불러오기
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GeminiService = require('./geminiService');
const config = require('./config');

// GoogleGenerativeAI 모듈을 모킹
jest.mock('@google/generative-ai');
jest.mock('./config', () => ({
  apiKey: 'mock-api-key',
  modelConfig: {
    model: 'gemini-pro',
    temperature: 0.7, 
    maxOutputTokens: 2048
  }
}));

describe('GeminiService 테스트', () => {
  let geminiService;
  let mockGenerateContent;
  let mockGetGenerativeModel;

  beforeEach(() => {
    // 모든 모킹 초기화
    jest.clearAllMocks();
    
    // 모의 응답 생성 함수
    mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => '테스트 응답입니다.'
      }
    });
    
    // 모의 모델 생성 함수
    mockGetGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent
    });
    
    // GoogleGenerativeAI 모킹 설정
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel
    }));
    
    // 테스트 대상 인스턴스 생성
    geminiService = new GeminiService();
  });

  test('GeminiService 인스턴스가 올바르게 생성되어야 함', () => {
    // 인스턴스 생성 확인
    expect(geminiService).toBeDefined();
    
    // API 키로 GoogleGenerativeAI 생성 확인
    expect(GoogleGenerativeAI).toHaveBeenCalledWith(config.apiKey);
    
    // 모델 설정으로 getGenerativeModel 호출 확인
    expect(mockGetGenerativeModel).toHaveBeenCalledWith(config.modelConfig);
    
    // 대화 기록 초기화 확인
    expect(geminiService.chatHistory).toEqual([]);
  });

  test('sendMessage 메서드가 올바르게 작동해야 함', async () => {
    // 테스트 메시지
    const testMessage = '안녕하세요';
    
    // sendMessage 실행
    const response = await geminiService.sendMessage(testMessage);
    
    // 응답 확인
    expect(response).toBe('테스트 응답입니다.');
    
    // 대화 기록에 사용자 메시지와 모델 응답이 추가되었는지 확인
    expect(geminiService.chatHistory).toHaveLength(2);
    expect(geminiService.chatHistory[0]).toEqual({
      role: 'user',
      parts: [{ text: testMessage }]
    });
    expect(geminiService.chatHistory[1]).toEqual({
      role: 'model',
      parts: [{ text: '테스트 응답입니다.' }]
    });
  });

  test('clearHistory 메서드가 대화 기록을 초기화해야 함', async () => {
    // 테스트 메시지 전송으로 대화 기록 생성
    await geminiService.sendMessage('테스트 메시지');
    
    // 대화 기록 존재 확인
    expect(geminiService.chatHistory.length).toBeGreaterThan(0);
    
    // 대화 기록 초기화
    geminiService.clearHistory();
    
    // 대화 기록 초기화 확인
    expect(geminiService.chatHistory).toEqual([]);
  });
}); 