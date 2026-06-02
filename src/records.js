import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { initializeFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase 설정 (script.js의 설정과 동일)
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

async function loadRecords() {
    const tbody = document.getElementById('recordsTableBody');
    if (!db) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 30px;">Firebase가 연결되지 않았습니다.</td></tr>';
        return;
    }

    try {
        // 시간순(내림차순) 정렬 쿼리
        const q = query(collection(db, "simulation_logs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        tbody.innerHTML = ''; // 로딩 텍스트 제거
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding: 30px;">저장된 시뮬레이션 기록이 없습니다.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${data.savedAt || "시간 정보 없음"}</td>
                <td style="font-weight: bold; color: #2C3E50;">${data.title || "제목 없음"}</td>
                <td>${data.author || "알 수 없음"}</td>
                <td>${data.totalTurns || 0}턴</td>
                <td><button class="btn-view-detail">상세 보기</button></td>
            `;
            
            // 상세 보기 버튼 이벤트 리스너 바인딩
            const btn = tr.querySelector('.btn-view-detail');
            btn.addEventListener('click', () => {
                window.location.href = `record_detail.html?id=${doc.id}`;
            });
            
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("기록 불러오기 실패:", e);
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 30px;">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadRecords(); // 페이지 접속 시 바로 데이터 불러오기
});