// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentChallenge();
    loadForkStatistics();
    initProfileSearch();
    initSampleTabs();
    setupRankingFilters();
});

// 즉시 실행으로 더 빠르게 표시
updateCurrentChallenge();
loadForkStatistics();

// 현재 챌린지 정보 업데이트 (한국 시간 기준)
function updateCurrentChallenge() {
    // 한국 시간 기준으로 현재 시간 계산
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
    const kstNow = new Date(now.getTime() + kstOffset);
    const year = kstNow.getFullYear();
    
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
    
    const weekNumber = getWeekNumber(kstNow);
    const weekDates = getWeekDates(kstNow);
    
    // 날짜 포맷팅
    const formatDate = (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    const weekPeriod = `${formatDate(weekDates.start)} ~ ${formatDate(weekDates.end)}`;
    
    // 현재 요일 확인 (0: 일요일, 1: 월요일, ...) - 한국 시간 기준
    const dayOfWeek = kstNow.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    
    // 달력 아이콘 고정
    const badgeIcon = document.querySelector('.badge-icon');
    if (badgeIcon) {
        badgeIcon.textContent = '📅';
    }
    
    console.log(`현재 날짜 (KST): ${kstNow.toLocaleDateString('ko-KR')} ${kstNow.toLocaleTimeString('ko-KR')}`)
    console.log(`계산된 주차: ${year}년 ${weekNumber}주차 (${weekPeriod})`)
    console.log(`현재 요일: ${dayOfWeek} (0=일요일, KST 기준)`);
    
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
    const profileResult = document.getElementById('profileResult');
    profileResult.style.display = 'block';
    
    profileResult.innerHTML = `
        <div class="profile-header">
            <img class="profile-avatar" src="${data.avatarUrl}" alt="프로필 이미지">
            <div class="profile-info">
                <h3>${data.username}</h3>
                <p class="profile-status ${data.currentWeekSuccess ? 'success' : 'progress'}">
                    ${data.currentWeekSuccess ? '✅ 이번 주 성공' : `🔄 진행중 (${data.currentWeekCommits}개)`}
                </p>
            </div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-item">
                <span class="stat-label">현재 주차</span>
                <span class="stat-value">${data.currentYear}년 ${data.currentWeek}주차</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">이번 주 커밋</span>
                <span class="stat-value">${data.currentWeekCommits}개</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">연속 성공</span>
                <span class="stat-value">${data.currentStreak}주</span>
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
    return records.reverse(); // 최신순으로 정렬
}

// 통계 계산
function calculateStats(records) {
    // 한국 시간 기준으로 현재 시간 계산
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    
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
            currentYear: kstNow.getFullYear(),
            currentWeek: getWeekNumber(kstNow),
            currentWeekCommits: 0,
            currentWeekSuccess: false,
            currentStreak: 0,
            totalWeeks: 0,
            recentRecords: []
        };
    }
    
    const currentYear = kstNow.getFullYear();
    const currentWeek = getWeekNumber(kstNow);
    
    // 현재 주차 데이터 찾기 (최신 기록을 현재 주차로 가정)
    const currentWeekData = records[0];
    
    // 연속 성공 주차 계산 (진행중은 제외)
    let currentStreak = 0;
    for (const record of records) {
        // record에는 이미 파싱된 데이터가 들어있음 (period, week, commits, success)
        // success는 이미 ✅나 성공 여부로 계산됨
        if (record.success) {
            currentStreak++;
        } else {
            // 실패 기록이면 연속 중단
            break;
        }
    }
    
    return {
        currentYear,
        currentWeek,
        currentWeekCommits: currentWeekData?.commits || 0,
        currentWeekSuccess: currentWeekData?.success || false,
        currentStreak,
        totalWeeks: records.length,
        recentRecords: records.slice(0, 10)
    };
}

// 프로필 검색 (GitHub API 기반)
async function searchProfile(username) {
    try {
        // 로딩 상태 표시
        showErrorMessage('기록을 불러오는 중...');
        
        console.log(`사용자 검색: ${username}`);
        
        // 먼저 record.json 파일 시도
        let data = null;
        try {
            console.log('record.json 파일 조회 시도');
            const jsonResponse = await fetch(`https://api.github.com/repos/${username}/weekly-commit-challenge/contents/record.json`);
            
            if (jsonResponse.ok) {
                const jsonData = await jsonResponse.json();
                const jsonContent = atob(jsonData.content);
                const recordData = JSON.parse(jsonContent);
                console.log('record.json 데이터:', recordData);
                
                // 아바타 URL 가져오기
                const userResponse = await fetch(`https://api.github.com/users/${username}`);
                const userData = await userResponse.json();
                
                data = {
                    username: username,
                    avatarUrl: userData.avatar_url || recordData.avatarUrl || `https://github.com/${username}.png`,
                    currentYear: recordData.year,
                    currentWeek: recordData.weekNumber,
                    currentWeekCommits: recordData.commitCount,
                    currentWeekSuccess: recordData.success,
                    currentStreak: 1, // JSON에는 개별 기록만 있으므로 기본값
                    totalWeeks: 1,
                    recentRecords: [{
                        period: recordData.period,
                        week: `${recordData.year}년 ${recordData.weekNumber}주차`,
                        commits: recordData.commitCount,
                        success: recordData.success
                    }]
                };
                console.log('record.json 기반 데이터 생성 완료');
            }
        } catch (jsonError) {
            console.log('record.json 파일 없음 또는 오류:', jsonError.message);
        }
        
        // record.json이 없으면 record.md 파일 사용
        if (!data) {
            console.log('record.md 파일로 fallback');
            const response = await fetch(`https://api.github.com/repos/${username}/weekly-commit-challenge/contents/record.md`);
            
            if (!response.ok) {
                console.log(`API 응답 실패: ${response.status}`);
                if (response.status === 404) {
                    throw new Error('해당 사용자의 weekly-commit-challenge 레포지토리나 record 파일을 찾을 수 없습니다. 아직 참여하지 않았거나 사용자명이 잘못되었을 수 있습니다.');
                } else {
                    throw new Error(`GitHub API 요청 실패 (${response.status}): ${response.statusText}`);
                }
            }
            
            const repoData = await response.json();
            console.log('record.md 데이터 조회 성공');
            
            // Base64 디코딩
            const content = atob(repoData.content);
            console.log('record.md 내용:', content.substring(0, 200) + '...');
            
            // record.md 파싱
            const records = parseRecordMd(content);
            console.log('파싱된 기록:', records);
            
            const stats = calculateStats(records);
            console.log('계산된 통계:', stats);
            
            // 아바타 URL 가져오기 (GitHub API)
            const userResponse = await fetch(`https://api.github.com/users/${username}`);
            const userData = await userResponse.json();
            
            data = {
                username: username,
                avatarUrl: userData.avatar_url || `https://github.com/${username}.png`,
                ...stats
            };
        }
        
        console.log('최종 데이터:', data);
        
        // 성공 시 프로필 UI 표시
        showProfileUI(data);
        
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
        
        // Issue에서 통계 데이터 조회
        try {
            const response = await fetch('https://api.github.com/repos/tlqhrm/weekly-commit-challenge/issues?labels=statistics&state=open');
            if (response.ok) {
                const issues = await response.json();
                
                if (issues.length > 0) {
                    const issue = issues[0];
                    console.log('Issue 발견:', issue.title);
                    
                    // Issue body에서 JSON 데이터 추출 (이스케이프된 개행문자 고려)
                    const jsonMatch = issue.body.match(/```json\\n([\s\S]*?)\\n```/) || issue.body.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch) {
                        console.log('JSON 데이터 추출 성공');
                        const stats = JSON.parse(jsonMatch[1]);
                        console.log('Issue에서 통계 데이터 로드 성공:', stats);
                        displayCachedStatistics(stats);
                        return;
                    } else {
                        console.log('Issue body에서 JSON 데이터를 찾을 수 없음');
                        console.log('Issue body:', issue.body);
                    }
                } else {
                    console.log('statistics 라벨이 있는 Issue가 없음');
                }
            }
        } catch (err) {
            console.error('Issue 데이터 로드 실패:', err);
        }
        
        // Issue 데이터가 없는 경우 기본값 설정
        document.getElementById('totalParticipants').textContent = '0';
        document.getElementById('weeklySuccessful').textContent = '0';
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
    document.getElementById('totalParticipants').textContent = stats.totalParticipants || 0;
    document.getElementById('weeklySuccessful').textContent = stats.weeklySuccessful || 0;
    document.getElementById('averageSuccessRate').textContent = (stats.averageSuccessRate || 0) + '%';
    document.getElementById('averageStreak').textContent = (stats.averageStreak || 0) + '주';
    
    // 랭킹 데이터도 사용
    console.log('랭킹 데이터 확인:', {
        participants: stats.participants ? stats.participants.length : 'none',
        rankingByStreak: stats.rankingByStreak ? stats.rankingByStreak.length : 'none',
        rankingBySuccessRate: stats.rankingBySuccessRate ? stats.rankingBySuccessRate.length : 'none'
    });
    
    if (stats.participants && stats.participants.length > 0) {
        console.log('기존 participants 데이터 사용');
        globalRankingData = stats.participants;
        displayRanking('streak');
    } else if (stats.rankingByStreak && stats.rankingBySuccessRate) {
        console.log('새로운 랭킹 데이터 구조 사용');
        globalRankingData = {
            streak: stats.rankingByStreak,
            successRate: stats.rankingBySuccessRate
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


// 랭킹 표시
function displayRanking(filter) {
    const rankingList = document.getElementById('rankingList');
    
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
    
    // 랭킹 HTML 생성
    if (sortedData.length === 0) {
        rankingList.innerHTML = '<div class="loading">아직 참여자가 없습니다.</div>';
        return;
    }
    
    rankingList.innerHTML = sortedData.map((user, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const badgeClass = user.currentWeekSuccess ? 'success' : 'progress';
        const badgeText = user.currentWeekSuccess ? '성공' : '진행중';
        
        let mainStat = '';
        switch (filter) {
            case 'streak':
                mainStat = `${user.currentStreak}주 연속`;
                break;
            case 'success-rate':
                mainStat = `${user.successRate}% 성공률`;
                break;
        }
        
        return `
            <div class="ranking-item">
                <div class="rank-number ${rankClass}">${index + 1}</div>
                <div class="user-info">
                    <img src="${user.avatarUrl}" alt="${user.username}" class="user-avatar">
                    <a href="https://github.com/${user.username}" target="_blank" class="user-name">${user.username}</a>
                </div>
                <div class="user-stats">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                    <span class="main-stat">${mainStat}</span>
                    <span class="sub-stat">${filter === 'streak' ? `성공률 ${user.successRate}%` : `연속 ${user.currentStreak}주`}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 캐시된 랭킹 표시 (새로운 데이터 구조용)
function displayCachedRanking(filter) {
    const rankingList = document.getElementById('rankingList');
    
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
    }
    
    // 랭킹 HTML 생성
    if (sortedData.length === 0) {
        rankingList.innerHTML = '<div class="loading">아직 참여자가 없습니다.</div>';
        return;
    }
    
    rankingList.innerHTML = sortedData.map((user, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const badgeClass = user.currentWeekSuccess ? 'success' : 'progress';
        const badgeText = user.currentWeekSuccess ? '성공' : '진행중';
        
        let mainStat = '';
        switch (filter) {
            case 'streak':
                mainStat = `${user.currentStreak}주 연속`;
                break;
            case 'success-rate':
                mainStat = `${user.successRate}% 성공률`;
                break;
        }
        
        return `
            <div class="ranking-item">
                <div class="rank-number ${rankClass}">${index + 1}</div>
                <div class="user-info">
                    <img src="${user.avatarUrl}" alt="${user.username}" class="user-avatar">
                    <a href="https://github.com/${user.username}" target="_blank" class="user-name">${user.username}</a>
                </div>
                <div class="user-stats">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                    <span class="main-stat">${mainStat}</span>
                    <span class="sub-stat">${filter === 'streak' ? `성공률 ${user.successRate}%` : `연속 ${user.currentStreak}주`}</span>
                </div>
            </div>
        `;
    }).join('');
}