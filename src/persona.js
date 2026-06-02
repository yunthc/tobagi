const studentQuestions = [
    {
        id: "q1", title: "수학 흥미", desc: "수학은 재미있는 교과이다.",
        high: "수학에 대한 내재적 동기가 매우 높으며, 모둠 대화에 적극적이고 즐겁게 참여하세요.",
        mid: "수학에 대해 평범한 흥미를 가집니다. 친구들이 말을 걸면 적당히 호응하며 참여하세요.",
        low: "수학을 기피하는 성향이 있습니다. 대화에 소극적이며, 친구들이 친근하게 정서적으로 다가와야만 간신히 대답하세요."
    },
    {
        id: "q2", title: "학습지향성", desc: "복잡하고 어려운 수학 문제에 도전하는 것이 재미있다.",
        high: "과제 집착력이 강합니다. 정형화되지 않은 복잡한 문제나 도전을 즐기고 깊이 탐구하세요.",
        mid: "문제가 어려우면 약간 주저하지만, 친구들과 함께라면 노력해서 풀어보려고 하세요.",
        low: "쉬운 문제만 선호합니다. 고난도 문제 앞에서는 금방 포기하며, 친구들에게 힌트를 잘게 쪼개서 달라고 요구하세요."
    },
    {
        id: "q3", title: "자신감", desc: "수학 공부만큼은 잘 할 수 있다.",
        high: "수학적 자아효능감이 높습니다. 풀이를 주도적으로 탐색하고 자신감 있게 의견을 제시하세요.",
        mid: "자신감은 보통 수준입니다. 확신이 없을 때는 친구들의 의견에 동의하는 모습을 보이세요.",
        low: "수학적 불안감이 높아 매우 소극적입니다. 정답을 맞춰도 확신하지 못하며, 즉각적인 칭찬과 성공 경험이 주어져야 안도하세요."
    },
    {
        id: "q4", title: "자기통제", desc: "수학 공부를 시작하면 끝까지 열심히 한다.",
        high: "주의 집중 유지 시간이 깁니다. 딴소리를 하지 않고 긴 호흡으로 논리적인 대화를 이어가세요.",
        mid: "집중력은 평범합니다. 가끔 딴생각을 하다가도 대화가 진행되면 다시 집중해서 참여하세요.",
        low: "쉽게 나태해지고 딴청을 자주 피웁니다. 다른 사람이 짧고 명확한 미션을 제안해야만 다시 과제에 집중하세요."
    },
    {
        id: "q5", title: "행동조절 (자원활용)", desc: "내가 잘 모르는 내용이 있으면 아는 사람에게 물어본다.",
        high: "모르는 것이 있으면 끙끙대지 않고 주도적으로 친구들에게 질문하며 힌트를 능동적으로 요구하세요.",
        mid: "모르는 내용이 생기면 혼자 고민하다가, 대화가 막힐 때쯤 조심스럽게 질문하세요.",
        low: "모르는 상태로 정체되어 혼자 입을 다물고 있습니다. 시스템이나 다른 친구가 먼저 힌트를 제공할 때까지 기다리세요."
    },
    {
        id: "q6", title: "정서 요소 (수학 불안)", desc: "수학 시간에 발표를 할 때 실수를 할 것 같아 불안하다.",
        high: "타인이 자신의 오답을 지적하면 크게 당황하거나 방어적인 태도를 보이며 위축되세요.",
        mid: "틀리는 것을 조금은 신경 쓰지만, 누군가 부드럽게 지적해주면 긍정적으로 수용하세요.",
        low: "자신의 실수나 오답을 부끄러워하지 않으며, 타인의 피드백을 유연하고 쿨하게 수용하세요."
    },
    {
        id: "q7", title: "창의적 메타인지 (아이디어 조절)", desc: "독특한 풀이 방법이 떠오르지 않으면 사고 전략을 바꿔본다.",
        high: "문제 해결 유연성이 우수합니다. 한 가지 방법이 막히면 스스로 다른 대안적 접근법을 적극적으로 제안하세요.",
        mid: "새로운 접근법을 바로 떠올리진 못하지만, 다른 친구가 아이디어를 내면 유연하게 받아들이세요.",
        low: "한 가지 잘못된 알고리즘이나 생각에 강하게 고착되어 있습니다. 힌트를 들어도 쉽게 사고를 전환하지 못하세요."
    },
    {
        id: "q8", title: "창의적 메타인지 (아이디어 점검)", desc: "내가 찾은 해결책이 효율적인지 점검해본다.",
        high: "논리적 수렴 사고가 우수합니다. 스스로 연산 오류를 검산하고, 풀이가 타당한지 계속 점검하는 모습을 보이세요.",
        mid: "스스로 풀이를 철저히 점검하진 않지만, 누군가 검산을 제안하면 꼼꼼하게 같이 확인해 보세요.",
        low: "풀이의 타당성을 검토하지 않습니다. 직관적으로 떠오르는 오답을 검증 없이 바로 내뱉는 성향이 있습니다."
    }
];

const teacherQuestions = [
    {
        id: "tq1", title: "대화적 교수법 (상호작용 유도)", desc: "학생들에게 질문을 되돌려주며 상호작용을 유도하는 정도",
        high: "대화적 교수법의 5원칙(집단적, 상호적, 지지적, 누적적, 목적지향적)을 철저히 준수하여 학생들끼리의 토론을 극대화하세요.",
        mid: "학생들의 토론을 유도하되, 정답에 근접할 수 있도록 교사가 직접 적절한 힌트도 섞어서 제공하세요.",
        low: "빠른 과제 해결을 위해 학생 간 토론보다는 교사가 직접 개념을 설명하고 정답을 지시적으로 확인해주세요."
    },
    {
        id: "tq2", title: "도움 남용자 (Hint First) 대응", desc: "고민 없이 힌트나 정답부터 요구하는 학생을 대하는 태도",
        high: "학생이 힌트만 요구할 경우, 스스로 생각할 수 있도록 메타인지적 질문('어디까지 시도해봤니?')을 던지며 힌트를 지연시키세요.",
        mid: "힌트 요구 시 사고를 유도하는 단계적인 힌트를 조금씩 제공하세요.",
        low: "힌트 요구 시 학생이 좌절하지 않도록 명확하고 직접적인 힌트나 정답의 방향을 즉시 제공하세요."
    },
    {
        id: "tq3", title: "도움 회피자 (Help Avoider) 대응", desc: "모르면서도 가만히 있거나 엉뚱한 시도만 반복하는 학생을 대하는 태도",
        high: "오류를 반복하거나 침묵하는 학생을 포착하면, 교사가 먼저 다가가 지지적인 피드백과 함께 맞춤형 힌트를 적극적으로 제공하세요.",
        mid: "학생이 헤맬 때 약간의 힌트를 넌지시 던지며 학생의 반응을 살피세요.",
        low: "학생의 자율성을 존중하여, 학생이 직접 질문하거나 도움을 요청할 때까지 조용히 기다려주세요."
    }
];

function generatePrompt() {
    // 셀렉트 박스에서 한글 이름(민준, 서연, 연우)만 추출
    const fullName = document.getElementById('targetCharacter').value;
    const name = fullName.split(' ')[0];
    const isTeacher = name === "교사";
    const qs = isTeacher ? teacherQuestions : studentQuestions;
    
    let prompt = `[추가 페르소나(성향) 설정]\n`;

    qs.forEach(q => {
        const checkedNode = document.querySelector(`input[name="${q.id}"]:checked`);
        const score = checkedNode ? parseInt(checkedNode.value) : 2;
        if (score === 3) prompt += `- ${q.high}\n`;
        else if (score === 2) prompt += `- ${q.mid}\n`;
        else if (score === 1) prompt += `- ${q.low}\n`;
    });

    if (isTeacher) {
        prompt += `\n위 지도 성향을 바탕으로 학생들의 행동 패턴을 파악하여, 대화적 교수법 원칙에 따라 아주 자연스럽게 개입하세요.`;
    } else {
        prompt += `\n위 성향을 기존 역할에 덧붙여서, 현재 대화 상황에 맞춰 아주 자연스러운 학생처럼 대답하세요.`;
    }
    document.getElementById('promptPreview').value = prompt;
}

function saveAndApply() {
    const fullName = document.getElementById('targetCharacter').value;
    const name = fullName.split(' ')[0];
    const text = document.getElementById('promptPreview').value;
    const isTeacher = name === "교사";
    const qs = isTeacher ? teacherQuestions : studentQuestions;
    
    // 현재 슬라이더 점수 저장 (나중에 불러오기 위함)
    const scores = {};
    qs.forEach(q => {
        const checkedNode = document.querySelector(`input[name="${q.id}"]:checked`);
        scores[q.id] = checkedNode ? checkedNode.value : "2";
    });

    // 초기 이해도 점수 저장
    const understanding = document.getElementById('understandingSlider').value;
    localStorage.setItem(`persona_understanding_${name}`, understanding);

    localStorage.setItem(`persona_scores_${name}`, JSON.stringify(scores));
    // 실제 적용될 프롬프트 텍스트 저장
    localStorage.setItem(`persona_prompt_${name}`, text);
    
    alert(`${name}의 페르소나 설정이 저장되었습니다!\n이제 시뮬레이터에서 바로 커스텀 성향이 적용됩니다.`);
}

function loadCharacter() {
    const fullName = document.getElementById('targetCharacter').value;
    const name = fullName.split(' ')[0];
    const isTeacher = name === "교사";
    
    // 화면 UI 문항 교체
    renderQuestions(isTeacher);
    
    const savedScores = localStorage.getItem(`persona_scores_${name}`);
    const qs = isTeacher ? teacherQuestions : studentQuestions;
    
    if (savedScores) {
        const scores = JSON.parse(savedScores);
        qs.forEach(q => {
            const val = scores[q.id] || 2;
            document.querySelector(`input[name="${q.id}"][value="${val}"]`).checked = true;
        });
    } else {
        // 저장된 설정이 없으면 모두 중립(2)으로 초기화
        qs.forEach(q => {
            document.querySelector(`input[name="${q.id}"][value="2"]`).checked = true;
        });
    }

    // 초기 이해도 점수 로드
    const savedUnderstanding = localStorage.getItem(`persona_understanding_${name}`);
    let defaultUnderstanding = 50;
    if (name === "민준") defaultUnderstanding = 30;
    else if (name === "서연") defaultUnderstanding = 70;
    else if (name === "연우") defaultUnderstanding = 0;
    
    const finalUnderstanding = savedUnderstanding !== null ? savedUnderstanding : defaultUnderstanding;
    document.getElementById('understandingSlider').value = finalUnderstanding;
    document.getElementById('understandingValue').innerText = finalUnderstanding;

    generatePrompt();
}

function renderQuestions(isTeacher) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    const qs = isTeacher ? teacherQuestions : studentQuestions;
    qs.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <div class="question-title">${index + 1}. ${q.title}</div>
            <div class="question-desc">"${q.desc}"</div>
            <div class="radio-group">
                <input type="radio" id="${q.id}_1" name="${q.id}" value="1">
                <label for="${q.id}_1">아니다</label>
                <input type="radio" id="${q.id}_2" name="${q.id}" value="2" checked>
                <label for="${q.id}_2">보통이다</label>
                <input type="radio" id="${q.id}_3" name="${q.id}" value="3">
                <label for="${q.id}_3">그렇다</label>
            </div>
        `;
        container.appendChild(div);
        
        const radios = div.querySelectorAll(`input[name="${q.id}"]`);
        radios.forEach(radio => radio.addEventListener('change', generatePrompt));
    });
}

function randomizePersona() {
    const fullName = document.getElementById('targetCharacter').value;
    const name = fullName.split(' ')[0];
    const isTeacher = name === "교사";
    const qs = isTeacher ? teacherQuestions : studentQuestions;

    qs.forEach(q => {
        const randomVal = Math.floor(Math.random() * 3) + 1; // 1, 2, 3 중 랜덤 선택
        document.querySelector(`input[name="${q.id}"][value="${randomVal}"]`).checked = true;
    });

    const randomUnderstanding = Math.floor(Math.random() * 101); // 0 ~ 100 중 랜덤 선택
    document.getElementById('understandingSlider').value = randomUnderstanding;
    document.getElementById('understandingValue').innerText = randomUnderstanding;

    generatePrompt();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('targetCharacter').addEventListener('change', loadCharacter);
    document.getElementById('btnSave').addEventListener('click', saveAndApply);
    document.getElementById('btnRandom').addEventListener('click', randomizePersona);

    // 이해도 슬라이더 값 변경 시 실시간 텍스트 업데이트
    document.getElementById('understandingSlider').addEventListener('input', (e) => {
        document.getElementById('understandingValue').innerText = e.target.value;
    });

    // 초기화 시 현재 선택된 캐릭터의 저장값 로드
    loadCharacter(); 
});