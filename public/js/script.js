/**
 * Gemini API 챗봇 웹 인터페이스
 * 웹 UI와 API 통신을 담당하는 스크립트
 */

// DOM 요소
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const clearBtn = document.getElementById('clear-btn');
const statusMessage = document.getElementById('status-message');

// 설정 값
const API_URL = '/api/chat';
const CLEAR_API_URL = '/api/chat/clear';

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
  // 마크다운 설정
  setupMarkdownRenderer();
  
  // 이벤트 리스너 등록
  chatForm.addEventListener('submit', handleSubmit);
  clearBtn.addEventListener('click', clearChat);
  
  // 메시지 입력란에 포커스
  messageInput.focus();
  
  // 스크롤을 최하단으로 이동
  scrollToBottom();
});

/**
 * 마크다운 렌더러 설정
 */
function setupMarkdownRenderer() {
  // marked.js 옵션 설정 (공식 문서 참고: https://marked.js.org/)
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.error('하이라이팅 오류:', err);
        }
      }
      return hljs.highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
  });
}

/**
 * 폼 제출 핸들러
 * @param {Event} e - 이벤트 객체
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  const message = messageInput.value.trim();
  if (!message) return;
  
  // 사용자 메시지 표시
  addMessage(message, 'user');
  
  // 입력란 초기화
  messageInput.value = '';
  
  // 로딩 표시기 추가
  const loadingIndicator = addLoadingIndicator();
  
  // 상태 메시지 업데이트
  updateStatus('메시지를 처리 중입니다...');
  
  try {
    // API 호출
    const response = await sendMessage(message);
    
    // 로딩 표시기 제거
    loadingIndicator.remove();
    
    // 봇 응답 표시
    if (response.success) {
      addMessage(response.response, 'bot', true);
      updateStatus('');
    } else {
      throw new Error(response.error || '응답을 받지 못했습니다.');
    }
  } catch (error) {
    // 로딩 표시기 제거
    loadingIndicator.remove();
    
    // 오류 메시지 표시
    console.error('메시지 전송 오류:', error);
    addMessage('죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다.', 'bot');
    updateStatus('오류가 발생했습니다. 다시 시도해 주세요.');
  }
  
  // 스크롤을 최하단으로 이동
  scrollToBottom();
}

/**
 * 메시지 전송 API 호출
 * @param {string} message - 사용자 메시지
 * @returns {Promise<Object>} - API 응답
 */
async function sendMessage(message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP 오류: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * 채팅창에 메시지 추가
 * @param {string} text - 메시지 내용
 * @param {string} sender - 발신자 (user 또는 bot)
 * @param {boolean} parseMarkdown - 마크다운 파싱 여부
 * @returns {HTMLElement} - 생성된 메시지 요소
 */
function addMessage(text, sender, parseMarkdown = false) {
  // 메시지 요소 생성
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  
  // 메시지 내용 설정
  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  
  if (parseMarkdown) {
    // 마크다운 렌더링
    const markdownContent = document.createElement('div');
    markdownContent.classList.add('markdown-content');
    
    try {
      // 마크다운 파싱 (공식 문서에 따라 marked.parse 사용)
      markdownContent.innerHTML = marked.parse(text);
      
      // 외부 링크에 target="_blank" 추가
      markdownContent.querySelectorAll('a').forEach(link => {
        if (link.href.startsWith('http')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      });
      
      messageContent.appendChild(markdownContent);
    } catch (error) {
      console.error('마크다운 파싱 오류:', error);
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      messageContent.appendChild(paragraph);
    }
  } else {
    // 일반 텍스트 (사용자 메시지)
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageContent.appendChild(paragraph);
  }
  
  messageElement.appendChild(messageContent);
  
  // 채팅창에 추가
  chatMessages.appendChild(messageElement);
  
  return messageElement;
}

/**
 * 로딩 표시기 추가
 * @returns {HTMLElement} - 로딩 표시기 요소
 */
function addLoadingIndicator() {
  const indicatorElement = document.createElement('div');
  indicatorElement.classList.add('typing-indicator');
  indicatorElement.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  
  chatMessages.appendChild(indicatorElement);
  scrollToBottom();
  
  return indicatorElement;
}

/**
 * 상태 메시지 업데이트
 * @param {string} text - 상태 메시지
 */
function updateStatus(text) {
  statusMessage.textContent = text;
}

/**
 * 채팅 기록 초기화
 */
async function clearChat() {
  // 사용자 확인
  if (!confirm('대화 내용을 모두 삭제하시겠습니까?')) {
    return;
  }
  
  try {
    // API 호출
    const response = await fetch(CLEAR_API_URL, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 채팅창 초기화
      chatMessages.innerHTML = `
        <div class="message bot">
          <div class="message-content">
            <p>안녕하세요! Gemini API 챗봇입니다. 무엇을 도와드릴까요?</p>
            <p>마크다운 형식을 지원합니다. 예를 들어 다음과 같이 입력해보세요:</p>
            <div class="markdown-content">
              <pre><code># 제목
- 항목 1
- 항목 2

\`\`\`javascript
console.log('Hello, Markdown!');
\`\`\`</code></pre>
            </div>
          </div>
        </div>
      `;
      
      updateStatus('대화 기록이 초기화되었습니다.');
      
      // 3초 후 상태 메시지 제거
      setTimeout(() => {
        updateStatus('');
      }, 3000);
    } else {
      throw new Error(data.error || '초기화 실패');
    }
  } catch (error) {
    console.error('대화 기록 초기화 오류:', error);
    updateStatus('대화 기록 초기화 중 오류가 발생했습니다.');
  }
}

/**
 * 스크롤을 채팅창 최하단으로 이동
 */
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
} 