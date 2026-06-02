import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { initializeFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-L5P8XZyFAmsrAHPqIIc__qqM_TunegY",
    authDomain: "snu-me-yyj.firebaseapp.com",
    projectId: "snu-me-yyj",
    storageBucket: "snu-me-yyj.firebasestorage.app",
    messagingSenderId: "292468821013",
    appId: "1:292468821013:web:a6c809863462487612521c"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

document.getElementById('saveProblemBtn').addEventListener('click', async () => {
    const p_id = document.getElementById('p_id').value.trim();
    const title = document.getElementById('p_title').value.trim();
    const background = document.getElementById('p_background').value.trim();
    const content = document.getElementById('p_content').value.trim();
    const goal1 = document.getElementById('p_goal1').value.trim();
    const goal2 = document.getElementById('p_goal2').value.trim();
    const teacherHint = document.getElementById('p_teacherHint').value.trim();
    const teacherInit = document.getElementById('p_teacherInit').value.trim();

    if (!p_id || !title || !background || !content || !goal1 || !teacherHint || !teacherInit) {
        alert("필수 항목을 모두 입력해주세요!");
        return;
    }

    // 학생들에게 보일 과제 카드 HTML 동적 생성
    let uiHtml = `<p><strong>[문제 상황]</strong> ${content}</p>`;
    uiHtml += `<p><strong>[과제 1]</strong> ${goal1}</p>`;
    if (goal2) uiHtml += `<p><strong>[과제 2]</strong> ${goal2}</p>`;

    const goals = [goal1];
    if (goal2) goals.push(goal2);

    const problemData = {
        title: title,
        background: background,
        content: content,
        goals: goals,
        teacherHint: teacherHint,
        teacherInitialText: teacherInit,
        uiHtml: uiHtml
    };

    try {
        const btn = document.getElementById('saveProblemBtn');
        btn.innerText = "저장 중...";
        await setDoc(doc(db, "problems", p_id), problemData);
        alert(`'${title}' 문제가 성공적으로 저장되었습니다!\n이제 시뮬레이터에서 선택할 수 있습니다.`);
        window.location.href = "index.html";
    } catch (e) {
        console.error("문제 DB 저장 오류:", e);
        alert("오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
});