// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentChallenge();
    loadForkStatistics();
    initProfileSearch();
    initSampleTabs();
    setupRankingFilters();
    loadSavedProfile();
});

// 즉시 실행으로 더 빠르게 표시
updateCurrentChallenge();

// 현재 챌린지 정보 업데이트 (클라이언트 로컬 시간 기준)
function updateCurrentChallenge() {
    // 클라이언트 로컬 시간 사용
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

    // 현재 요일 확인 (0: 일요일, 1: 월요일, ...) - 로컬 시간 기준
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;

    // 달력 아이콘 고정
    const badgeIcon = document.querySelector('.badge-icon');
    if (badgeIcon) {
        badgeIcon.textContent = '🗓️';
    }

    console.log(`현재 날짜 (로컬): ${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR')}`)
    console.log(`계산된 주차: ${year}년 ${weekNumber}주차 (${weekPeriod})`)
    console.log(`현재 요일: ${dayOfWeek} (0=일요일, 로컬 기준)`);

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

// 프로필 검색 초기화
function initProfileSearch() {
    const profileInput = document.getElementById('profileInput');
    const searchBtn = document.getElementById('searchProfile');

    if (!profileInput || !searchBtn) {
        console.error('프로필 검색 요소를 찾을 수 없습니다');
        return;
    }

    // 검색 버튼 이벤트
    searchBtn.addEventListener('click', () => {
        const input = profileInput.value.trim();
        if (input) {
            const username = extractUsername(input);
            searchProfile(username);
        } else {
            showErrorMessage('GitHub 사용자명을 입력해주세요.');
        }
    });

    // 엔터키 이벤트
    profileInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // 코드 탭 클릭 이벤트 리스너 추가
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('code-tab')) {
            const tab = e.target.getAttribute('data-tab');
            switchCodeTab(tab);
        }
    });
}

// GitHub URL에서 사용자명 추출
function extractUsername(input) {
    if (input.includes('github.com/')) {
        return input.split('github.com/')[1].split('/')[0];
    }
    return input;
}

// 에러 메시지 표시
function showErrorMessage(message) {
    const profileResult = document.getElementById('profileResult');
    profileResult.style.display = 'block';
    profileResult.innerHTML = `<div class="error-message" style="color: #f85149; text-align: center; padding: 30px; background: #161b22; border: 1px solid #30363d; border-radius: 8px;">
        ❌ ${message}
    </div>`;
}

// 성공 시 프로필 UI 표시
function showProfileUI(data) {
    console.log('showProfileUI 받은 데이터:', data);
    const profileResult = document.getElementById('profileResult');
    profileResult.style.display = 'block';

    // GitHub에서 제공하는 SVG 카드 확인
    const cardUrl = `https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/cards/user-${data.username}.svg`;
    
    profileResult.innerHTML = `
        <div class="profile-header">
            <img class="profile-avatar" src="${data.avatarUrl}" alt="프로필 이미지">
            <div class="profile-info">
                <h3>${data.username} <a href="https://github.com/${data.username}" target="_blank" class="github-link">https://github.com/${data.username}</a></h3>
                <p class="profile-status ${data.currentWeekSuccess ? 'success' : 'progress'}">
                    ${data.currentWeekSuccess ? '✅ 이번 주 성공' : `🔄 진행중 (${data.currentWeekCommits}개)`}
                </p>
            </div>
        </div>
        
        <div class="profile-card-section">
            <h4>내 실시간 프로필 카드</h4>
            <div class="card-preview">
                <img src="https://9d4f8efc-weekly-commit-card.wjstls123.workers.dev/?username=${data.username}" 
                     alt="Weekly Commit Challenge Card"
                     style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: transparent;">
            </div>
            <div class="card-import-section">
                <p style="font-size: 13px; color: #586069; margin: 0 0 10px 0;">
                    <strong>README에 카드 추가하기:</strong>
                </p>
                
                <div>
                    <label style="font-size: 12px; color: #586069; display: block; margin-bottom: 5px;">실시간 동적 카드:</label>
                    <div class="import-url">
                        <input type="text" readonly 
                               value='![Weekly Commit Challenge](https://9d4f8efc-weekly-commit-card.wjstls123.workers.dev/?username=${data.username})'
                               id="cloudflareCode-${data.username}">
                        <button onclick="copyToClipboard('cloudflareCode-${data.username}')">복사</button>
                    </div>
                </div>
                
                <p style="font-size: 11px; color: #8b949e; margin: 10px 0 0 0;">
                    🚀 GitHub README에서 바로 표시 | ⚡ 실시간 업데이트 | 🌍 전 세계 CDN
                </p>
            </div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-item">
                <span class="stat-label">이번 주 커밋</span>
                <span class="stat-value">${data.currentWeekCommits}개</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">연속 성공</span>
                <span class="stat-value">${data.currentStreak}주</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">최장 연속</span>
                <span class="stat-value">${data.maxStreak || data.currentStreak}주</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">성공률</span>
                <span class="stat-value">${data.successRate || 0}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">총 참여 주차</span>
                <span class="stat-value">${data.totalWeeks}주</span>
            </div>
        </div>
        
        <div class="profile-recent">
            <h4>최근 기록</h4>
            <div id="recentRecords" class="recent-records"></div>
        </div>
    `;

    // 최근 기록 표시
    displayRecentRecords(data.recentRecords);
}

// record.md 파싱해서 통계 계산
function parseRecordMd(content) {
    console.log('파싱 시작 - 전체 내용 길이:', content.length);
    const lines = content.split('\n');
    const records = [];
    let inTable = false;

    console.log('총 라인 수:', lines.length);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes('|') && line.includes('기간')) {
            console.log(`테이블 헤더 발견 (라인 ${i + 1}):`, line);
            inTable = true;
            continue;
        }

        if (inTable && line.includes('|') && !line.includes('---')) {
            console.log(`데이터 라인 발견 (라인 ${i + 1}):`, line);
            const parts = line.split('|').map(p => p.trim());
            console.log('분할된 부분:', parts);

            if (parts.length >= 5) { // 5개 이상의 컬럼이 있어야 함
                const period = parts[1];
                const week = parts[2];
                const commits = parseInt(parts[3]) || 0;
                const statusText = parts[4] || '';

                // 성공 여부 판정: ✅가 포함되어 있고 진행중이 아닌 경우만 성공으로 판정
                const success = statusText.includes('✅') && !statusText.includes('🔄') && !statusText.includes('진행중');

                console.log(`기록 추가: 기간=${period}, 주차=${week}, 커밋=${commits}, 상태=${statusText}, 성공=${success}`);

                records.push({
                    period,
                    week,
                    commits,
                    success
                });
            }
        }
    }

    console.log('파싱 완료 - 총 기록 수:', records.length);
    return records; // 오름차순 유지 (오래된 것이 먼저)
}

// 통계 계산
function calculateStats(records) {
    // 클라이언트 로컬 시간 사용
    const now = new Date();

    // ISO 8601 주차 계산 함수
    function getWeekNumber(date) {
        const target = new Date(date.valueOf());
        const dayNr = (target.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const jan4 = new Date(target.getFullYear(), 0, 4);
        const dayDiff = (target - jan4) / 86400000;
        return Math.ceil(dayDiff / 7);
    }

    if (records.length === 0) {
        return {
            currentYear: now.getFullYear(),
            currentWeek: getWeekNumber(now),
            currentWeekCommits: 0,
            currentWeekSuccess: false,
            currentStreak: 0,
            totalWeeks: 0,
            recentRecords: []
        };
    }

    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);

    // 현재 주차 데이터 찾기 (최신 기록을 현재 주차로 가정)
    const currentWeekData = records[records.length - 1];

    // 연속 성공 주차 계산 (진행중은 제외)
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    // 현재 연속 주차 계산 (최신부터 역순으로)
    for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].success) {
            currentStreak++;
        } else {
            break;
        }
    }
    
    // 최장 연속 주차 계산 (전체 기록에서)
    for (const record of records) {
        if (record.success) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    // 성공률 계산
    const successWeeks = records.filter(record => record.success).length;
    const successRate = records.length > 0 ? Math.round((successWeeks / records.length) * 100 * 10) / 10 : 0;

    return {
        currentYear,
        currentWeek,
        currentWeekCommits: currentWeekData?.commits || 0,
        currentWeekSuccess: currentWeekData?.success || false,
        currentStreak,
        maxStreak,
        successRate,
        totalWeeks: records.length,
        recentRecords: records.slice(-10).reverse() // 최근 10개를 최신순으로
    };
}

// 프로필 검색 (캐시 우선 사용)
async function searchProfile(username) {
    try {
        // 로딩 상태 표시
        showErrorMessage('기록을 불러오는 중...');

        console.log(`사용자 검색: ${username}`);

        // fetchUserData 함수 사용 (캐시 포함)
        const data = await fetchUserData(username);

        if (!data) {
            throw new Error('해당 사용자의 weekly-commit-challenge 레포지토리나 record 파일을 찾을 수 없습니다. 아직 참여하지 않았거나 사용자명이 잘못되었을 수 있습니다.');
        }

        console.log('최종 데이터:', data);

        // 성공 시 프로필 UI 표시
        showProfileUI(data);
        
        // 로컬스토리지에 사용자명 저장
        localStorage.setItem('weekly-commit-username', username);

    } catch (error) {
        console.error('프로필 검색 오류:', error);

        // 네트워크 오류인지 확인
        if (error instanceof TypeError && error.message.includes('fetch')) {
            showErrorMessage('네트워크 연결 오류<br><small style="color: #8b949e; margin-top: 10px; display: block;">인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.</small>');
        } else {
            showErrorMessage(error.message);
        }
    }
}

// 최근 기록 표시
function displayRecentRecords(records) {
    const recentRecords = document.getElementById('recentRecords');

    if (!records || records.length === 0) {
        recentRecords.innerHTML = '<div class="no-data" style="color: #8b949e; text-align: center; padding: 20px;">아직 기록이 없습니다</div>';
        return;
    }

    recentRecords.innerHTML = records.map(record => `
        <div class="record-item">
            <span class="record-period">${record.period}</span>
            <div class="record-result">
                <span class="record-commits">${record.commits}개 커밋</span>
                <span class="record-status ${record.success ? 'success' : 'fail'}">
                    ${record.success ? '✅ 성공' : '❌ 실패'}
                </span>
            </div>
        </div>
    `).join('');
}

// 샘플 탭 초기화
function initSampleTabs() {
    const tabs = document.querySelectorAll('.sample-tab');
    const cards = document.querySelectorAll('.sample-card');

    if (tabs.length === 0 || cards.length === 0) {
        return;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // 모든 탭 비활성화
            tabs.forEach(t => t.classList.remove('active'));
            cards.forEach(c => c.classList.remove('active'));

            // 클릭된 탭 활성화
            tab.classList.add('active');
            const targetCard = document.getElementById(`${targetTab}-card`);
            if (targetCard) {
                targetCard.classList.add('active');
            }
        });
    });
}

// Fork 통계 로드 (정적 JSON 우선, 없으면 실시간)
async function loadForkStatistics() {
    try {
        // 기본 통계 초기화
        document.getElementById('totalParticipants').textContent = '-';
        document.getElementById('weeklySuccessful').textContent = '-';
        document.getElementById('averageSuccessRate').textContent = '-';
        document.getElementById('averageStreak').textContent = '-';

        console.log('Fork 통계 로드 시작...');

        // statistics.json 파일에서 통계 데이터 조회 (raw 파일이므로 캐시 불필요)
        try {
            const response = await fetch('https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/statistics.json');
            if (response.ok) {
                const stats = await response.json();
                console.log('statistics.json에서 통계 데이터 로드 성공:', stats);
                
                displayCachedStatistics(stats);
                return;
            }
        } catch (err) {
            console.error('statistics.json 데이터 로드 실패:', err);
        }

        // statistics.json 데이터가 없는 경우 기본값 설정
        document.getElementById('totalParticipants').textContent = '0명';
        document.getElementById('weeklySuccessful').textContent = '0명';
        document.getElementById('averageSuccessRate').textContent = '0%';
        document.getElementById('averageStreak').textContent = '0';
        document.getElementById('rankingList').innerHTML = '<div class="loading">통계 데이터를 불러올 수 없습니다. GitHub Actions 워크플로우가 실행되기를 기다려주세요.</div>';

    } catch (error) {
        console.error('통계 로드 실패:', error);
        document.getElementById('totalParticipants').textContent = '오류';
        document.getElementById('weeklySuccessful').textContent = '오류';
        document.getElementById('averageSuccessRate').textContent = '오류';
        document.getElementById('averageStreak').textContent = '오류';
        document.getElementById('rankingList').innerHTML = '<div class="loading">통계를 불러올 수 없습니다.</div>';
    }
}




// 캐시된 통계 표시
function displayCachedStatistics(stats) {
    document.getElementById('totalParticipants').textContent = (stats.totalParticipants || 0) + '명';
    document.getElementById('weeklySuccessful').textContent = (stats.weeklySuccessful || 0) + '명';
    document.getElementById('averageSuccessRate').textContent = (stats.averageSuccessRate || 0) + '%';
    document.getElementById('averageStreak').textContent = (stats.averageStreak || 0) + '주';

    // 랭킹 데이터도 사용
    console.log('랭킹 데이터 확인:', {
        participants: stats.participants ? stats.participants.length : 'none',
        rankingByStreak: stats.rankingByStreak ? stats.rankingByStreak.length : 'none',
        rankingBySuccessRate: stats.rankingBySuccessRate ? stats.rankingBySuccessRate.length : 'none',
        rankingByMaxStreak: stats.rankingByMaxStreak ? stats.rankingByMaxStreak.length : 'none'
    });

    if (stats.participants && stats.participants.length > 0) {
        console.log('기존 participants 데이터 사용');
        globalRankingData = stats.participants;
        displayRanking('streak');
    } else if (stats.rankingByStreak && stats.rankingBySuccessRate && stats.rankingByMaxStreak) {
        console.log('새로운 랭킹 데이터 구조 사용');
        globalRankingData = {
            streak: stats.rankingByStreak,
            successRate: stats.rankingBySuccessRate,
            maxStreak: stats.rankingByMaxStreak
        };
        displayCachedRanking('streak');
    } else {
        console.log('랭킹 데이터가 없음');
        document.getElementById('rankingList').innerHTML = '<div class="loading">랭킹 데이터가 없습니다.</div>';
    }

    // 마지막 업데이트 시간 표시 (선택사항)
    const lastUpdated = new Date(stats.lastUpdated);
    console.log(`통계 마지막 업데이트: ${lastUpdated.toLocaleString('ko-KR')}`);
}

// 랭킹 데이터 저장를 위한 전역 변수
let globalRankingData = [];

// 랭킹 필터 버튼 설정
function setupRankingFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 활성 버튼 변경
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 랭킹 다시 로드
            const filter = button.getAttribute('data-filter');

            // 데이터 구조에 따라 적절한 함수 호출
            if (globalRankingData && globalRankingData.streak && globalRankingData.successRate) {
                displayCachedRanking(filter);
            } else if (globalRankingData && Array.isArray(globalRankingData)) {
                displayRanking(filter);
            } else {
                document.getElementById('rankingList').innerHTML = '<div class="loading">랭킹 데이터가 없습니다.</div>';
            }
        });
    });
}


// 페이지네이션을 위한 전역 변수
let currentPage = 1;
const itemsPerPage = 10;
let currentRankingData = [];
let currentFilter = 'streak';

// 랭킹 표시
function displayRanking(filter, page = 1) {
    const rankingList = document.getElementById('rankingList');
    currentFilter = filter;
    currentPage = page;

    if (!globalRankingData || globalRankingData.length === 0) {
        rankingList.innerHTML = '<div class="loading">랭킹 데이터가 없습니다. GitHub Actions 워크플로우가 실행되기를 기다려주세요.</div>';
        return;
    }

    // 필터에 따라 정렬
    let sortedData = [...globalRankingData];

    switch (filter) {
        case 'streak':
            sortedData.sort((a, b) => b.currentStreak - a.currentStreak);
            break;
        case 'success-rate':
            sortedData.sort((a, b) => b.successRate - a.successRate);
            break;
    }

    // 최대 100명으로 제한
    sortedData = sortedData.slice(0, 100);
    currentRankingData = sortedData;

    // 페이지네이션 계산
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = sortedData.slice(startIndex, endIndex);

    // 랭킹 HTML 생성
    if (pageData.length === 0) {
        rankingList.innerHTML = '<div class="loading">아직 참여자가 없습니다.</div>';
        return;
    }

    const rankingHTML = pageData.map((user, index) => {
        const actualIndex = startIndex + index;
        const rankClass = actualIndex === 0 ? 'gold' : actualIndex === 1 ? 'silver' : actualIndex === 2 ? 'bronze' : '';
        const badgeClass = user.currentWeekSuccess ? 'success' : 'progress';
        const badgeText = user.currentWeekSuccess ? '성공' : '진행중';

        let mainStat = '';
        switch (filter) {
            case 'streak':
                mainStat = `${user.currentStreak}주`;
                break;
            case 'success-rate':
                mainStat = `${user.successRate}%`;
                break;
            case 'max-streak':
                mainStat = `${user.maxStreak || 0}주`;
                break;
        }

        return `
            <div class="ranking-item" onclick="toggleRankingDetail('${user.username}', ${actualIndex})" style="cursor: pointer;">
                <div class="rank-number ${rankClass}">${actualIndex + 1}</div>
                <div class="user-info">
                    <img src="${user.avatarUrl}" alt="${user.username}" class="user-avatar">
                    <span class="user-name">${user.username}</span>
                </div>
                <div class="user-stats">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                    <span class="main-stat">${mainStat}</span>
                </div>
            </div>
            <div id="ranking-detail-${actualIndex}" class="ranking-detail" style="display: none;"></div>
        `;
    }).join('');

    // 페이지네이션 HTML 생성
    const paginationHTML = generatePagination(totalPages, page);
    
    rankingList.innerHTML = rankingHTML + paginationHTML;
}

// 캐시된 랭킹 표시 (새로운 데이터 구조용)
function displayCachedRanking(filter, page = 1) {
    const rankingList = document.getElementById('rankingList');
    currentFilter = filter;
    currentPage = page;

    if (!globalRankingData || (!globalRankingData.streak && !globalRankingData.successRate)) {
        rankingList.innerHTML = '<div class="loading">랭킹 데이터를 수집하는 중...</div>';
        return;
    }

    // 필터에 따라 데이터 선택
    let sortedData = [];
    switch (filter) {
        case 'streak':
            sortedData = globalRankingData.streak || [];
            break;
        case 'success-rate':
            sortedData = globalRankingData.successRate || [];
            break;
        case 'max-streak':
            sortedData = globalRankingData.maxStreak || [];
            break;
    }

    // 최대 100명으로 제한
    sortedData = sortedData.slice(0, 100);
    currentRankingData = sortedData;

    // 페이지네이션 계산
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = sortedData.slice(startIndex, endIndex);

    // 랭킹 HTML 생성
    if (pageData.length === 0) {
        rankingList.innerHTML = '<div class="loading">아직 참여자가 없습니다.</div>';
        return;
    }

    const rankingHTML = pageData.map((user, index) => {
        const actualIndex = startIndex + index;
        const rankClass = actualIndex === 0 ? 'gold' : actualIndex === 1 ? 'silver' : actualIndex === 2 ? 'bronze' : '';
        const badgeClass = user.currentWeekSuccess ? 'success' : 'progress';
        const badgeText = user.currentWeekSuccess ? '성공' : '진행중';

        let mainStat = '';
        switch (filter) {
            case 'streak':
                mainStat = `${user.currentStreak}주`;
                break;
            case 'success-rate':
                mainStat = `${user.successRate}%`;
                break;
            case 'max-streak':
                mainStat = `${user.maxStreak || 0}주`;
                break;
        }

        return `
            <div class="ranking-item" onclick="toggleRankingDetail('${user.username}', ${actualIndex})" style="cursor: pointer;">
                <div class="rank-number ${rankClass}">${actualIndex + 1}</div>
                <div class="user-info">
                    <img src="${user.avatarUrl}" alt="${user.username}" class="user-avatar">
                    <span class="user-name">${user.username}</span>
                </div>
                <div class="user-stats">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                    <span class="main-stat">${mainStat}</span>
                </div>
            </div>
            <div id="ranking-detail-${actualIndex}" class="ranking-detail" style="display: none;"></div>
        `;
    }).join('');

    // 페이지네이션 HTML 생성
    const paginationHTML = generatePagination(totalPages, page);
    
    rankingList.innerHTML = rankingHTML + paginationHTML;
}

// 페이지네이션 HTML 생성
function generatePagination(totalPages, currentPage) {
    if (totalPages <= 1) return '';

    let paginationHTML = '<div class="pagination">';
    
    // 이전 버튼
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">‹</button>`;
    }
    
    // 페이지 번호들
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="page-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
        paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">›</button>`;
    }
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// 페이지 변경
function changePage(page) {
    if (globalRankingData && globalRankingData.streak && globalRankingData.successRate) {
        displayCachedRanking(currentFilter, page);
    } else if (globalRankingData && Array.isArray(globalRankingData)) {
        displayRanking(currentFilter, page);
    }
}

// 랭킹에서 유저 상세정보 토글
async function toggleRankingDetail(username, rankIndex) {
    const detailElement = document.getElementById(`ranking-detail-${rankIndex}`);
    
    if (detailElement.style.display === 'none') {
        // 다른 열린 상세정보들 모두 닫기
        document.querySelectorAll('.ranking-detail').forEach(detail => {
            detail.style.display = 'none';
        });
        
        // 로딩 표시
        detailElement.innerHTML = '<div class="loading" style="padding: 20px; text-align: center;">사용자 정보를 불러오는 중...</div>';
        detailElement.style.display = 'block';
        
        try {
            // 사용자 정보 불러오기
            const data = await fetchUserData(username);
            
            // 상세 정보 HTML 생성
            const statusText = data.totalWeeks === 0 ? 
                '⏸️ 아직 참여하지 않음' : 
                (data.currentWeekSuccess ? '✅ 이번 주 성공' : `🔄 진행중 (${data.currentWeekCommits}개)`);
            
            const statusClass = data.totalWeeks === 0 ? 'not-started' : (data.currentWeekSuccess ? 'success' : 'progress');

            detailElement.innerHTML = `
                <div class="ranking-user-detail">
                    <div class="detail-header">
                        <img class="detail-avatar" src="${data.avatarUrl}" alt="${data.username}">
                        <div class="detail-info">
                            <h4>${data.username} <a href="https://github.com/${data.username}" target="_blank" class="github-link">https://github.com/${data.username}</a></h4>
                            <p class="detail-status ${statusClass}">
                                ${statusText}
                            </p>
                        </div>
                        <button class="close-detail" onclick="closeRankingDetail(${rankIndex})">×</button>
                    </div>
                    
                    <div class="detail-stats">
                        <div class="detail-stat-item">
                            <span class="detail-stat-label">이번 주 커밋</span>
                            <span class="detail-stat-value">${data.currentWeekCommits}개</span>
                        </div>
                        <div class="detail-stat-item">
                            <span class="detail-stat-label">연속 성공</span>
                            <span class="detail-stat-value">${data.currentStreak}주</span>
                        </div>
                        <div class="detail-stat-item">
                            <span class="detail-stat-label">최장 연속</span>
                            <span class="detail-stat-value">${data.maxStreak || 0}주</span>
                        </div>
                        <div class="detail-stat-item">
                            <span class="detail-stat-label">성공률</span>
                            <span class="detail-stat-value">${data.successRate || 0}%</span>
                        </div>
                        <div class="detail-stat-item">
                            <span class="detail-stat-label">총 참여 주차</span>
                            <span class="detail-stat-value">${data.totalWeeks}주</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            detailElement.innerHTML = `<div class="error-message" style="padding: 20px; text-align: center; color: #f85149;">정보를 불러올 수 없습니다: ${error.message}</div>`;
        }
    } else {
        detailElement.style.display = 'none';
    }
}

// 랭킹 상세정보 닫기
function closeRankingDetail(rankIndex) {
    const detailElement = document.getElementById(`ranking-detail-${rankIndex}`);
    detailElement.style.display = 'none';
}

// 사용자 데이터 불러오기 (searchProfile에서 분리)
async function fetchUserData(username) {
    // 기본 사용자 정보 캐시 확인
    const userInfoCacheKey = `user_info_${username}`;
    let userData = getCachedData(userInfoCacheKey, 5 * 60 * 1000); // 5분
    
    if (!userData) {
        try {
            // GitHub 사용자 정보는 API를 사용해야 함 (raw로는 불가능)
            const userResponse = await fetch(`https://api.github.com/users/${username}`);
            if (userResponse.ok) {
                userData = await userResponse.json();
                // 사용자 정보 캐시에 저장
                setCachedData(userInfoCacheKey, userData);
            }
        } catch (userError) {
            console.log('사용자 정보 조회 실패:', userError);
        }
    } else {
        console.log('캐시에서 사용자 정보 로드:', username);
    }

    const defaultAvatarUrl = userData?.avatar_url || `https://github.com/${username}.png`;

    // record.json에서 전체 데이터 가져오기 (캐시 없이 직접 호출)
    let recordJsonResponse;
    try {
        const jsonResponse = await fetch(`https://raw.githubusercontent.com/${username}/weekly-commit-challenge/master/record.json`);
        if (jsonResponse.ok) {
            recordJsonResponse = await jsonResponse.json();
        }
    } catch (jsonError) {
        console.log('record.json 파일 읽기 실패:', jsonError.message);
    }
    
    if (recordJsonResponse) {
        console.log('record.json 응답 처리 시작');
        try {
            const recordData = recordJsonResponse; // raw 파일이므로 바로 사용
            console.log('record.json 파싱 성공:', recordData);
            
            // 전체 기록에서 통계 계산
            const records = recordData.records || [];
            const stats = calculateStatsFromRecords(records);
            const latestRecord = records[records.length - 1];
            
            const data = {
                username: username,
                avatarUrl: recordData.avatarUrl || defaultAvatarUrl,
                currentYear: latestRecord?.week?.match(/(\d{4})/)?.[1] || new Date().getFullYear(),
                currentWeek: latestRecord?.week?.match(/(\d+)주차/)?.[1] || 1,
                currentWeekCommits: latestRecord?.commits || 0,
                currentWeekSuccess: latestRecord?.success || false,
                currentStreak: stats.currentStreak,
                maxStreak: stats.maxStreak,
                successRate: stats.successRate,
                totalWeeks: stats.totalWeeks,
                recentRecords: records.slice(-5) // 최근 5개 기록
            };
            
            console.log('record.json에서 생성한 최종 데이터:', data);
            return data;
        } catch (parseError) {
            console.log('record.json 파싱 실패:', parseError.message);
        }
    } else {
        console.log('record.json 응답 없음');
    }

    // 통계 데이터에서 사용자 정보 확인 (raw 파일이므로 캐시 불필요)
    let statsData;
    try {
        const response = await fetch('https://raw.githubusercontent.com/tlqhrm/weekly-commit-challenge/master/statistics.json');
        if (response.ok) {
            statsData = await response.json();
        }
    } catch (err) {
        console.log('통계 데이터 조회 실패:', err);
    }
    
    if (statsData) {
        const userStats = statsData.participants?.find(p => p.username === username);
        if (userStats) {
            const now = new Date();
            const getWeekNumber = (date) => {
                const target = new Date(date.valueOf());
                const dayNr = (target.getDay() + 6) % 7;
                target.setDate(target.getDate() - dayNr + 3);
                const jan4 = new Date(target.getFullYear(), 0, 4);
                const dayDiff = (target - jan4) / 86400000;
                return Math.ceil(dayDiff / 7);
            };
            
            const data = {
                username: username,
                avatarUrl: userStats.avatarUrl || defaultAvatarUrl,
                currentYear: now.getFullYear(),
                currentWeek: getWeekNumber(now),
                currentWeekCommits: userStats.currentWeekSuccess ? 1 : 0,
                currentWeekSuccess: userStats.currentWeekSuccess,
                currentStreak: userStats.currentStreak,
                maxStreak: userStats.maxStreak,
                successRate: userStats.successRate,
                totalWeeks: userStats.totalWeeks,
                recentRecords: []
            };
            
            console.log('통계 데이터에서 생성한 최종 데이터:', data);
            return data;
        }
    }

    // record.md 파일 시도 (캐시 없이 직접 호출)
    let recordMdResponse;
    try {
        const response = await fetch(`https://raw.githubusercontent.com/${username}/weekly-commit-challenge/master/record.md`);
        if (response.ok) {
            recordMdResponse = await response.text();
        }
    } catch (mdError) {
        console.log('record.md 파일 없음:', mdError.message);
    }

    if (recordMdResponse) {
        try {
            const records = parseRecordMd(recordMdResponse); // raw 파일이므로 바로 사용
            const stats = calculateStats(records);

            const data = {
                username: username,
                avatarUrl: defaultAvatarUrl,
                ...stats
            };
            
            console.log('record.json에서 생성한 최종 데이터:', data);
            return data;
        } catch (parseError) {
            console.log('record.md 파싱 실패:', parseError.message);
        }
    }

    // 두 파일 모두 없는 경우 기본 데이터 반환
    console.log('모든 데이터 소스 실패, 기본 데이터 반환');
    const now = new Date();
    const getWeekNumber = (date) => {
        const target = new Date(date.valueOf());
        const dayNr = (target.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const jan4 = new Date(target.getFullYear(), 0, 4);
        const dayDiff = (target - jan4) / 86400000;
        return Math.ceil(dayDiff / 7);
    };

    const defaultData = {
        username: username,
        avatarUrl: defaultAvatarUrl,
        currentYear: now.getFullYear(),
        currentWeek: getWeekNumber(now),
        currentWeekCommits: 0,
        currentWeekSuccess: false,
        currentStreak: 0,
        maxStreak: 0,
        successRate: 0,
        totalWeeks: 0,
        recentRecords: []
    };
    
    console.log('기본 데이터 생성:', defaultData);
    return defaultData;
}

// 로컬스토리지 캐시 함수들
function getCachedData(key, maxAge) {
    try {
        const cached = localStorage.getItem(key);
        if (cached) {
            const data = JSON.parse(cached);
            const now = Date.now();
            const age = now - data.timestamp;
            console.log(`캐시 확인 [${key}]: 나이=${Math.round(age/1000)}초, 최대=${Math.round(maxAge/1000)}초`);
            if (age < maxAge) {
                console.log(`✅ 캐시 히트: ${key}`);
                return data.value;
            } else {
                console.log(`❌ 캐시 만료: ${key}`);
                localStorage.removeItem(key);
            }
        } else {
            console.log(`❌ 캐시 없음: ${key}`);
        }
    } catch (error) {
        console.log('캐시 읽기 실패:', error);
        localStorage.removeItem(key);
    }
    return null;
}

function setCachedData(key, value) {
    try {
        const data = {
            value: value,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`💾 캐시 저장: ${key}`);
    } catch (error) {
        console.log('캐시 저장 실패:', error);
    }
}

// record.json의 records 배열에서 통계 계산
function calculateStatsFromRecords(records) {
    if (!records || records.length === 0) {
        return {
            currentStreak: 0,
            maxStreak: 0,
            successRate: 0,
            totalWeeks: 0
        };
    }

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let successCount = 0;

    // 현재 연속 주차 계산 (최신부터 역순으로)
    for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].success) {
            currentStreak++;
        } else {
            break;
        }
    }

    // 최장 연속 주차 및 성공률 계산
    for (const record of records) {
        if (record.success) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
            successCount++;
        } else {
            tempStreak = 0;
        }
    }

    const successRate = records.length > 0 ? Math.round((successCount / records.length) * 100 * 10) / 10 : 0;

    return {
        currentStreak,
        maxStreak,
        successRate,
        totalWeeks: records.length
    };
}

// 캐시 상태 디버깅 함수
function debugCacheStatus() {
    console.log('=== 캐시 상태 확인 ===');
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('user_') || key.includes('stats_') || key.includes('fork_') || key.includes('record_')) {
            cacheKeys.push(key);
        }
    }
    
    cacheKeys.forEach(key => {
        const cached = localStorage.getItem(key);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                console.log(`${key}: ${Math.round(age/1000)}초 전 저장됨`);
            } catch (e) {
                console.log(`${key}: 파싱 오류`);
            }
        }
    });
    console.log('==================');
}

// 저장된 프로필 로드
function loadSavedProfile() {
    const savedUsername = localStorage.getItem('weekly-commit-username');
    if (savedUsername) {
        console.log('저장된 사용자명 발견:', savedUsername);
        debugCacheStatus(); // 캐시 상태 확인
        
        const profileInput = document.getElementById('profileInput');
        if (profileInput) {
            profileInput.value = savedUsername;
            // 자동으로 프로필 검색 실행
            searchProfile(savedUsername);
        }
    }
}

// 전역 함수로 캐시 상태 확인 가능하도록
window.debugCache = debugCacheStatus;

// 클립보드 복사 함수
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.select();
    element.setSelectionRange(0, 99999); // 모바일용
    
    try {
        document.execCommand('copy');
        
        // 복사 성공 피드백
        const button = element.parentElement.querySelector('button');
        const originalText = button.textContent;
        button.textContent = '복사됨!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#0366d6';
        }, 2000);
    } catch (err) {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다. 수동으로 선택해서 복사해주세요.');
    }
}

// 코드 탭 전환 함수
function switchCodeTab(tab) {
    const tabs = document.querySelectorAll('.code-tab');
    const blocks = document.querySelectorAll('.code-block');
    
    tabs.forEach(t => t.classList.remove('active'));
    blocks.forEach(b => b.classList.add('hidden'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-code`).classList.remove('hidden');
}

// 코드 복사 함수 (메인 페이지용)
function copyCode(blockId) {
    const block = document.getElementById(blockId);
    const code = block.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const button = block.querySelector('.copy-btn');
        const originalText = button.textContent;
        button.textContent = '복사됨!';
        button.style.background = 'rgba(40, 167, 69, 0.8)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'rgba(255,255,255,0.2)';
        }, 2000);
    }).catch(() => {
        alert('복사에 실패했습니다.');
    });
}

// 전역 함수로 등록
window.copyToClipboard = copyToClipboard;
window.switchCodeTab = switchCodeTab;
window.copyCode = copyCode;