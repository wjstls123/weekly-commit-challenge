// API 설정 (실제 배포 시 변경 필요)
const API_BASE_URL = 'https://your-api-endpoint.com'; // 실제 API 엔드포인트로 변경
let currentFilter = 'streak';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentChallenge(); // 가장 먼저 실행
    loadStats();
    loadRanking('streak');
    setupFilterButtons();
    updateApiEndpoint();
    
    // 페이지 뷰 추적
    trackEvent('page_view', {
        page_title: '위클리 커밋 챌린지',
        page_location: window.location.href
    });
});

// 즉시 실행으로 더 빠르게 표시
updateCurrentChallenge();

// Google Analytics 이벤트 추적
function trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
}


// API 엔드포인트 표시
function updateApiEndpoint() {
    document.getElementById('apiEndpoint').textContent = API_BASE_URL;
}

// 현재 챌린지 정보 업데이트
function updateCurrentChallenge() {
    const now = new Date();
    const year = now.getFullYear();
    
    // ISO 8601 주차 계산 (월요일이 주의 시작)
    function getWeekNumber(date) {
        // 목표 날짜를 복사하고 시간을 0으로 설정
        const target = new Date(date.valueOf());
        const dayNr = (target.getDay() + 6) % 7; // 월요일을 0으로 만들기
        target.setDate(target.getDate() - dayNr + 3); // 목요일로 이동
        const jan4 = new Date(target.getFullYear(), 0, 4); // 1월 4일
        const dayDiff = (target - jan4) / 86400000; // 일 차이
        return Math.ceil(dayDiff / 7); // 주차 반환
    }
    
    // 주차의 시작일과 종료일 계산
    function getWeekDates(date) {
        const target = new Date(date.valueOf());
        const dayNr = (target.getDay() + 6) % 7; // 월요일을 0으로 만들기
        
        // 이번 주 월요일
        const monday = new Date(target);
        monday.setDate(target.getDate() - dayNr);
        
        // 이번 주 일요일
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        return {
            start: monday,
            end: sunday
        };
    }
    
    const weekNumber = getWeekNumber(now);
    const weekDates = getWeekDates(now);
    
    // 날짜 포맷팅
    const formatDate = (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    const weekPeriod = `${formatDate(weekDates.start)} ~ ${formatDate(weekDates.end)}`;
    
    // 현재 요일 확인 (0: 일요일, 1: 월요일, ...)
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    
    // 달력 아이콘 고정
    const badgeIcon = document.querySelector('.badge-icon');
    badgeIcon.textContent = '🗓️';
    
    // 디버깅용 로그
    console.log(`현재 날짜: ${now.toLocaleDateString('ko-KR')}`)
    console.log(`계산된 주차: ${year}년 ${weekNumber}주차 (${weekPeriod})`)
    console.log(`현재 요일: ${dayOfWeek} (0=일요일)`);
    
    const challengeBadge = document.getElementById('currentChallenge');
    const badgeText = challengeBadge.querySelector('.badge-text');
    
    // 기존 클래스 제거
    challengeBadge.classList.remove('urgent', 'new-week');
    
    // 현재 상태에 따라 메시지와 스타일 변경
    if (dayOfWeek === 1) { // 월요일
        badgeText.textContent = `${year}년 ${weekNumber}주차 (${weekPeriod}) 새로운 챌린지 시작! 🚀`;
        challengeBadge.classList.add('new-week');
    } else if (daysUntilMonday === 0) { // 일요일 (마감일)
        badgeText.textContent = `${year}년 ${weekNumber}주차 (${weekPeriod}) 마감 임박! ⏰`;
        challengeBadge.classList.add('urgent');
    } else {
        badgeText.textContent = `${year}년 ${weekNumber}주차 (${weekPeriod}) 챌린지 진행중! 💪`;
    }
    
    // 추가 정보 업데이트
    const challengeInfo = document.querySelector('.challenge-info');
    if (daysUntilMonday === 0) {
        challengeInfo.textContent = '오늘이 마지막 기회! 내일 새로운 주차가 시작됩니다';
    } else if (daysUntilMonday === 1) {
        challengeInfo.textContent = '내일 새로운 주차가 시작됩니다. 지금 참여해보세요!';
    } else {
        challengeInfo.textContent = `${daysUntilMonday}일 후 새로운 주차가 시작됩니다. 지금 참여하면 이번 주부터 기록이 시작됩니다`;
    }
}


// 통계 로드
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        const data = await response.json();
        
        document.getElementById('totalParticipants').textContent = data.totalParticipants || '0';
        document.getElementById('weeklyParticipants').textContent = data.weeklyParticipants || '0';
        document.getElementById('weeklySuccessful').textContent = data.weeklySuccessful || '0';
        document.getElementById('longestStreak').textContent = `${data.longestStreak || '0'}주`;
        document.getElementById('averageSuccessRate').textContent = `${data.averageSuccessRate || '0'}%`;
    } catch (error) {
        console.error('통계 로드 실패:', error);
        document.getElementById('totalParticipants').textContent = '0';
        document.getElementById('weeklyParticipants').textContent = '0';
        document.getElementById('weeklySuccessful').textContent = '0';
        document.getElementById('longestStreak').textContent = '0주';
        document.getElementById('averageSuccessRate').textContent = '0%';
    }
}

// 랭킹 로드
async function loadRanking(filter) {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '<div class="loading">랭킹을 불러오는 중...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/ranking?sort=${filter}`);
        const data = await response.json();
        
        if (data.length === 0) {
            rankingList.innerHTML = '<div class="loading">아직 참여자가 없습니다.</div>';
            return;
        }
        
        rankingList.innerHTML = data.map((user, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const badgeClass = user.currentStreak > 0 ? '' : 'fail';
            const badgeText = user.currentStreak > 0 ? `${user.currentStreak}주차` : '챌린지 실패';
            
            return `
                <div class="ranking-item">
                    <div class="rank-number ${rankClass}">${index + 1}</div>
                    <div class="user-info">
                        <img src="https://github.com/${user.username}.png" alt="${user.username}" class="user-avatar">
                        <a href="https://github.com/${user.username}" target="_blank" class="user-name">${user.username}</a>
                    </div>
                    <div class="user-stats">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        <span>총 ${user.totalCommits}일</span>
                        <span>최고 ${user.bestStreak}주</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('랭킹 로드 실패:', error);
        rankingList.innerHTML = '<div class="loading">랭킹을 불러올 수 없습니다.</div>';
    }
}

// 필터 버튼 설정
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 활성 버튼 변경
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 랭킹 다시 로드
            const filter = button.getAttribute('data-filter');
            currentFilter = filter;
            loadRanking(filter);
            
            // Google Analytics 이벤트 추적
            trackEvent('filter_change', {
                filter_type: filter,
                event_category: 'ranking'
            });
        });
    });
    
    // Fork 버튼 클릭 추적
    const forkButtons = document.querySelectorAll('.fork-btn');
    forkButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('fork_button_click', {
                event_category: 'participation',
                event_label: 'header_fork_button'
            });
        });
    });
}


// 자동 새로고침 (5분마다)
setInterval(() => {
    loadStats();
    loadRanking(currentFilter);
    updateCurrentChallenge();
}, 5 * 60 * 1000);