// GitHub Pages에서 record.md를 읽어서 API 파일들을 생성하는 스크립트

class WeeklyCommitAPI {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.generateAPI();
        this.startAutoUpdate();
    }

    // record.md에서 JSON 데이터 추출
    async loadData() {
        try {
            const response = await fetch('./record.md');
            const text = await response.text();
            
            // JSON 블록 추출
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                this.data = JSON.parse(jsonMatch[1]);
                console.log('데이터 로드 성공:', this.data);
            } else {
                throw new Error('JSON 데이터를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            // 기본 데이터로 대체
            this.data = {
                period: "로딩중...",
                year: new Date().getFullYear(),
                weekNumber: 1,
                commitCount: 0,
                success: false,
                status: "🔄 로딩중",
                lastUpdated: new Date().toISOString()
            };
        }
    }

    // API 파일들 생성
    generateAPI() {
        this.generateJSONAPI();
        this.generateBadgeAPI();
        this.generateWidgetAPI();
    }

    // 1. JSON API 생성
    generateJSONAPI() {
        const apiData = {
            ...this.data,
            apiVersion: "1.0",
            generatedAt: new Date().toISOString(),
            endpoints: {
                badge: "./badge.svg",
                widget: "./widget.html",
                data: "./data.json"
            }
        };

        // JSON을 DOM에 저장 (다운로드 링크로 제공)
        this.createDownloadLink('data.json', JSON.stringify(apiData, null, 2), 'application/json');
    }

    // 2. 배지 SVG 생성
    generateBadgeAPI() {
        const { weekNumber, success, commitCount } = this.data;
        const status = success ? '성공' : '진행중';
        const color = success ? '#4c1' : '#fe7d37';
        
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20">
    <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
        <rect width="200" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
        <path fill="#555" d="M0 0h100v20H0z"/>
        <path fill="${color}" d="M100 0h100v20H100z"/>
        <path fill="url(#b)" d="M0 0h200v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="50" y="15" fill="#010101" fill-opacity=".3">${weekNumber}주차</text>
        <text x="50" y="14">${weekNumber}주차</text>
        <text x="150" y="15" fill="#010101" fill-opacity=".3">${status}</text>
        <text x="150" y="14">${status}</text>
    </g>
</svg>`;

        this.createDownloadLink('badge.svg', svg, 'image/svg+xml');
        
        // 카드 스타일도 생성
        this.generateCardAPI();
    }

    // 카드 스타일 API 생성
    generateCardAPI() {
        const cardGenerator = new WeeklyCommitCard();
        
        // 기본 카드
        const defaultCard = cardGenerator.generateCard(this.data);
        this.createDownloadLink('card.svg', defaultCard, 'image/svg+xml');
        
        // 컴팩트 카드
        const compactCard = cardGenerator.generateCompactCard(this.data);
        this.createDownloadLink('card-compact.svg', compactCard, 'image/svg+xml');
        
        // 다크 테마 카드
        const darkCard = cardGenerator.generateCard(this.data, { theme: 'dark' });
        this.createDownloadLink('card-dark.svg', darkCard, 'image/svg+xml');
        
        // 통계 카드 (가상 데이터 포함)
        const statsData = {
            ...this.data,
            totalWeeks: 15,
            successWeeks: 12,
            longestStreak: 8
        };
        const statsCard = cardGenerator.generateStatsCard(statsData);
        this.createDownloadLink('card-stats.svg', statsCard, 'image/svg+xml');
    }

    // 3. 위젯 HTML 생성
    generateWidgetAPI() {
        const { period, weekNumber, commitCount, success, status, lastUpdated } = this.data;
        
        const widget = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Commit Widget</title>
    <style>
        .weekly-commit-widget {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            margin: 10px;
            text-align: center;
        }
        .widget-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .widget-period {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .widget-stats {
            display: flex;
            justify-content: space-around;
            margin: 15px 0;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            display: block;
        }
        .stat-label {
            font-size: 12px;
            opacity: 0.8;
        }
        .widget-status {
            font-size: 16px;
            margin-top: 15px;
            padding: 8px;
            background: rgba(255,255,255,0.2);
            border-radius: 6px;
        }
        .widget-updated {
            font-size: 11px;
            opacity: 0.7;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="weekly-commit-widget">
        <div class="widget-title">📊 Weekly Commit Challenge</div>
        <div class="widget-period">${period}</div>
        <div class="widget-stats">
            <div class="stat-item">
                <span class="stat-number">${weekNumber}</span>
                <span class="stat-label">주차</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${commitCount}</span>
                <span class="stat-label">커밋</span>
            </div>
        </div>
        <div class="widget-status">${status}</div>
        <div class="widget-updated">업데이트: ${new Date(lastUpdated).toLocaleString('ko-KR')}</div>
    </div>
    
    <script>
        // 자동 새로고침 (5분마다)
        setInterval(() => {
            window.location.reload();
        }, 5 * 60 * 1000);
    </script>
</body>
</html>`;

        this.createDownloadLink('widget.html', widget, 'text/html');
    }

    // 다운로드 링크 생성 (GitHub Pages에서는 실제 파일로 저장)
    createDownloadLink(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // 기존 링크 제거
        const existingLink = document.getElementById(`download-${filename}`);
        if (existingLink) {
            existingLink.remove();
        }
        
        // 새 다운로드 링크 생성
        const link = document.createElement('a');
        link.id = `download-${filename}`;
        link.href = url;
        link.download = filename;
        link.textContent = `📥 ${filename} 다운로드`;
        link.style.cssText = `
            display: inline-block;
            margin: 5px;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
        `;
        
        // API 컨테이너에 추가
        let container = document.getElementById('api-downloads');
        if (!container) {
            container = document.createElement('div');
            container.id = 'api-downloads';
            container.innerHTML = '<h3>🔗 생성된 API 파일들:</h3>';
            document.body.appendChild(container);
        }
        
        container.appendChild(link);
    }

    // 자동 업데이트 (1분마다 체크)
    startAutoUpdate() {
        setInterval(async () => {
            const oldData = JSON.stringify(this.data);
            await this.loadData();
            const newData = JSON.stringify(this.data);
            
            if (oldData !== newData) {
                console.log('데이터 변경 감지, API 재생성');
                this.generateAPI();
            }
        }, 60000); // 1분마다
    }
}

// 페이지 로드 시 API 생성기 시작
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        new WeeklyCommitAPI();
    });
}

// Node.js 환경에서도 사용 가능
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeeklyCommitAPI;
}