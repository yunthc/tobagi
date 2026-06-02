import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { initializeFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-L5P8XZyFAmsrAHPqIIc__qqM_TunegY",
    authDomain: "snu-me-yyj.firebaseapp.com",
    projectId: "snu-me-yyj",
    storageBucket: "snu-me-yyj.firebasestorage.app",
    messagingSenderId: "292468821013",
    appId: "1:292468821013:web:a6c809863462487612521c"
};

let db;
try {
    const app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
    console.error("Firebase 초기화 실패:", e);
}

// 변화량 애니메이션 스타일 주입
const animStyle = document.createElement('style');
animStyle.innerHTML = `
@keyframes popUp {
    0% { transform: translateY(4px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
@keyframes popDown {
    0% { transform: translateY(-4px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
`;
document.head.appendChild(animStyle);

// 상태 관리를 위한 전역 변수
let currentStep = 0;
let totalSteps = 0;
let chatLogsData = [];
let fullUHistory = null;
let fullSHistory = null;
let chartInstances = [];
let activeStudents = [];

async function loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (!docId || !db) {
        document.getElementById('detailTitle').innerText = "데이터를 불러올 수 없습니다.";
        return;
    }

    try {
        const docRef = doc(db, "simulation_logs", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            renderDetail(docSnap.data());
        } else {
            document.getElementById('detailTitle').innerText = "존재하지 않는 기록입니다.";
        }
    } catch (e) {
        console.error("상세 기록 불러오기 실패:", e);
        document.getElementById('detailTitle').innerText = "오류가 발생했습니다.";
    }
}

function renderDetail(data) {
    document.getElementById('detailTitle').innerText = `📄 ${data.title} (${data.author} - ${data.savedAt})`;
    document.getElementById('chatHeaderTitle').innerText = `🧮 대화 기록`;

    // 1. 페르소나 설정
    const personaInfo = document.getElementById('recordPersonaInfo');
    if (data.customPersonas && Object.keys(data.customPersonas).length > 0) {
        for (const [name, info] of Object.entries(data.customPersonas)) {
            let details = [];
            if (info.initialUnderstanding !== null && name !== '교사') {
                details.push(`<span style="color: #E65100; font-weight: bold;">초기 이해도: ${info.initialUnderstanding}%</span>`);
            }
            
            if (info.scores) {
                const s = info.scores;
                const sl = { 1: "낮음(아니다)", 2: "보통이다", 3: "높음(그렇다)" };
                const tl = { 1: "낮음(지시적)", 2: "보통이다", 3: "높음(대화적)" };
                
                if (name === "교사") {
                    details.push(`대화적 교수법: ${tl[s.tq1] || '보통이다'} | 도움 남용자 대응: ${tl[s.tq2] || '보통이다'} | 도움 회피자 대응: ${tl[s.tq3] || '보통이다'}`);
                } else {
                    details.push(`흥미: ${sl[s.q1] || '보통이다'} | 학습지향: ${sl[s.q2] || '보통이다'} | 자신감: ${sl[s.q3] || '보통이다'} | 통제력: ${sl[s.q4] || '보통이다'} <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 자원활용: ${sl[s.q5] || '보통이다'} | 수학불안: ${sl[s.q6] || '보통이다'} | 사고유연: ${sl[s.q7] || '보통이다'} | 검산점검: ${sl[s.q8] || '보통이다'}`);
                }
            } else if (info.prompt) {
                details.push(`커스텀 프롬프트 적용됨`);
            }

            if (details.length > 0) {
                personaInfo.innerHTML += `<div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #FFCC80; line-height: 1.5;"><strong style="display:inline-block; width: 45px;">[${name}]</strong> <span style="color: #555;">${details.join('<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ')}</span></div>`;
            }
        }
        // 마지막 요소 밑줄 제거
        if (personaInfo.lastElementChild) {
            personaInfo.lastElementChild.style.borderBottom = 'none';
            personaInfo.lastElementChild.style.marginBottom = '0';
            personaInfo.lastElementChild.style.paddingBottom = '0';
        }
    } else {
        personaInfo.innerHTML = '<p style="margin: 4px 0; color: #7F8C8D;">별도의 커스텀 설정 없이 기본 페르소나로 진행되었습니다.</p>';
    }

    // 데이터 파싱 및 초기화
    fullUHistory = data.understandingHistory ? (typeof data.understandingHistory === 'string' ? JSON.parse(data.understandingHistory) : data.understandingHistory) : null;
    fullSHistory = data.scoreHistory ? (typeof data.scoreHistory === 'string' ? JSON.parse(data.scoreHistory) : data.scoreHistory) : null;
    chatLogsData = data.chatLogs || [];
    totalSteps = chatLogsData.length;
    currentStep = totalSteps; // 기본적으로 전체 기록을 표시
    
    activeStudents = Object.keys(data.finalScores || {}).filter(k => k !== "교사");

    // 2. 채팅 말풍선 미리 생성해두기 (CSS display로 토글)
    const chatBox = document.getElementById('recordChatBox');
    chatBox.innerHTML = '';
    chatLogsData.forEach((log, index) => {
        const msgDiv = document.createElement('div');
        msgDiv.id = `msg-${index}`;
        const isUser = log.speaker === "사용자";
        msgDiv.className = `message ${isUser ? 'msg-user' : 'msg-ai'}`;
        
        if (log.speaker === '민준') { msgDiv.style.backgroundColor = '#fff3e0'; msgDiv.style.border = '1px solid #ffe0b2'; }
        else if (log.speaker === '서연') { msgDiv.style.backgroundColor = '#e8f5e9'; msgDiv.style.border = '1px solid #c8e6c9'; }
        else if (log.speaker === '연우') { msgDiv.style.backgroundColor = '#e3f2fd'; msgDiv.style.border = '1px solid #bbdefb'; }
        else if (log.speaker === '교사') { msgDiv.style.backgroundColor = '#ffffff'; msgDiv.style.border = '1px solid #e0e0e0'; }

        let speakerHtml = `<div class="speaker-name"><span class="s-name">${log.speaker}</span></div>`;
        if (log.principle) {
            speakerHtml = `<div class="speaker-name"><span class="s-name">${log.speaker}</span> <span class="badge" style="background: #9B59B6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">[${log.principle}]</span></div>`;
        }
        
        msgDiv.innerHTML = isUser ? log.text : `${speakerHtml}${log.text}`;
        chatBox.appendChild(msgDiv);
    });
    
    // MathJax 수식 동적 렌더링
    if (window.MathJax) {
        MathJax.typesetPromise([chatBox]).catch((err) => console.log('MathJax 렌더링 오류:', err));
    }

    // 3. 차트 6종 초기 프레임 설정
    const chartsGrid = document.getElementById('chartsGrid');
    chartsGrid.innerHTML = '';
    const chartConfigs = [
        { id: 'cUnd', title: '개념 이해도 (0~100)', type: 'u', idx: null, max: 100 },
        { id: 'cTsk', title: '과제 수행 (1~5)', type: 's', idx: 0, max: 5 },
        { id: 'cCom', title: '의사소통 (1~5)', type: 's', idx: 1, max: 5 },
        { id: 'cRes', title: '수학적 추론 (1~5)', type: 's', idx: 2, max: 5 },
        { id: 'cCol', title: '협력적 해결 (1~5)', type: 's', idx: 3, max: 5 },
        { id: 'cEff', title: '자기효능감 (1~5)', type: 's', idx: 4, max: 5 }
    ];

    chartConfigs.forEach(cfg => {
        chartsGrid.innerHTML += `<div class="chart-box"><h4>${cfg.title}</h4><canvas id="${cfg.id}"></canvas></div>`;
    });

    chartInstances = [];
    const colors = { "민준": "#FF9800", "서연": "#4CAF50", "연우": "#2196F3" };

    chartConfigs.forEach(cfg => {
        const ctx = document.getElementById(cfg.id).getContext('2d');
        const datasets = activeStudents.map(student => ({
            label: student,
            data: [], // updateViewToStep에서 채움
            borderColor: colors[student],
            backgroundColor: colors[student],
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3
        }));
        const chart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets },
            options: { responsive: true, animation: { duration: 300 }, scales: { y: { min: cfg.type === 'u' ? 0 : 1, max: cfg.max } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }
        });
        chartInstances.push({ chart, cfg });
    });

    // 화면을 현재 스텝(전체 표시) 기준으로 렌더링
    updateViewToStep(currentStep);
}

// 특정 턴(Step)으로 뷰를 업데이트하는 함수
function updateViewToStep(step) {
    let currentHIndex = 0; // 차트에 반영될 '학생 발화 턴' 누적 횟수
    
    // 1. 말풍선 토글 및 HIndex 계산
    for (let i = 0; i < totalSteps; i++) {
        const msgDiv = document.getElementById(`msg-${i}`);
        if (i < step) {
            msgDiv.style.display = 'block';
        if (activeStudents.includes(chatLogsData[i].speaker)) {
                currentHIndex++;
            }
        } else {
            msgDiv.style.display = 'none';
        }
    }

    const chatBox = document.getElementById('recordChatBox');
    chatBox.scrollTop = chatBox.scrollHeight; // 자동 스크롤

    // 2. 상단 카운터 업데이트
    document.getElementById('replayStep').innerText = `(재현 진행도: ${step} / ${totalSteps})`;

    // 3. 역량 점수 테이블 업데이트
    const tbody = document.getElementById('recordScoreTableBody');
    tbody.innerHTML = '';
    activeStudents.forEach(name => {
        let uData = fullUHistory && fullUHistory[name] ? fullUHistory[name] : [0];
        let sData = fullSHistory && fullSHistory[name] ? fullSHistory[name] : [[1,1,1,1,1]];
        
        let targetIdx = Math.min(currentHIndex, uData.length - 1);
        let curLevel = uData[targetIdx];
        
        let sTargetIdx = Math.min(currentHIndex, sData.length - 1);
        let curScores = sData[sTargetIdx];
        
        let prevLevel = targetIdx > 0 ? uData[targetIdx - 1] : curLevel;
        let diff = curLevel - prevLevel;
        let deltaHtml = '<span style="color: transparent; font-size: 0.75rem;">-</span>';
        if (diff > 0) {
            deltaHtml = `<span style="color: #4CAF50; font-size: 0.75rem; font-weight: bold; animation: popUp 0.5s ease-out;">⬆</span>`;
        } else if (diff < 0) {
            deltaHtml = `<span style="color: #F44336; font-size: 0.75rem; font-weight: bold; animation: popDown 0.5s ease-out;">⬇</span>`;
        }

        // 💡 과거에 저장된 객체 래핑 데이터 호환성 처리 ({ scores: [...] } 구조 방어)
        if (curScores && curScores.scores) curScores = curScores.scores;
        
        let prevTargetIdx = sTargetIdx > 0 ? sTargetIdx - 1 : sTargetIdx;
        let prevScores = sData[prevTargetIdx];
        if (prevScores && prevScores.scores) prevScores = prevScores.scores;

        let sDeltaHtmls = Array(5).fill('<div style="color: transparent; font-size: 0.75rem; line-height: 1; margin-top: 2px;">-</div>');
        if (sTargetIdx > 0 && curScores && prevScores) {
            for (let i = 0; i < 5; i++) {
                const diffStr = (curScores[i] - prevScores[i]).toFixed(1);
                const diffVal = parseFloat(diffStr);
                if (diffVal > 0) {
                    sDeltaHtmls[i] = `<div style="color: #4CAF50; font-size: 0.75rem; font-weight: bold; line-height: 1; margin-top: 2px; animation: popUp 0.5s ease-out;">⬆</div>`;
                } else if (diffVal < 0) {
                    sDeltaHtmls[i] = `<div style="color: #F44336; font-size: 0.75rem; font-weight: bold; line-height: 1; margin-top: 2px; animation: popDown 0.5s ease-out;">⬇</div>`;
                }
            }
        }

        let barColor = curLevel > 70 ? '#4caf50' : curLevel > 30 ? '#ffc107' : '#f44336';
        let hpText = `<div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center; line-height: 1; margin-bottom: 3px;">
                          <span style="font-size: 0.75rem; color: #555; font-weight: bold;">이해도: ${curLevel}%</span>
                          ${deltaHtml}
                      </div>
                      <div style="width: 100%; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${curLevel}%; height: 100%; background: ${barColor}; transition: all 0.3s ease;"></div>
                      </div>`;
        
        tbody.innerHTML += `<tr>
            <td><strong>${name}</strong>${hpText}</td>
            <td><div style="font-size: 0.95rem;">${Number(curScores[0]).toFixed(1)}</div>${sDeltaHtmls[0]}</td>
            <td><div style="font-size: 0.95rem;">${Number(curScores[1]).toFixed(1)}</div>${sDeltaHtmls[1]}</td>
            <td><div style="font-size: 0.95rem;">${Number(curScores[2]).toFixed(1)}</div>${sDeltaHtmls[2]}</td>
            <td><div style="font-size: 0.95rem;">${Number(curScores[3]).toFixed(1)}</div>${sDeltaHtmls[3]}</td>
            <td><div style="font-size: 0.95rem;">${Number(curScores[4]).toFixed(1)}</div>${sDeltaHtmls[4]}</td>
        </tr>`;
    });

    // 4. 차트 6종 데이터 업데이트
    const labels = Array.from({length: currentHIndex + 1}, (_, i) => i === 0 ? "시작" : `${i}턴`);
    
    chartInstances.forEach(({chart, cfg}) => {
        chart.data.labels = labels;
        chart.data.datasets.forEach((ds, dsIdx) => {
            const student = activeStudents[dsIdx];
            if (cfg.type === 'u') {
                let uData = fullUHistory && fullUHistory[student] ? fullUHistory[student] : [0];
                ds.data = uData.slice(0, currentHIndex + 1);
            } else {
                let sData = fullSHistory && fullSHistory[student] ? fullSHistory[student] : [[1,1,1,1,1]];
                ds.data = sData.slice(0, currentHIndex + 1).map(arr => {
                    const scores = arr && arr.scores ? arr.scores : arr;
                    return scores[cfg.idx];
                });
            }
        });
        chart.update();
    });
}

document.addEventListener('DOMContentLoaded', loadDetail);

// 좌우 방향키로 대화 재생/되감기
document.addEventListener('keydown', (e) => {
    if (totalSteps > 0) {
        if (e.key === 'ArrowRight') {
            if (currentStep < totalSteps) {
                currentStep++;
                updateViewToStep(currentStep);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentStep > 0) {
                currentStep--;
                updateViewToStep(currentStep);
                e.preventDefault();
            }
        }
    }
});