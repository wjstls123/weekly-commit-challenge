// GitHub README Stats 스타일의 카드 생성기

class WeeklyCommitCard {
    constructor() {
        this.themes = {
            default: {
                bg: '#fffefe',
                border: '#e4e2e2',
                title: '#2f80ed',
                text: '#434d58',
                icon: '#4c71f2',
                ring: '#2f80ed'
            },
            dark: {
                bg: '#151515',
                border: '#30363d',
                title: '#58a6ff',
                text: '#c9d1d9',
                icon: '#79c0ff',
                ring: '#58a6ff'
            },
            radical: {
                bg: '#141321',
                border: '#1f2328',
                title: '#fe428e',
                text: '#a9fef7',
                icon: '#f8d847',
                ring: '#fe428e'
            },
            merko: {
                bg: '#0a0f0d',
                border: '#216e39',
                title: '#abd200',
                text: '#68b684',
                icon: '#b7d364',
                ring: '#abd200'
            },
            gruvbox: {
                bg: '#282828',
                border: '#3c3836',
                title: '#fabd2f',
                text: '#ebdbb2',
                icon: '#8ec07c',
                ring: '#fabd2f'
            },
            tokyonight: {
                bg: '#1a1b27',
                border: '#414868',
                title: '#70a5fd',
                text: '#c0caf5',
                icon: '#bb9af7',
                ring: '#70a5fd'
            }
        };
    }

    generateCard(data, options = {}) {
        const {
            theme = 'default',
            width = 400,
            height = 200,
            borderRadius = 4.5,
            hideTitle = false,
            customTitle = null,
            showIcons = true,
            locale = 'ko'
        } = options;

        const colors = this.themes[theme] || this.themes.default;
        const { period, year, weekNumber, commitCount, success, status, lastUpdated } = data;

        // 성공 상태에 따른 색상
        const statusColor = success ? '#28a745' : '#ffa500';
        const ringColor = success ? '#28a745' : colors.ring;

        // 텍스트 처리
        const title = customTitle || '📊 Weekly Commit Challenge';
        const successText = success ? '성공' : '진행중';
        const periodText = period || `${year}년 ${weekNumber}주차`;

        const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 배경 -->
            <rect x="0.5" y="0.5" rx="${borderRadius}" height="99%" stroke="${colors.border}" width="99%" fill="${colors.bg}" stroke-opacity="1"/>
            
            <!-- 제목 -->
            ${!hideTitle ? `
            <g transform="translate(25, 35)">
                <text x="0" y="0" class="header" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" font-weight="600" font-size="16px">
                    ${title}
                </text>
            </g>
            ` : ''}
            
            <!-- 메인 컨텐츠 영역 -->
            <g transform="translate(25, ${hideTitle ? 25 : 65})">
                <!-- 주차 정보 -->
                <g transform="translate(0, 0)">
                    ${showIcons ? `
                    <circle cx="8" cy="8" r="6" fill="${ringColor}" opacity="0.2"/>
                    <circle cx="8" cy="8" r="3" fill="${ringColor}"/>
                    ` : ''}
                    <text x="${showIcons ? 25 : 0}" y="5" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14px" font-weight="600">
                        ${periodText}
                    </text>
                    <text x="${showIcons ? 25 : 0}" y="20" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px" opacity="0.7">
                        ${year}년 ${weekNumber}주차
                    </text>
                </g>
                
                <!-- 통계 정보 -->
                <g transform="translate(0, 45)">
                    <!-- 커밋 수 -->
                    <g transform="translate(0, 0)">
                        ${showIcons ? `
                        <rect x="0" y="0" width="16" height="16" rx="2" fill="${colors.icon}" opacity="0.1"/>
                        <text x="8" y="12" fill="${colors.icon}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="10px" text-anchor="middle" font-weight="600">📝</text>
                        ` : ''}
                        <text x="${showIcons ? 25 : 0}" y="12" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14px">
                            커밋 수: 
                            <tspan fill="${colors.title}" font-weight="600">${commitCount}개</tspan>
                        </text>
                    </g>
                    
                    <!-- 성공 상태 -->
                    <g transform="translate(0, 25)">
                        ${showIcons ? `
                        <rect x="0" y="0" width="16" height="16" rx="2" fill="${statusColor}" opacity="0.1"/>
                        <text x="8" y="12" fill="${statusColor}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="10px" text-anchor="middle" font-weight="600">${success ? '✅' : '🔄'}</text>
                        ` : ''}
                        <text x="${showIcons ? 25 : 0}" y="12" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14px">
                            상태: 
                            <tspan fill="${statusColor}" font-weight="600">${successText}</tspan>
                        </text>
                    </g>
                </g>
                
                <!-- 업데이트 시간 -->
                <g transform="translate(0, 105)">
                    <text x="0" y="0" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="10px" opacity="0.5">
                        마지막 업데이트: ${new Date(lastUpdated).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </text>
                </g>
            </g>
            
            <!-- 우측 장식 -->
            <g transform="translate(${width - 60}, 30)">
                <circle cx="20" cy="20" r="15" fill="${ringColor}" opacity="0.1"/>
                <text x="20" y="27" fill="${ringColor}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="20px" text-anchor="middle" font-weight="600">
                    ${weekNumber}
                </text>
                <text x="20" y="40" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="8px" text-anchor="middle" opacity="0.7">
                    주차
                </text>
            </g>
        </svg>`;

        return svg;
    }

    generateCompactCard(data, options = {}) {
        const {
            theme = 'default',
            width = 300,
            height = 120,
            borderRadius = 4.5
        } = options;

        const colors = this.themes[theme] || this.themes.default;
        const { period, year, weekNumber, commitCount, success } = data;
        const statusColor = success ? '#28a745' : '#ffa500';
        const successText = success ? '성공' : '진행중';

        const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" rx="${borderRadius}" height="99%" stroke="${colors.border}" width="99%" fill="${colors.bg}" stroke-opacity="1"/>
            
            <!-- 왼쪽: 주차 번호 -->
            <g transform="translate(25, 30)">
                <circle cx="25" cy="25" r="20" fill="${statusColor}" opacity="0.1"/>
                <text x="25" y="32" fill="${statusColor}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="18px" text-anchor="middle" font-weight="700">
                    ${weekNumber}
                </text>
                <text x="25" y="45" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="8px" text-anchor="middle" opacity="0.7">
                    주차
                </text>
            </g>
            
            <!-- 오른쪽: 정보 -->
            <g transform="translate(80, 25)">
                <text x="0" y="15" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14px" font-weight="600">
                    Weekly Commit
                </text>
                <text x="0" y="35" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px">
                    ${commitCount}개 커밋 · 
                    <tspan fill="${statusColor}" font-weight="600">${successText}</tspan>
                </text>
                <text x="0" y="50" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="10px" opacity="0.6">
                    ${period}
                </text>
            </g>
        </svg>`;

        return svg;
    }

    generateStatsCard(data, options = {}) {
        const {
            theme = 'default',
            width = 450,
            height = 200,
            borderRadius = 4.5,
            showRank = false
        } = options;

        const colors = this.themes[theme] || this.themes.default;
        const { 
            period, year, weekNumber, commitCount, success, 
            totalWeeks = 0, successWeeks = 0, longestStreak = 0 
        } = data;

        const successRate = totalWeeks > 0 ? ((successWeeks / totalWeeks) * 100).toFixed(1) : 0;
        const statusColor = success ? '#28a745' : '#ffa500';

        const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" rx="${borderRadius}" height="99%" stroke="${colors.border}" width="99%" fill="${colors.bg}" stroke-opacity="1"/>
            
            <!-- 제목 -->
            <g transform="translate(25, 35)">
                <text x="0" y="0" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="18px" font-weight="600">
                    Weekly Commit Stats
                </text>
            </g>
            
            <!-- 통계 항목들 -->
            <g transform="translate(25, 70)">
                <!-- 첫 번째 행 -->
                <g transform="translate(0, 0)">
                    <!-- 이번 주 커밋 -->
                    <g transform="translate(0, 0)">
                        <circle cx="8" cy="8" r="4" fill="${statusColor}"/>
                        <text x="20" y="6" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px">
                            이번 주 커밋
                        </text>
                        <text x="20" y="18" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="16px" font-weight="700">
                            ${commitCount}
                        </text>
                    </g>
                    
                    <!-- 총 주차 -->
                    <g transform="translate(150, 0)">
                        <circle cx="8" cy="8" r="4" fill="${colors.icon}"/>
                        <text x="20" y="6" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px">
                            총 참여 주차
                        </text>
                        <text x="20" y="18" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="16px" font-weight="700">
                            ${totalWeeks}
                        </text>
                    </g>
                </g>
                
                <!-- 두 번째 행 -->
                <g transform="translate(0, 45)">
                    <!-- 성공률 -->
                    <g transform="translate(0, 0)">
                        <circle cx="8" cy="8" r="4" fill="#28a745"/>
                        <text x="20" y="6" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px">
                            성공률
                        </text>
                        <text x="20" y="18" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="16px" font-weight="700">
                            ${successRate}%
                        </text>
                    </g>
                    
                    <!-- 최장 연속 -->
                    <g transform="translate(150, 0)">
                        <circle cx="8" cy="8" r="4" fill="#ffa500"/>
                        <text x="20" y="6" fill="${colors.text}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px">
                            최장 연속
                        </text>
                        <text x="20" y="18" fill="${colors.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="16px" font-weight="700">
                            ${longestStreak}주
                        </text>
                    </g>
                </g>
            </g>
            
            <!-- 우측 현재 상태 -->
            <g transform="translate(320, 70)">
                <rect x="0" y="0" width="100" height="60" rx="8" fill="${statusColor}" opacity="0.1" stroke="${statusColor}" stroke-opacity="0.3"/>
                <text x="50" y="20" fill="${statusColor}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12px" text-anchor="middle" font-weight="600">
                    ${year}년 ${weekNumber}주차
                </text>
                <text x="50" y="40" fill="${statusColor}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14px" text-anchor="middle" font-weight="700">
                    ${success ? '✅ 성공' : '🔄 진행중'}
                </text>
            </g>
        </svg>`;

        return svg;
    }
}

// 사용 예시
if (typeof window !== 'undefined') {
    window.WeeklyCommitCard = WeeklyCommitCard;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeeklyCommitCard;
}