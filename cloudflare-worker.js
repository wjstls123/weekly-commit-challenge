// Cloudflare Workers 코드
// workers.dev에서 새 Worker 생성 후 이 코드 붙여넣기

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    
    if (!username) {
      return new Response('Username parameter required', { status: 400 });
    }
    
    try {
      // GitHub에서 record.json 가져오기
      const recordResponse = await fetch(`https://raw.githubusercontent.com/${username}/weekly-commit-challenge/master/record.json`);
      
      if (!recordResponse.ok) {
        throw new Error('Record not found');
      }
      
      const data = await recordResponse.json();
      
      let currentStreak = 0;
      let maxStreak = 0;
      let successRate = 0;
      let currentWeekCommits = 0;
      
      if (data.records && data.records.length > 0) {
        const records = data.records;
        let tempStreak = 0;
        let successWeeks = 0;
        
        // 최신 기록에서 이번 주 커밋 수 가져오기
        const latestRecord = records[records.length - 1];
        currentWeekCommits = latestRecord.commits || 0;
        
        // 최신부터 역순으로 현재 연속 계산
        for (let i = records.length - 1; i >= 0; i--) {
          if (records[i].success) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        // 최장 연속 계산
        for (const record of records) {
          if (record.success) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
            successWeeks++;
          } else {
            tempStreak = 0;
          }
        }
        
        const totalWeeks = records.length;
        successRate = Math.round((successWeeks / totalWeeks) * 100);
      }
      
      // 색상 계산
      const getStreakColor = (streak) => {
        if (streak >= 20) return '#22c55e';
        if (streak >= 10) return '#3b82f6';
        if (streak >= 5) return '#8b5cf6';
        return '#64748b';
      };
      
      const getSuccessRateColor = (rate) => {
        if (rate >= 90) return '#22c55e';
        if (rate >= 70) return '#3b82f6';
        if (rate >= 50) return '#f59e0b';
        return '#ef4444';
      };
      
      const getCommitColor = (commits) => {
        if (commits >= 10) return '#22c55e';
        if (commits >= 5) return '#3b82f6';
        if (commits >= 1) return '#f59e0b';
        return '#64748b';
      };
      
      const streakColor = getStreakColor(currentStreak);
      const rateColor = getSuccessRateColor(successRate);
      const commitColor = getCommitColor(currentWeekCommits);
      
      // SVG 생성 (높이를 140으로 증가)
      const svg = `<svg width="400" height="140" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <style>
      .title { font: 600 18px 'Segoe UI', Ubuntu, sans-serif; fill: #f1f5f9; }
      .subtitle { font: 400 12px 'Segoe UI', Ubuntu, sans-serif; fill: #94a3b8; }
      .label { font: 400 11px 'Segoe UI', Ubuntu, sans-serif; fill: #94a3b8; }
      .value { font: 600 16px 'Segoe UI', Ubuntu, sans-serif; }
      .small-value { font: 500 13px 'Segoe UI', Ubuntu, sans-serif; }
    </style>
  </defs>
  
  <a xlink:href="https://tlqhrm.github.io/weekly-commit-challenge/" target="_blank">
    <rect width="400" height="140" rx="6" fill="url(#grad)"/>
    <rect x="1" y="1" width="398" height="138" rx="5" fill="none" stroke="#334155" stroke-width="1"/>
    
    <g transform="translate(25, 30)">
      <text class="title" y="0">Weekly Commit Challenge</text>
      <text class="subtitle" y="20">${username}</text>
    </g>
    
    <g transform="translate(25, 75)">
      <g transform="translate(0, 0)">
        <text class="label" y="0">Current Streak</text>
        <text class="value" y="20" fill="${streakColor}">${currentStreak} weeks</text>
      </g>
      
      <g transform="translate(120, 0)">
        <text class="label" y="0">Success Rate</text>
        <text class="value" y="20" fill="${rateColor}">${successRate}%</text>
      </g>
      
      <g transform="translate(220, 0)">
        <text class="label" y="0">This Week</text>
        <text class="small-value" y="20" fill="${commitColor}">${currentWeekCommits} commits</text>
      </g>
      
      <g transform="translate(310, 0)">
        <text class="label" y="0">Max Streak</text>
        <text class="small-value" y="20" fill="#8b5cf6">${maxStreak}</text>
      </g>
    </g>
    
    <g transform="translate(25, 125)">
      <rect width="350" height="4" rx="2" fill="#1e293b"/>
      <rect width="${Math.min(350 * successRate / 100, 350)}" height="4" rx="2" fill="${rateColor}"/>
    </g>
  </a>
</svg>`;
      
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300', // 5분 캐시
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      // 에러 시 기본 SVG
      const errorSvg = `<svg width="400" height="140" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="140" rx="6" fill="#1e293b"/>
  <text x="200" y="70" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="14">
    Failed to load data for ${username}
  </text>
</svg>`;
      
      return new Response(errorSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60'
        }
      });
    }
  }
};