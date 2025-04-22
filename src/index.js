/**
 * Gemini API 챗봇 애플리케이션 진입점
 * CLI 또는 웹 서버 모드 중 하나를 선택하여 실행
 */

// 실행 모드 확인 (기본은 웹 서버)
const runMode = process.env.RUN_MODE || 'web';

if (runMode === 'cli') {
  // CLI 모드로 실행
  console.log('CLI 모드로 실행 중...');
  require('./cli');
} else {
  // 웹 서버 모드로 실행
  console.log('웹 서버 모드로 실행 중...');
  require('./server');
}

// 실행 모드 안내
console.log('\n다른 모드로 실행하려면:');
console.log('- CLI 모드: npm run start:cli 또는 RUN_MODE=cli npm start');
console.log('- 웹 서버 모드: npm run start:web 또는 RUN_MODE=web npm start (기본값)'); 