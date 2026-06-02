import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { initializeFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ===== 🔥 Firebase 설정 =====
// TODO: Firebase 콘솔(console.firebase.google.com)에서 프로젝트 생성 후 발급받은 설정값으로 변경하세요.
const firebaseConfig = {
    apiKey: "AIzaSyB-L5P8XZyFAmsrAHPqIIc__qqM_TunegY",
    authDomain: "snu-me-yyj.firebaseapp.com",
    projectId: "snu-me-yyj",
    storageBucket: "snu-me-yyj.firebasestorage.app",
    messagingSenderId: "292468821013",
    appId: "1:292468821013:web:a6c809863462487612521c"
};

let app, db;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        app = initializeApp(firebaseConfig);
        db = initializeFirestore(app, { experimentalForceLongPolling: true });
        console.log(`🔥 [Firebase] 초기화 완료`);
    } catch (e) {
        console.error("🚨 [Firebase] 초기화 실패:", e);
    }
} else {
    console.warn("⚠️ [Firebase] API 키가 미설정되어 DB 저장이 비활성화되었습니다.");
}

// ===== 설정 값 =====
const OLLAMA_URL = "http://localhost:11434/api/generate";
// const OLLAMA_URL = "https://gemini-3-1-flash-lite-dot-apis-sandbox.ey.r.appspot.com/generate";

// ===== 📚 문제 은행 (Local DB) =====
const PROBLEM_DB = {
    "task1": {
        title: "확률의 계산 - 경로에 따른 확률",
        background: "학생들은 '경우의 수'와 '확률의 기본 개념'은 배웠으나, 각 결과가 일어날 가능성이 다를 때의 확률 계산(수형도 활용 등)은 헷갈려 하는 상태입니다.",
        content: "입구 P에 공을 넣으면 아래로 떨어지며 다음과 같은 경로를 거칩니다.\n1. 첫 번째 갈림길에서 관이 왼쪽과 오른쪽 두 갈래로 나뉩니다.\n2. 왼쪽 관으로 떨어지면 곧바로 위치 A에 도착합니다.\n3. 오른쪽 관으로 떨어지면 아래에서 두 번째 갈림길을 만나 다시 두 갈래로 나뉩니다.\n4. 두 번째 갈림길에서 왼쪽으로 떨어지면 위치 B에, 오른쪽으로 떨어지면 위치 C에 도착합니다.\n(단, 공이 모든 갈림길에서 양쪽 방향으로 떨어질 가능성은 같습니다.)",
        goals: [
            "위치 A, B, C에 공이 도착할 확률이 모두 같은지 토론하기",
            "공이 위치 B에 도착할 확률 구하기"
        ],
        teacherHint: "교사가 먼저 'A는 1/2이고 B, C는 1/4이야'라고 정답을 알려주지 말고, 'A로 가는 길과 B, C로 가는 길은 갈림길을 몇 번 거칠까요?'와 같이 수형도를 떠올릴 수 있는 힌트를 통해 스스로 발견하게 유도하세요.",
        uiHtml: `
            <p><strong>[문제 상황]</strong> 입구 P에서 공을 떨어뜨렸을 때 갈림길을 거쳐 A, B, C에 도착하는 장치</p>
            <div style="text-align: center; margin: 15px 0;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320" width="100%" height="100%" style="max-width: 350px;">
                  <style>
                    .pipe-border {
                      stroke: #86a8d0;
                      stroke-width: 24px;
                      fill: none;
                      stroke-linejoin: miter;
                      stroke-linecap: butt;
                    }
                    .pipe-fill {
                      stroke: #e2edf8;
                      stroke-width: 18px;
                      fill: none;
                      stroke-linejoin: miter;
                      stroke-linecap: butt;
                    }
                    .label {
                      font-family: 'Times New Roman', Times, serif;
                      font-size: 26px;
                      fill: #555555;
                      text-anchor: middle;
                    }
                  </style>
                  <clipPath id="pipe-clip">
                     <rect x="0" y="40" width="500" height="230" />
                  </clipPath>
                  <g clip-path="url(#pipe-clip)">
                    <path class="pipe-border" d="M 200 30 L 200 90" />
                    <path class="pipe-border" d="M 330 180 L 230 290" />
                    <path class="pipe-border" d="M 70 290 L 70 160 L 200 80 L 330 160 L 330 190 L 430 290" />
                    <path class="pipe-fill" d="M 200 30 L 200 90" />
                    <path class="pipe-fill" d="M 330 180 L 230 290" />
                    <path class="pipe-fill" d="M 70 290 L 70 160 L 200 80 L 330 160 L 330 190 L 430 290" />
                  </g>
                  <text x="200" y="30" class="label">P</text>
                  <text x="70" y="305" class="label">A</text>
                  <text x="230" y="305" class="label">B</text>
                  <text x="430" y="305" class="label">C</text>
                </svg>
            </div>
            <p>- 첫 번째 갈림길: 왼쪽(A 도착), 오른쪽(두 번째 갈림길로)</p>
            <p>- 두 번째 갈림길: 왼쪽(B 도착), 오른쪽(C 도착)</p>
            <p><strong>[과제 1]</strong> A, B, C에 도착할 확률이 모두 같은지 토론하기</p>
            <p><strong>[과제 2]</strong> 공이 위치 B에 도착할 확률 구하기</p>
        `,
        teacherInitialText: "얘들아 안녕! 오늘 우리가 탐구할 확률 문제를 화면에 띄워줄게. 입구 P에 공을 넣으면 갈림길을 거쳐 A, B, C 중 한 곳에 떨어지는 장치란다.<br>우리의 첫 번째 과제는 <b>위치 A, B, C에 공이 도착할 확률이 모두 같은지</b> 토론해 보는 거야. 어떻게 생각하니?"
    },
    "task2": {
        title: "일차방정식의 활용 - 거속시",
        background: "학생들은 일차방정식 풀이는 할 수 있지만, 문장제 문제(특히 거리, 속력, 시간)를 식으로 세우는 것을 매우 어려워합니다.",
        content: "민준이가 집에서 학교까지 가는데, 시속 4km로 걸어가면 시속 12km로 자전거를 타고 가는 것보다 20분 늦게 도착한다고 합니다.",
        goals: [
            "거·속·시(거리, 속력, 시간) 관계를 파악하고 미지수 정하기",
            "방정식을 세우고 집에서 학교까지의 거리 구하기"
        ],
        teacherHint: "교사가 먼저 식을 세워주지 말고, '시간은 어떻게 구할 수 있을까?', '단위가 시속이니까 20분은 몇 시간일까?'와 같은 질문으로 학생들이 스스로 미지수 x를 설정하고 식을 유도하도록 하세요.",
        uiHtml: `
            <p><strong>[문제 상황]</strong> 집에서 학교까지의 이동 수단에 따른 시간 차이</p>
            <p>- 도보: 시속 4km</p>
            <p>- 자전거: 시속 12km</p>
            <p>- 조건: 걸어가면 자전거보다 20분 늦게 도착</p>
            <p><strong>[과제 1]</strong> 거·속·시 관계를 파악하고 미지수 정하기</p>
            <p><strong>[과제 2]</strong> 방정식을 세워 집에서 학교까지의 거리 구하기</p>
        `,
        teacherInitialText: "얘들아 안녕! 오늘은 실생활에서 자주 만나는 '거속시' 문제를 같이 풀어볼 거야.<br>민준이가 걸어갈 때랑 자전거 탈 때 20분 차이가 난다고 하네. <b>먼저 무엇을 미지수 x로 두면 좋을지</b> 같이 이야기해볼까?"
    }
};

const currentTaskId = localStorage.getItem('selected_task') || 'task1';
let currentTask = PROBLEM_DB[currentTaskId] || PROBLEM_DB['task1'];

let TASK_INFO = `[수행 과제: ${currentTask.title}]\n🚨[수업 배경]: ${currentTask.background}\n[제시문] ${currentTask.content}\n\n${currentTask.goals.map((g, i) => `과제${i+1}) ${g}`).join('\n')}`;

// 👨‍🏫 대화적 교수법 원칙 상수 (교사 전용 지침)
const TEACHER_PROMPT_BASE = `당신은 '대화적 교수법(Dialogic Teaching)'의 5가지 원칙을 실천하는 수학 교사 에이전트입니다.
학생과의 모든 상호작용에서 아래 원칙과 구체적 전략을 반드시 준수하세요.

## 대화적 교수법 5가지 원칙 및 실행 전략

### 1. 집단적 (Collective)
원칙: 교사와 학생이 함께 지식을 구성하는 공동 탐구의 장을 만든다.
전략: 특정 학생의 생각을 학급 전체의 토론 소재로 확장한다. "시준이의 생각을 우리 모두 같이 살펴봅시다"처럼 개인 발언을 공동 탐구로 전환한다. 학생이 혼자 정답을 찾도록 두지 않고, 함께 생각을 펼쳐나가도록 유도한다.
발화 예시: "시준이가 '1/3이다'라고 했는데, 이 생각을 우리 함께 살펴봅시다. 시준이의 말이 맞는지, 아니면 다른 가능성이 있는지 같이 탐구해 볼게요. 지금 시준이와 같은 생각을 하고 있는 친구, 손 들어볼까요?"

### 2. 상호적 (Reciprocal)
원칙: 학생들이 서로의 말에 귀 기울이고, 대안적 관점을 존중하며 대화한다.
전략: 한 학생의 발언을 다른 학생이 재진술하거나 평가하도록 요청한다. 동의/반대 의견을 이유와 함께 말하도록 유도한다. 교사가 직접 정오를 판단하지 않고, 학생 간 대화로 판단을 유보한다.
발화 예시: "방금 시준이가 '결과가 A, B, C 세 가지니까 1/3'이라고 했어요. 이 말에 동의하는 친구? 동의하지 않는 친구? 동의하지 않는다면 시준이에게 직접 왜 그런지 설명해 줄 수 있을까요?"

### 3. 지지적 (Supportive)
원칙: 오답에 대한 두려움 없이 자유롭게 아이디어를 표현할 수 있는 심리적 안전망을 만든다.
전략: 오개념을 바로 교정하지 않고, 틀린 생각에서 출발하여 함께 점검한다. 충분한 생각할 시간(wait time)을 제공한다. "좋은 시도야", "그렇게 생각할 수 있어" 등으로 시도 자체를 인정한다. 추측과 상상도 환영한다는 분위기를 명시적으로 조성한다.
발화 예시: "시준이의 생각은 아주 자연스러운 출발점이에요. '경우가 3가지니까 1/3'이라고 생각하는 건 많은 사람이 처음에 떠올리는 직관이거든요. 틀렸다고 바로 말하는 게 아니라, 이 생각이 어디까지 맞고 어디서 달라지는지 같이 천천히 따라가 봅시다. 아직 확신이 없어도 괜찮아요."

### 4. 누적적 (Cumulative)
원칙: 이전 발언을 발판 삼아 다음 사고로 연결하며, 이해를 점진적으로 심화한다.
전략: 학생의 답변을 다음 질문의 출발점으로 활용한다. "그 생각에 이어서", "방금 말을 발판으로" 등의 연결 표현을 사용한다. 단계적 발문으로 오개념 → 의심 → 수정 → 심화의 흐름을 설계한다.
발화 예시: "P에서 공이 처음 만나는 갈림길에서 어디로 갈 수 있어요? 왼쪽으로 가면 바로 A에 도착하죠? 오른쪽으로 가면 어떻게 돼요? 그럼 B에 도착하려면 공이 어떤 길을 거쳐야 하죠? A에 도달하는 것과 B에 도달하는 것, 거쳐야 하는 갈림길 횟수가 같은가요?"

### 5. 목적 지향적 (Purposeful)
원칙: 자유로운 대화 속에서도 교사는 명확한 학습 목표를 향해 대화를 설계하고 조율한다.
전략: 대화가 탈선할 경우 학습 목표로 부드럽게 되돌린다. 대화의 최종 목적지를 항상 염두에 둔다. 흥미로운 탈선 발언도 "좋은 생각인데, 오늘 우리 목표로 돌아와서..."로 연결한다. 대화 마무리에서 핵심 개념을 학생 언어로 정리하게 유도한다.
발화 예시: "지금까지 나온 이야기들을 정리해봅시다. 우리가 오늘 발견한 것은 무엇인가요? '결과의 수'를 세는 것과 '각 경로의 확률'을 계산하는 것이 왜 다른지, 누가 자신의 말로 설명해 줄 수 있나요? 그게 바로 오늘 우리가 함께 이해한 핵심이에요."`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getSleepTime = () => localStorage.getItem('turbo_mode') === 'true' ? 500 : 18000;

// 모둠원 수 설정 (1~3명)
const STUDENT_COUNT = parseInt(localStorage.getItem('student_count') || '3', 10);
const ACTIVE_STUDENTS = ["민준", "서연", "연우"].slice(0, STUDENT_COUNT);

// 모둠원 역량 상태 상태 점수 (초기값 1.0 - 역량 최하점)
let currentScores = {};
let understandingLevels = {};
let understandingHistory = {};
let scoreHistory = {};

ACTIVE_STUDENTS.forEach(name => {
    currentScores[name] = [1.0, 1.0, 1.0, 1.0, 1.0];
    let defaultLevel = (name === "서연") ? 70 : ((name === "민준") ? 30 : 0);
    understandingLevels[name] = localStorage.getItem(`persona_understanding_${name}`) !== null ? parseInt(localStorage.getItem(`persona_understanding_${name}`)) : defaultLevel;
    understandingHistory[name] = [understandingLevels[name]];
    scoreHistory[name] = [[...currentScores[name]]];
});

// 📈 이해도 변화 추적용 데이터 기록
let turnCount = 0;
let chartLabels = ["시작"];
let understandingChart = null;

// 🔥 대화 캐시용 배열 및 캐시 저장 함수
let chatHistoryForStorage = [];

function saveSimulationState() {
    const simState = {
        currentScores,
        understandingLevels,
        understandingHistory,
        scoreHistory,
        turnCount,
        chartLabels,
        chatHistoryForStorage
    };
    localStorage.setItem('tobagi_sim_state', JSON.stringify(simState));
}


// 프롬프트 가이드라인 (대환장 중학생 모드 반영)
function getSystemPrompt(roleName) {
    let prompt = "";
    
    // 1. 공통 기본 설정 분기 (학생 vs 교사)
    if (roleName === "교사") {
        prompt = `당신의 이름은 '교사'이며, 중학교 1학년 수학 교사로서 모둠 방 대화에 참여하고 있습니다. 당신은 '대화적 교수법(Dialogic Teaching)'을 실천하는 교사입니다. 학생들(${ACTIVE_STUDENTS.join(", ")})의 대화가 정체되거나, 현재 수행중인 과제를 해결했다고 판단될 때 자연스럽게 개입하세요. 반말이 아닌 친절하고 부드러운 존댓말(예: ~해요, ~할까요?)을 1~2문장으로 짧게 사용하세요.\n\n${TEACHER_PROMPT_BASE}\n\n다음 과제 배경을 참고하세요.\n${TASK_INFO}\n\n[🚨운영 지침: 당신은 과제 진행자입니다. 과제1부터 과제${currentTask.goals.length}까지 한 번에 하나씩 순차적으로 제시하세요. 학생들이 현재 과제의 핵심 정답을 어느 정도 도출하고 합의했다면, 불필요하게 모든 숫자를 검산시키거나 완벽한 증명을 요구하지 말고 즉시 칭찬하며 다음 과제로 자연스럽게 넘어가세요. 만약 과제${currentTask.goals.length}까지 모두 성공적으로 완료되었다면 반드시 "오늘 모둠 활동은 여기까지 할게요! 모두 수고했어요."라고 말하며 대화를 마무리하세요. 또한, 교사가 먼저 정답을 알려주지 말고 다음과 같이 유도하세요. ${currentTask.teacherHint}]\n`;
    } else {
        prompt = `당신의 이름은 '${roleName}'이며, 중학교 1학년 학생으로서 수학 모둠 방 대화에 참여하고 있습니다. 완벽한 AI 티를 내지 말고, 무조건 1~2문장의 짧은 구어체 반말(예: ㅋㅋ, 응 맞아, 아 몰라)을 쓰세요. 다음 과제 배경을 참고하세요.\n${TASK_INFO}\n\n[🚨학생 지침: 교사나 시스템이 제시한 '현재 진행 중인 과제'에만 집중하세요. 스포일러는 금지입니다. ★가장 중요한 규칙: 절대 친구의 말을 앵무새처럼 반복하거나 "해보자", "맞아"라고 동의만 하며 턴을 낭비하지 마세요. 발화 시 반드시 본인이 직접 구체적인 숫자를 계산해서 말하거나, 새로운 아이디어를 던져서 대화를 무조건 한 단계 진전시키세요.]\n`;
        if (roleName === "민준") prompt ;
        if (roleName === "서연") prompt ;
        if (roleName === "연우") prompt ;
    }
    
    // 2. 커스텀 설정이 있다면 기본 설정 위에 덧붙이기
    const savedPrompt = localStorage.getItem(`persona_prompt_${roleName}`);
    if (savedPrompt) {
        prompt = `\n\n${savedPrompt}\n`;
    }
    
    // 현재 이해도 상태를 프롬프트에 주입하여 태도를 변화시킴 (교사는 제외)
    if (roleName !== "교사" && understandingLevels[roleName] !== undefined) {
        const level = understandingLevels[roleName];
        prompt += `\n[중요 상태: 현재 당신의 '개념 이해도'는 ${level}/100 입니다. 
        0~30이면 문제에 접근하는 아이디어 자체를 떠올리지 못하거나, 자신의 오개념을 고집하고, 또는 과제에 집중하지 못하는 모습을 보이세요. 
        30~70이면 혼란스러워하며, 문제에 접근 하기는 하지만 나사빠진 접근을 보여주세요. 또한 "아 혹시 ~라는 뜻이야?"라며 적극적으로 질문하세요. 
        70~100이면 과제를 완벽히 이해하여 정답을 깨닫고, 아직 모르는 친구를 친절하고 논리적으로 도와주세요.]\n`;
    }
    return prompt;
}

// 초기 화면 로드 시 테이블 그리기
function renderTable() {
    const tbody = document.getElementById('scoreTableBody');
    tbody.innerHTML = '';
    for (const [name, scores] of Object.entries(currentScores)) {
        let nameHtml = `<strong>${name}</strong>`;
        let personaTooltip = '';
        
        const savedScores = localStorage.getItem(`persona_scores_${name}`);
        if (savedScores) {
            const pScores = JSON.parse(savedScores);
            const studentLabels = { 1: "낮음", 2: "보통", 3: "높음" };
            const teacherLabels = { 1: "낮음(지시적)", 2: "보통", 3: "높음(대화적)" };
            
            if (name === "교사") {
                personaTooltip = `
                    <div class="name-tooltip" style="visibility: hidden; opacity: 0; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: #2C3E50; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 11px; white-space: nowrap; transition: opacity 0.2s; pointer-events: none; z-index: 20; text-align: left; line-height: 1.5; margin-bottom: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="color: #4CAF50; font-weight: bold; margin-bottom: 4px; text-align: center;">[교사 성향 요약]</div>
                        대화적 교수법: ${teacherLabels[pScores.tq1] || '보통'}<br>
                        도움 남용자 대응: ${teacherLabels[pScores.tq2] || '보통'}<br>
                        도움 회피자 대응: ${teacherLabels[pScores.tq3] || '보통'}
                    </div>
                `;
            } else {
                personaTooltip = `
                    <div class="name-tooltip" style="visibility: hidden; opacity: 0; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: #2C3E50; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 11px; white-space: nowrap; transition: opacity 0.2s; pointer-events: none; z-index: 20; text-align: left; line-height: 1.5; margin-bottom: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="color: #4CAF50; font-weight: bold; margin-bottom: 4px; text-align: center;">[${name} 성향 요약]</div>
                        흥미: ${studentLabels[pScores.q1] || '보통'} | 학습지향: ${studentLabels[pScores.q2] || '보통'}<br>
                        자신감: ${studentLabels[pScores.q3] || '보통'} | 통제력: ${studentLabels[pScores.q4] || '보통'}<br>
                        자원활용: ${studentLabels[pScores.q5] || '보통'} | 수학불안: ${studentLabels[pScores.q6] || '보통'}<br>
                        사고유연: ${studentLabels[pScores.q7] || '보통'} | 검산점검: ${studentLabels[pScores.q8] || '보통'}
                    </div>
                `;
            }
        } else {
            let defaultDesc = "";
            if (name === "민준") defaultDesc = "기본: 오개념, 고집";
            if (name === "서연") defaultDesc = "기본: 모범생, 조력자";
            if (name === "연우") defaultDesc = "기본: 하위권, 의존적";
            if (name === "교사") defaultDesc = "기본: 대화적 교수법 실천 교사";
            personaTooltip = `
                <div class="name-tooltip" style="visibility: hidden; opacity: 0; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background-color: #2C3E50; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap; transition: opacity 0.2s; pointer-events: none; z-index: 20; margin-bottom: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    [${defaultDesc}]
                </div>
            `;
        }
        
        nameHtml = `
            <div style="position: relative; display: inline-block; cursor: help; border-bottom: 1px dashed #95a5a6;"
                 onmouseenter="this.querySelector('.name-tooltip').style.opacity='1'; this.querySelector('.name-tooltip').style.visibility='visible';"
                 onmouseleave="this.querySelector('.name-tooltip').style.opacity='0'; this.querySelector('.name-tooltip').style.visibility='hidden';">
                <strong>${name}</strong>
                ${personaTooltip}
            </div>
        `;

        let hpText = '';
        if (understandingLevels[name] !== undefined) {
            const level = understandingLevels[name];
            // 이해도 구간에 따른 색상 변경
            let barColor = '#f44336'; // 0~30 구간: 빨간색
            if (level > 70) barColor = '#4caf50'; // 70~100 구간: 초록색
            else if (level > 30) barColor = '#ffc107'; // 30~70 구간: 노란색
            
            const bgColor = '#e0e0e0'; 
            const levelTitle = level >= 100 ? '완벽히 이해함! ✨' : `이해도: ${level}%`;
            
            hpText = `
                <div style="position: relative; margin-top: 8px; padding-bottom: 2px; cursor: help;"
                     onmouseenter="this.querySelector('.hp-tooltip').style.opacity='1'; this.querySelector('.hp-tooltip').style.visibility='visible';"
                     onmouseleave="this.querySelector('.hp-tooltip').style.opacity='0'; this.querySelector('.hp-tooltip').style.visibility='hidden';">
                    <div class="hp-tooltip" style="visibility: hidden; opacity: 0; position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background-color: #424242; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap; transition: opacity 0.2s; pointer-events: none; z-index: 10;">
                        ${levelTitle}
                    </div>
                    <div style="width: 100%; height: 6px; background: ${bgColor}; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${level}%; height: 100%; background: ${barColor}; transition: width 0.5s ease-in-out; transition-property: width, background-color;"></div>
                    </div>
                </div>
            `;
        }
        tbody.innerHTML += `
            <tr>
                <td>${nameHtml}${hpText}</td>
                <td>${Number(scores[0]).toFixed(1)}</td>
                <td>${Number(scores[1]).toFixed(1)}</td>
                <td>${Number(scores[2]).toFixed(1)}</td>
                <td>${Number(scores[3]).toFixed(1)}</td>
                <td>${Number(scores[4]).toFixed(1)}</td>
            </tr>`;
    }
}
renderTable();

// 차트 초기화 함수
function initChart() {
    const ctx = document.getElementById('understandingChart').getContext('2d');
    const datasets = [];
    const colors = { "민준": "#FF9800", "서연": "#4CAF50", "연우": "#2196F3" };
    ACTIVE_STUDENTS.forEach(name => {
        datasets.push({
            label: name,
            data: understandingHistory[name],
            borderColor: colors[name],
            backgroundColor: colors[name],
            tension: 0.3
        });
    });

    understandingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: { y: { min: 0, max: 100 } },
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// 차트 데이터 갱신 함수 (지표 선택 시)
function updateChartData() {
    if (!understandingChart) return;
    understandingChart.data.labels = chartLabels; // 캐시 복원 시 차트 라벨 참조 업데이트
    const metric = document.getElementById('chartMetricSelect').value;
    
    ACTIVE_STUDENTS.forEach((name, index) => {
        if (metric === "understanding") {
            understandingChart.data.datasets[index].data = understandingHistory[name];
            if (index === 0) {
                understandingChart.options.scales.y.min = 0;
                understandingChart.options.scales.y.max = 100;
            }
        } else {
            const metricIdx = parseInt(metric);
            understandingChart.data.datasets[index].data = scoreHistory[name].map(arr => arr[metricIdx]);
            if (index === 0) {
                understandingChart.options.scales.y.min = 1.0;
                understandingChart.options.scales.y.max = 5.0;
            }
        }
    });
    understandingChart.update();
}

// 대화 텍스트 포맷팅 함수
function getChatContext() {
    // 💡 타이핑 인디케이터(작성 중...) 말풍선은 컨텍스트 추출에서 제외
    const messages = document.querySelectorAll('.message:not(.typing-indicator)');
    let context = "";
    messages.forEach(msg => {
        const nameSpan = msg.querySelector('.s-name');
        const speaker = nameSpan ? nameSpan.innerText : (msg.querySelector('.speaker-name') ? msg.querySelector('.speaker-name').innerText : "사용자");
        const clone = msg.cloneNode(true);
        const sn = clone.querySelector('.speaker-name');
        if(sn) sn.remove();
        const content = clone.innerText.trim();
        context += `${speaker}: ${content}\n`;
    });
    return context;
}

// UI 메시지 추가 함수
function appendMessage(sender, text, isUser, isRestore = false, principle = null) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'msg-user' : 'msg-ai'}`;
    
    //  발화자별 말풍선 색상 지정 (그래프 색상 매칭)
    if (sender === '민준') {
        msgDiv.style.backgroundColor = '#fff3e0'; // 연한 주황
        msgDiv.style.border = '1px solid #ffe0b2';
    } else if (sender === '서연') {
        msgDiv.style.backgroundColor = '#e8f5e9'; // 연한 초록
        msgDiv.style.border = '1px solid #c8e6c9';
    } else if (sender === '연우') {
        msgDiv.style.backgroundColor = '#e3f2fd'; // 연한 파랑
        msgDiv.style.border = '1px solid #bbdefb';
    } else if (sender === '교사') {
        msgDiv.style.backgroundColor = '#ffffff'; // 흰색
        msgDiv.style.border = '1px solid #e0e0e0';
    }

    let speakerHtml = `<div class="speaker-name"><span class="s-name">${sender}</span></div>`;
    if (principle) {
        speakerHtml = `<div class="speaker-name"><span class="s-name">${sender}</span> <span class="badge" style="background: #9B59B6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">[${principle}]</span></div>`;
    }

    if (!isUser) msgDiv.innerHTML = `${speakerHtml}${text}`;
    else msgDiv.innerHTML = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // MathJax 수식 동적 렌더링
    if (window.MathJax) {
        MathJax.typesetPromise([msgDiv]).catch((err) => console.log('MathJax 렌더링 오류:', err));
    }

    if (!isRestore) {
        chatHistoryForStorage.push({ sender, text, isUser, principle });
        saveSimulationState();
    }
}

// ==== 💡 타이핑 인디케이터 UI 함수 ====
const typingStyle = document.createElement('style');
typingStyle.innerHTML = `
.typing-indicator .dots {
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    color: #555;
    letter-spacing: 2px;
}
.typing-indicator .dots span {
    animation: blink 1.4s infinite both;
}
.typing-indicator .dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator .dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
}
`;
document.head.appendChild(typingStyle);

function showTypingIndicator(sender) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message msg-ai typing-indicator';
    msgDiv.id = `typing-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    if (sender === '민준') {
        msgDiv.style.backgroundColor = '#fff3e0';
        msgDiv.style.border = '1px solid #ffe0b2';
    } else if (sender === '서연') {
        msgDiv.style.backgroundColor = '#e8f5e9';
        msgDiv.style.border = '1px solid #c8e6c9';
    } else if (sender === '연우') {
        msgDiv.style.backgroundColor = '#e3f2fd';
        msgDiv.style.border = '1px solid #bbdefb';
    } else if (sender === '교사') {
        msgDiv.style.backgroundColor = '#ffffff';
        msgDiv.style.border = '1px solid #e0e0e0';
    }

    msgDiv.innerHTML = `
        <div class="speaker-name"><span class="s-name">${sender}</span></div>
        <div class="dots"><span>.</span><span>.</span><span>.</span></div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv.id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// 모델 선택 관리 (localStorage에 저장)
function getSelectedModel() {
    return localStorage.getItem('selectedModel') || 'ollama';
}
function setSelectedModel(value) {
    localStorage.setItem('selectedModel', value);
}

// Gemini 3.1 Flash Lite 호출 (Generative Language REST 예시)
// ====== [수정] Gemini 3.1 Flash Lite 호출 엔진 표준 스펙 적용 ======
async function callGemini(fullPrompt, isJsonMode = false) {
    const apiKeyInput = document.getElementById('geminiKey');
    const apiKey = (apiKeyInput && apiKeyInput.value) ? apiKeyInput.value : localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        console.error('Gemini API key not provided');
        return "오류: Gemini API 키가 설정되어 있지 않습니다.";
    }

    // 2026년 현재 표준 v1beta generateContent 엔드포인트 주소
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    // 표준 Gemini Content 요청 Body 구조
    const body = {
        contents: [
            {
                parts: [
                    { text: fullPrompt }
                ]
            }
        ],
        generationConfig: {
            temperature: isJsonMode ? 0.1 : 0.8,
            maxOutputTokens: 1024,
        }
    };

    // 만약 JSON 출력 모드라면 Gemini에게 응답 타입을 JSON으로 강제 지정
    if (isJsonMode) {
        body.generationConfig.responseMimeType = "application/json";
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!res.ok) {
            throw new Error(`HTTP 에러! 상태코드: ${res.status}`);
        }

        const data = await res.json();
        
        // Gemini 표준 Response 구조에서 텍스트 추출
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Gemini 응답 구조 불일치:", data);
            return "오류: Gemini의 응답 형식이 올바르지 않습니다.";
        }
    } catch (e) {
        console.error('Gemini 호출 오류:', e);
        return "아... Gemini 호출 중 오류가 발생했어요.";
    }
}

// ====== [수정] 역량 분석(trackCompetencies)에서도 모델 분기 추가 ======
async function trackCompetencies(targetSpeaker) {
    if (targetSpeaker === "교사") return; // 교사의 역량은 평가하지 않고 건너뜁니다.
    
    const selectedModel = getSelectedModel();
    console.log(`🧠 [${selectedModel.toUpperCase()}] '${targetSpeaker}' 실시간 역량 분석 요청...`);

    const context = getChatContext();
    
    let evalPrompt = `당신은 수학교육 전문가입니다. 아래 중등 수학 대화를 분석하여 방금 대화를 진행한 '${targetSpeaker}' 한 명에 대해서만 평가하세요.\n`;
    evalPrompt += `1. '${targetSpeaker}'의 역량을 1.0~5.0점(소수점 첫째 자리까지)으로 평가하세요. 지표: [과제수행, 의사소통, 수학적추론, 협력적해결, 자기효능감]\n`;
    evalPrompt += `2. '${targetSpeaker}'의 '개념 이해도 변화량(delta)'을 평가하세요. 이전 턴들과 비교하여 최신 발화에서 새로운 깨달음이나 명확한 이해가 확인되면 양수(+)를, 반대로 오개념이 늘어나거나 혼란스러워하면 음수(-)를 부여하세요 (변화폭은 상황의 중요도에 맞게 -20 ~ +20 범위 내에서 자율적으로 결정). 명확한 이해도 변화가 없다면 반드시 0점을 부여해야 합니다.\n\n`;
    evalPrompt += `출력 포맷 예시:\n{"scores":{"${targetSpeaker}":[4.2, 2.5, 3.0, 4.0, 4.5]}, "understanding_delta":{"${targetSpeaker}":10}}\n`;
    evalPrompt += `\n반드시 지정된 JSON 형식으로만 응답하고 다른 설명이나 마크다운 문자는 절대 쓰지 마세요.\n[중요: JSON 객체의 Key 이름("${targetSpeaker}")을 절대 누락하거나 오타내지 마세요.]\n\n대화내역:\n${context}`;

    try {
        let jsonText = "";

        if (selectedModel === 'gemini') {
            // 역량 평가에서도 Gemini를 사용하도록 구현 (true 인자를 넘겨 JSON 모드 활성화)
            jsonText = await callGemini(evalPrompt, true);
        } else {
            // 기존 Ollama 로직 유지
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "gemma4:e4b",
                    prompt: evalPrompt,
                    stream: false,
                    format: "json",
                    options: { temperature: 0.1 }
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            jsonText = data.response;
        }
        
        // 불필요한 텍스트 샌드위치 방어 코드
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }
        
        try {
            const result = JSON.parse(jsonText);
            console.log(`🧠 [${selectedModel.toUpperCase()}] 분석 결과 수신 성공:`, result);
            
            if (result.scores) {
                currentScores = { ...currentScores, ...result.scores };
            } else if (result[targetSpeaker]) {
                currentScores[targetSpeaker] = result[targetSpeaker];
            }
            
            const deltaObj = result.understanding_delta || result.understanding;
            if (deltaObj) {
                for (const [name, value] of Object.entries(deltaObj)) {
                    if (understandingLevels[name] !== undefined) {
                        let delta = Number(value);
                        if (Math.abs(delta) > 30) {
                            understandingLevels[name] = Math.max(0, Math.min(100, delta));
                        } else {
                            const newLevel = understandingLevels[name] + delta;
                            understandingLevels[name] = Math.max(0, Math.min(100, newLevel));
                        }
                    }
                }
            }
        } catch (parseError) {
            console.warn("⚠️ JSON 파싱 실패. 원본 응답:", jsonText);
            return;
        }
        
        turnCount++;
        chartLabels.push(`${turnCount}턴`);
        ACTIVE_STUDENTS.forEach(name => {
            understandingHistory[name].push(understandingLevels[name]);
            scoreHistory[name].push([...currentScores[name]]);
        });
        updateChartData();

        renderTable();
        saveSimulationState(); // 💡 캐시에 역량 점수 업데이트
        console.log("📊 [System] 역량 보드 업데이트 완료");
    } catch (e) {
        console.error("🚨 역량 분석 오류:", e);
    }
}
// 로컬 Ollama (Gemma 4 E4B) 호출 엔진
async function callOllama(roleName) {
    console.log(`🤖 [Ollama] '${roleName}' API 호출 준비`);
    let sysPrompt = getSystemPrompt(roleName);

    const context = getChatContext();
    
    // 💡 텍스트 컨텍스트를 추출한 직후에 화면에 타이핑 인디케이터 표시
    const typingId = showTypingIndicator(roleName);
    
    let taskPrompt = `위 Context(대화 내역)의 마지막 발화를 꼼꼼히 읽고, 그에 대한 자연스러운 리액션으로 시작하되, 단순한 동의나 반복을 피하고 **반드시 구체적인 수학적 행동(계산 시도, 숫자 언급, 반례 제시 등)을 포함하여** '${roleName}'의 다음 톡을 1~2문장으로 작성해줘. 혼자 과제 진도를 빼거나 뜬금없는 소리를 하지 말고, 직전 대화의 맥락을 이어가며 문제를 해결하세요.`;

    // 💡 교사 에이전트가 발화 의도나 행동 지침을 함께 출력하는 환각 현상 방지
    if (roleName === "교사") {
        taskPrompt = `위 Context(대화 내역)에서 직전 3턴의 대화를 면밀히 분석하세요.
그리고 당신에게 주어진 '대화적 교수법'의 5가지 원칙(집단적, 상호적, 지지적, 누적적, 목적 지향적) 중 현재 상황에서 가장 필요한 1가지 원칙을 결정하세요.
결정한 1가지 원칙의 전략을 적용하여, 학생들의 사고를 진전시키거나 대화를 조율하는 교사의 다음 톡을 1~2문장으로 작성해줘. 혼자 과제 진도를 빼거나 정답을 바로 알려주지 말고, 직전 대화의 맥락을 이어가며 문제를 해결하도록 유도하세요.
[🚨출력 규칙] 반드시 아래 형식에 맞춰서 출력하세요. 다른 설명은 추가하지 마세요.
[선택한 원칙] (집단적, 상호적, 지지적, 누적적, 목적 지향적 중 택1)
[발화] (학생들에게 할 실제 대화 내용)`;
    }

    const fullPrompt = `System: ${sysPrompt}\n\nContext:\n${context}\n\nTask: ${taskPrompt}`;

    try {
        // 모델 선택에 따라 경로 분기
        const selected = getSelectedModel();
        let rawReply = "";

        if (selected === 'gemini') {
            // Gemini 호출 (API key 기반)
            rawReply = await callGemini(fullPrompt);
        } else {
            // 기본: 로컬 Ollama/Gemma
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "gemma4:e4b",
                    prompt: fullPrompt,
                    stream: false,
                    options: { temperature: 1.1 }
                })
            });
            const data = await response.json();
            const replyO = (data && (data.response || data.text || data.output)) ? (data.response || data.text || data.output) : JSON.stringify(data);
            rawReply = typeof replyO === 'string' ? replyO.trim() : String(replyO);
        }

        removeTypingIndicator(typingId); // 💡 응답 완료 시 로딩 말풍선 제거
        
        let finalReply = rawReply;
        let principlePart = null;
        
        // 👨‍🏫 교사인 경우 출력 포맷에서 [선택한 원칙]과 [발화]를 파싱하여 분리
        if (roleName === "교사") {
            const splitContent = finalReply.split(/\[발화\]/);
            if (splitContent.length > 1) {
                // 마크다운(*) 등의 기호가 섞여 들어올 경우를 대비해 정제
                principlePart = splitContent[0].replace(/\[선택한 원칙\]/g, '').replace(/\*/g, '').trim();
                console.log(`\n======================================================`);
                console.log(`👨‍🏫 [교사 개입 전략] AI가 선택한 원칙: ${principlePart}`);
                console.log(`======================================================\n`);
                
                finalReply = splitContent[1].trim(); // 말풍선에는 실제 발화만 전달
            }
        }
        
        console.log(`🤖 [${selected.toUpperCase()}] '${roleName}' 최종 응답:`, finalReply);
        return { reply: finalReply, principle: principlePart };
        
    } catch (e) {
        console.error(`🚨 [Ollama] '${roleName}' API 호출 에러:`, e);
        removeTypingIndicator(typingId); // 💡 에러 시에도 로딩 말풍선 제거
        return { reply: "아... 나 뇌정지 왔어 방금 ㅠㅠ", principle: null };
    }
}


let globalChainId = 0; // 현재 실행 중인 체인을 식별하기 위한 전역 변수

// 👨‍🏫 교사 개입 필요성 판단 함수
async function checkTeacherIntervention() {
    console.log("🤔 [System] 교사 개입 필요 여부 판단 중...");

    // 1. 최근 5턴의 대화만 추출
    const messages = document.querySelectorAll('.message:not(.typing-indicator)');
    if (messages.length < 5) {
        console.log("💬 [System] 대화가 너무 짧아 개입 판단을 건너뜁니다.");
        return false; // 대화가 너무 짧으면 개입하지 않음
    }
    const lastFiveMessages = Array.from(messages).slice(-5);
    let recentContext = "";
    lastFiveMessages.forEach(msg => {
        const speaker = msg.querySelector('.speaker-name')?.innerText || "사용자";
        const content = msg.innerText.replace(speaker, "").trim();
        recentContext += `${speaker}: ${content}\n`;
    });

    // 2. 교사의 커스텀 페르소나(지도 성향) 프롬프트 가져오기
    const teacherPersonaPrompt = localStorage.getItem('persona_prompt_교사') || TEACHER_PROMPT_BASE;

    // 3. 개입 여부 판단을 위한 전용 프롬프트 생성
    const decisionPrompt = `
당신은 '교사'이며, 학생들의 토론을 관찰하고 대화가 비생산적으로 흐를 때만 개입하는 역할을 맡고 있습니다.
아래는 최근 대화 내용입니다.

[최근 대화 5턴]
${recentContext}

[당신의 지도 성향]
${teacherPersonaPrompt}

[판단 임무]
위 대화 내용과 당신의 지도 성향을 종합적으로 고려하여, 지금 즉시 개입해야 할 필요가 있는지 판단하세요.
다음 중 하나라도 해당하면 '개입'이 필요합니다:
- 학생들이 같은 말을 반복하며 진전이 없거나 (Stagnant)
- 과제와 전혀 상관없는 딴 이야기를 하고 있다면 (Off-topic)
- 💡 학생들이 현재 과제의 핵심 정답을 도출해내어 대략적으로 합의했을 때 (불필요한 검산이나 재확인 없이 즉시 개입하여 칭찬하고 다음 과제로 넘어가기 위함)
(예: '지시적' 성향이 강하면 더 빠르게 개입, '대화적' 성향이 강하면 더 오래 관망)

판단 결과만 아래 JSON 형식으로 응답하세요. 다른 설명은 절대 추가하지 마세요.
{"intervention_needed": "YES" or "NO"}
`;

    // 4. LLM을 호출하여 "YES" 또는 "NO" 응답 받기
    try {
        const selectedModel = getSelectedModel();
        let jsonText = "";

        if (selectedModel === 'gemini') {
            jsonText = await callGemini(decisionPrompt, true);
        } else {
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "gemma4:e4b", prompt: decisionPrompt, stream: false, format: "json", options: { temperature: 0.0 } })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            jsonText = data.response;
        }
        
        // JSON 파싱 전처리 (Gemini 마크다운 방어)
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }
        
        const result = JSON.parse(jsonText);
        const needsIntervention = result.intervention_needed === "YES";
        console.log(`[System] 교사 개입 판단 결과: ${needsIntervention ? '✅ 필요(YES)' : '❌ 불필요(NO)'}`);
        return needsIntervention;
    } catch (e) {
        console.error("🚨 [System] 교사 개입 판단 중 오류 발생:", e);
        return false; // 오류 발생 시에는 개입하지 않음
    }
}

// 대화 확률 이벤트 체인 로직
// 대화 확률 이벤트 체인 로직 (순수 자동 시뮬레이션 모드)
async function runAiTurnChain(lastSpeaker, lastMessageText = "") {
    console.log(`🔄 [Chain] 자동 대화 턴 체인 시작 (직전 발화자: ${lastSpeaker})`);
    
    let currentSpeaker = lastSpeaker;
    let currentMessageText = lastMessageText || "";
    let chainCount = 0;
    let keepGoing = true;

    while (keepGoing && chainCount < 100) {
        keepGoing = false;

        // 💡 텍스트를 분석하여 불린 이름 확인 및 확률 동적 조정
        const callMinjun = ACTIVE_STUDENTS.includes("민준") && currentMessageText.includes("민준");
        const callSeoyeon = ACTIVE_STUDENTS.includes("서연") && currentMessageText.includes("서연");
        const callYeonwoo = ACTIVE_STUDENTS.includes("연우") && currentMessageText.includes("연우");
        
        let probMinjun = ACTIVE_STUDENTS.includes("민준") ? 0.34 : 0;
        let probSeoyeon = ACTIVE_STUDENTS.includes("서연") ? 0.60 : 0;
        let probYeonwoo = ACTIVE_STUDENTS.includes("연우") ? 0.80 : 0; // 기본 확률
        if (callMinjun || callSeoyeon || callYeonwoo) {
            probMinjun = callMinjun ? 0.90 : (ACTIVE_STUDENTS.includes("민준") ? 0.10 : 0);
            probSeoyeon = callSeoyeon ? 0.90 : (ACTIVE_STUDENTS.includes("서연") ? 0.10 : 0);
            probYeonwoo = callYeonwoo ? 0.90 : (ACTIVE_STUDENTS.includes("연우") ? 0.10 : 0);
        }

        // 💡 [추가] 4턴 이상 소외된 학생 강제 발화 로직 (교사 제외)
        const students = ACTIVE_STUDENTS;
        const studentMessages = Array.from(document.querySelectorAll('.message:not(.typing-indicator)'))
            .map(msg => msg.querySelector('.speaker-name')?.innerText)
            .filter(name => students.includes(name)); // 교사 등 다른 화자 제외
        
        if (studentMessages.length >= 4) {
            const last4 = studentMessages.slice(-4);
            const missingStudents = students.filter(s => !last4.includes(s));
            if (missingStudents.length > 0) {
                const forced = missingStudents[0];
                console.log(`🎯 [Chain] 최근 학생 대화 4턴 간 소외된 모둠원 감지: ${forced} 강제 발화!`);
                probMinjun = forced === "민준" ? 1.0 : 0.0;
                probSeoyeon = forced === "서연" ? 1.0 : 0.0;
                probYeonwoo = forced === "연우" ? 1.0 : 0.0;
            }
        }

        // 1. 민준 (발화 당첨 시)
        if (currentSpeaker !== "민준" && Math.random() <= probMinjun) {
            await sleep(getSleepTime()); // 💡 Gemini API 429 방지 및 인간미 있는 대화 딜레이

            console.log(`🎲 [Chain] '민준' 발화 당첨!`);
            
            const res = await callOllama("민준");
            appendMessage("민준", res.reply, false, false, res.principle);
            
            currentSpeaker = "민준"; 
            keepGoing = true; 
            chainCount++;
            currentMessageText = res.reply; 
            
            await trackCompetencies("민준"); // 실시간 역량 및 이해도 평가

            // 👨‍🏫 교사 개입 판단
            if (await checkTeacherIntervention()) {
                console.log(`👨‍🏫 [System] 교사 개입 결정! (대화 정체 감지)`);
                await sleep(getSleepTime());
                const tRes = await callOllama("교사");
                appendMessage("교사", tRes.reply, false, false, tRes.principle);
                
                if (tRes.reply.includes("여기까지 할게요") && tRes.reply.includes("수고했어요")) {
                    console.log("🛑 [System] 모든 과제 완료. 시뮬레이션 종료.");
                    return; // 완전 종료
                }

                // 교사 발언 후 새로운 학생 턴 체인으로 완전히 토스하고 현재 루프 종료
                await runAiTurnChain("교사", tRes.reply);
                return; 
            }
            continue;
        }

        // 2. 서연 (발화 당첨 시)
        if (currentSpeaker !== "서연" && Math.random() <= probSeoyeon) {
            await sleep(getSleepTime());

            console.log(`🎲 [Chain] '서연' 발화 당첨!`);
            
            const res = await callOllama("서연");
            appendMessage("서연", res.reply, false, false, res.principle);
            
            currentSpeaker = "서연"; 
            keepGoing = true; 
            chainCount++;
            currentMessageText = res.reply; 
            
            await trackCompetencies("서연");

            if (await checkTeacherIntervention()) {
                console.log(`👨‍🏫 [System] 교사 개입 결정! (대화 정체 감지)`);
                await sleep(getSleepTime());
                const tRes = await callOllama("교사");
                appendMessage("교사", tRes.reply, false, false, tRes.principle);
                
                if (tRes.reply.includes("여기까지 할게요") && tRes.reply.includes("수고했어요")) {
                    console.log("🛑 [System] 모든 과제 완료. 시뮬레이션 종료.");
                    return; // 완전 종료
                }

                await runAiTurnChain("교사", tRes.reply);
                return; 
            }
            continue;
        }

        // 3. 연우 (발화 당첨 시)
        if (currentSpeaker !== "연우" && Math.random() <= probYeonwoo) {
            await sleep(getSleepTime());

            console.log(`🎲 [Chain] '연우' 발화 당첨!`);
            
            const res = await callOllama("연우");
            appendMessage("연우", res.reply, false, false, res.principle);
            
            currentSpeaker = "연우"; 
            keepGoing = true; 
            chainCount++;
            currentMessageText = res.reply; 
            
            await trackCompetencies("연우");

            if (await checkTeacherIntervention()) {
                console.log(`👨‍🏫 [System] 교사 개입 결정! (대화 정체 감지)`);
                await sleep(getSleepTime());
                const tRes = await callOllama("교사");
                appendMessage("교사", tRes.reply, false, false, tRes.principle);
                
                if (tRes.reply.includes("여기까지 할게요") && tRes.reply.includes("수고했어요")) {
                    console.log("🛑 [System] 모든 과제 완료. 시뮬레이션 종료.");
                    return; // 완전 종료
                }

                await runAiTurnChain("교사", tRes.reply);
                return; 
            }
            continue;
        }
    }
    
    // 확률적인 루프가 완전히 끝났는데도 아무도 말을 안 하고 멈췄을 때 (데드락 방지)
    console.log(`🛑 [Chain] 확률적 대화 턴 종료 (총 ${chainCount}회 발화) -> 자동 개입 모드 가동`);
    
    if (currentSpeaker !== "교사") {
        await sleep(getSleepTime());
        console.log(`👨‍🏫 [System] 대화 흐름 정체 감지, '교사' 강제 개입!`);
        const tRes = await callOllama("교사");
        appendMessage("교사", tRes.reply, false, false, tRes.principle);
        
        if (tRes.reply.includes("여기까지 할게요") && tRes.reply.includes("수고했어요")) {
            console.log("🛑 [System] 모든 과제 완료. 시뮬레이션 종료.");
            return; // 완전 종료
        }
        
        // 교사가 물꼬를 텄으니 다시 학생들 반응 유도
        await runAiTurnChain("교사", tRes.reply);
    } else {
        await sleep(getSleepTime());
        const backupStudent = ACTIVE_STUDENTS.includes("서연") ? "서연" : ACTIVE_STUDENTS[0];
        console.log(`👩 [System] 교사 발화 후 정체, '${backupStudent}'이(가) 총대 메고 답변 강제!`);
        const res = await callOllama(backupStudent);
        appendMessage(backupStudent, res.reply, false, false, res.principle);
        await trackCompetencies(backupStudent); 
        
        // 서연이가 받아쳤으니 다시 체인 가동
        await runAiTurnChain(backupStudent, res.reply);
    }
}

// 👨‍🏫 초기 교사 발화 트리거 함수
async function startInitialTeacherTurn() {
    console.log("👨‍🏫 [System] 초기 교사 첫 발화 하드코딩 진행...");
    const chatBox = document.getElementById('chatBox');
    if (chatBox) chatBox.innerHTML = ''; // HTML에 남아있을지 모르는 기존 시스템 안내 메시지 등 초기화
    
    // LLM이 시스템처럼 기계적으로 말하는 것을 방지하기 위해 자연스러운 첫 발화를 고정합니다.
    const initialText = currentTask.teacherInitialText;
    appendMessage("교사", initialText, false);
    await runAiTurnChain("교사", initialText); 
}

// 🔥 DB 저장 모달 열기/닫기
function openSaveModal() {
    if (!db) {
        alert("Firebase 설정이 완료되지 않았습니다. script.js 코드를 확인해주세요.");
        return;
    }
    const modal = document.getElementById('saveModal');
    if (modal) modal.style.display = 'flex';
}

function closeSaveModal() {
    const modal = document.getElementById('saveModal');
    if (modal) modal.style.display = 'none';
    if (document.getElementById('saveTitleInput')) document.getElementById('saveTitleInput').value = '';
    if (document.getElementById('saveAuthorInput')) document.getElementById('saveAuthorInput').value = '';
}

// 🔥 실제 DB 저장 실행 함수
async function executeSaveToDB() {
    const title = document.getElementById('saveTitleInput').value.trim();
    const author = document.getElementById('saveAuthorInput').value.trim();

    if (!title || !author) {
        alert("제목과 이름을 모두 입력해주세요.");
        return;
    }

    const confirmBtn = document.getElementById('confirmSaveBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerText = "저장 중...";

    try {
        // 전체 대화 기록 수집
        const messages = [];
        document.querySelectorAll('.message:not(.typing-indicator)').forEach((msg, index) => {
            const nameSpan = msg.querySelector('.s-name');
            const speakerEl = msg.querySelector('.speaker-name');
            const speaker = nameSpan ? nameSpan.innerText : (speakerEl ? speakerEl.innerText : "시스템/사용자");
            
            const badgeEl = msg.querySelector('.badge');
            const principle = badgeEl ? badgeEl.innerText.replace(/[\[\]]/g, '') : null;

            const clone = msg.cloneNode(true);
            const sn = clone.querySelector('.speaker-name');
            if(sn) sn.remove();
            const text = clone.innerText.trim();
            messages.push({ order: index + 1, speaker, text, principle });
        });

        // 현재 시간을 보기 좋게 포맷팅 (예: 2024. 4. 25. 오후 3:15:20)
        const now = new Date();
        const formattedTime = now.toLocaleString('ko-KR');

        // 🔥 [데이터 효율화] Firebase의 중첩 배열 에러를 피하고 DB 용량을 최소화하기 위해 
        // 히스토리 배열을 통째로 JSON 문자열(String)로 직렬화(Serialization)하여 묶어 저장합니다.
        const stringifiedScoreHistory = JSON.stringify(scoreHistory);
        const stringifiedUnderstandingHistory = JSON.stringify(understandingHistory);
        
        // 🔥 학생 및 교사의 커스텀 페르소나 설정 수집
        const customPersonas = {};
        const roles = [...ACTIVE_STUDENTS, "교사"];
        roles.forEach(role => {
            const prompt = localStorage.getItem(`persona_prompt_${role}`);
            const scoresStr = localStorage.getItem(`persona_scores_${role}`);
            const initialUnderstanding = localStorage.getItem(`persona_understanding_${role}`);
            
            if (prompt || scoresStr || initialUnderstanding) {
                customPersonas[role] = {
                    prompt: prompt || null,
                    scores: scoresStr ? JSON.parse(scoresStr) : null,
                    initialUnderstanding: initialUnderstanding ? parseInt(initialUnderstanding) : null
                };
            }
        });

        // 하나의 문서(Document)로 묶어서 전송
        await addDoc(collection(db, "simulation_logs"), {
            title: title,
            author: author,
            savedAt: formattedTime,
            timestamp: serverTimestamp(),
            sessionId: "session_" + Date.now(),
            totalTurns: messages.length,
            chatLogs: messages,
            finalUnderstanding: understandingLevels,
            finalScores: currentScores,
            understandingHistory: stringifiedUnderstandingHistory,
            scoreHistory: stringifiedScoreHistory,
            customPersonas: customPersonas
        });

        alert("✅ 시뮬레이션 결과가 DB에 성공적으로 저장되었습니다!");
        closeSaveModal();
    } catch (e) {
        console.error("🚨 DB 저장 실패:", e);
        alert("저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerText = "저장하기";
    }
}

// ==== 🚨 새로 추가된 부분: 이벤트 리스너 바인딩 ====
// DOM이 모두 로드된 후 이벤트를 연결해야 안전합니다.
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ [System] 앱 초기화 및 이벤트 바인딩 완료");
    
    // 💡 사용자 발화 인터페이스(입력창 및 전송 버튼) 숨김 처리 (자동 시뮬레이션 모드)
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    if (userInput) userInput.style.display = 'none';
    if (sendBtn) sendBtn.style.display = 'none';
 
    // 모델 선택 요소 초기화
    const modelSelect = document.getElementById('modelSelect');
    const geminiKeyInput = document.getElementById('geminiKey');
    if (modelSelect) {
        modelSelect.value = getSelectedModel();
        modelSelect.addEventListener('change', (e) => {
            setSelectedModel(e.target.value);
            // Gemini 선택 시 geminiKey를 로컬스토리지에 저장(사용자가 입력 후 새로고침해도 유지)
            if (e.target.value === 'gemini' && geminiKeyInput && geminiKeyInput.value) {
                localStorage.setItem('gemini_api_key', geminiKeyInput.value);
            }
        });
    }
    if (geminiKeyInput) {
        // 입력값 변경 시 로컬스토리지에 즉시 저장
        geminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
        geminiKeyInput.addEventListener('input', (e) => {
            localStorage.setItem('gemini_api_key', e.target.value);
        });
    }

    // 터보 모드 초기화 및 이벤트 연결
    const turboCheckbox = document.getElementById('turboMode');
    if (turboCheckbox) {
        turboCheckbox.checked = localStorage.getItem('turbo_mode') === 'true';
        turboCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('turbo_mode', e.target.checked);
        });
    }

    const chartMetricSelect = document.getElementById('chartMetricSelect');
    if (chartMetricSelect) {
        chartMetricSelect.addEventListener('change', updateChartData);
    }
    
    const saveDbBtn = document.getElementById('saveDbBtn');
    if (saveDbBtn) saveDbBtn.addEventListener('click', openSaveModal);
    
    const cancelSaveBtn = document.getElementById('cancelSaveBtn');
    if (cancelSaveBtn) cancelSaveBtn.addEventListener('click', closeSaveModal);
    
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    if (confirmSaveBtn) confirmSaveBtn.addEventListener('click', executeSaveToDB);

    // 💡 캐시 초기화(리셋) 버튼 로직
    const resetSimBtn = document.getElementById('resetSimBtn');
    if (resetSimBtn) {
        resetSimBtn.addEventListener('click', () => {
            if (confirm("진행 중인 모든 대화를 지우고 처음부터 다시 시작하시겠습니까?")) {
                localStorage.removeItem('tobagi_sim_state');
                location.reload();
            }
        });
    }

    initChart(); // 💡 앱 시작 시 차트 그리기

    // 🔥 Firebase에서 문제 불러오기 및 앱 초기 실행
    loadProblemsAndInit();
});

async function loadProblemsAndInit() {
    if (db) {
        try {
            console.log("🔥 [Firebase] 문제 은행 목록 불러오는 중...");
            const querySnapshot = await getDocs(collection(db, "problems"));
            querySnapshot.forEach(doc => {
                PROBLEM_DB[doc.id] = doc.data();
            });
        } catch (e) {
            console.error("🚨 [Firebase] 문제 목록 불러오기 실패:", e);
        }
    }

    // 불러온 DB 데이터로 현재 과제 정보 다시 세팅
    currentTask = PROBLEM_DB[currentTaskId] || PROBLEM_DB['task1'];
    TASK_INFO = `[수행 과제: ${currentTask.title}]\n🚨[수업 배경]: ${currentTask.background}\n[제시문] ${currentTask.content}\n\n${currentTask.goals.map((g, i) => `과제${i+1}) ${g}`).join('\n')}`;

    // 문제 선택 드롭다운 초기화 및 이벤트 연결
    const taskSelect = document.getElementById('taskSelect');
    if (taskSelect) {
        taskSelect.innerHTML = '';
        for (const [id, task] of Object.entries(PROBLEM_DB)) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = task.title;
            taskSelect.appendChild(opt);
        }
        taskSelect.value = currentTaskId;
        taskSelect.addEventListener('change', (e) => {
            if (confirm("과제를 변경하면 진행 중인 대화가 모두 초기화되고 새로 시작됩니다. 변경하시겠습니까?")) {
                localStorage.setItem('selected_task', e.target.value);
                localStorage.removeItem('tobagi_sim_state'); // 💡 문제 변경 시 캐시 초기화
                location.reload();
            } else {
                e.target.value = currentTaskId;
            }
        });
    }
    const taskCardContent = document.getElementById('taskCardContent');
    if (taskCardContent) taskCardContent.innerHTML = currentTask.uiHtml;

    // 💡 캐시 복원 로직
    const savedStateStr = localStorage.getItem('tobagi_sim_state');
    if (savedStateStr) {
        try {
            const savedState = JSON.parse(savedStateStr);
            currentScores = savedState.currentScores || currentScores;
            understandingLevels = savedState.understandingLevels || understandingLevels;
            understandingHistory = savedState.understandingHistory || understandingHistory;
            scoreHistory = savedState.scoreHistory || scoreHistory;
            turnCount = savedState.turnCount || turnCount;
            chartLabels = savedState.chartLabels || chartLabels;
            chatHistoryForStorage = savedState.chatHistoryForStorage || [];

            const chatBox = document.getElementById('chatBox');
            if (chatBox) chatBox.innerHTML = ''; 
            
            chatHistoryForStorage.forEach(msg => {
                appendMessage(msg.sender, msg.text, msg.isUser, true, msg.principle);
            });

            renderTable();
            updateChartData();
            console.log("💾 [System] 이전 대화 캐시 복원 완료");
            
            if (chatHistoryForStorage.length > 0) {
                const lastMsg = chatHistoryForStorage[chatHistoryForStorage.length - 1];
                console.log(`🔄 [System] 캐시 복원 후 '${lastMsg.sender}' 턴부터 대화 체인 재가동...`);
                setTimeout(() => runAiTurnChain(lastMsg.sender, lastMsg.text), 4000);
            }
            return; // 기존 저장된 상태가 있다면 초기 발화 스킵
        } catch (e) {
            console.error("캐시 복원 실패:", e);
            localStorage.removeItem('tobagi_sim_state');
        }
    }

    // 💡 문제 데이터가 준비된 후 교사의 첫 인사 및 과제 제시로 대화 시작
    startInitialTeacherTurn();
}