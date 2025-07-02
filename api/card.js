export default async function handler(req, res) {
  const { username, theme = 'default' } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Try to get user data from cache first
    let userData = null;
    
    // For serverless functions, we can't use localStorage but can implement in-memory cache
    // For now, we'll rely on HTTP cache headers
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Cache-Control': 'max-age=300' // 5분 캐시 요청
      }
    });
    
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    const defaultAvatarUrl = userData?.avatar_url || `https://github.com/${username}.png`;

    // Try to get stats from central statistics first (most efficient)
    let stats = {
      currentStreak: 0,
      maxStreak: 0,
      totalWeeks: 0,
      successRate: 0,
      currentWeekSuccess: false
    };

    try {
      const statsResponse = await fetch('https://api.github.com/repos/tlqhrm/weekly-commit-challenge/issues?labels=statistics&state=open');
      if (statsResponse.ok) {
        const issues = await statsResponse.json();
        if (issues.length > 0) {
          const issue = issues[0];
          const jsonMatch = issue.body.match(/```json\\n([\s\S]*?)\\n```/) || issue.body.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const statisticsData = JSON.parse(jsonMatch[1]);
            const userStats = statisticsData.participants?.find(p => p.username === username);
            if (userStats) {
              stats = {
                currentStreak: userStats.currentStreak,
                maxStreak: userStats.maxStreak,
                totalWeeks: userStats.totalWeeks,
                successRate: userStats.successRate,
                currentWeekSuccess: userStats.currentWeekSuccess
              };
            }
          }
        }
      }
    } catch (statsError) {
      // Fallback to record.md only if central stats fail
      try {
        const mdResponse = await fetch(`https://api.github.com/repos/${username}/weekly-commit-challenge/contents/record.md`);
        if (mdResponse.ok) {
          const mdData = await mdResponse.json();
          const content = Buffer.from(mdData.content, 'base64').toString();
          
          // Parse record.md
          const lines = content.split('\n');
          let currentStreak = 0;
          let totalWeeks = 0;
          let successWeeks = 0;
          let currentWeekSuccess = false;
          
          const records = [];
          for (const line of lines) {
            if (line.includes('|') && !line.includes('---') && !line.includes('기간')) {
              totalWeeks++;
              const isSuccess = line.includes('✅') && !line.includes('🔄');
              records.push({ success: isSuccess });
              
              if (isSuccess) {
                successWeeks++;
                if (totalWeeks === 1) currentWeekSuccess = true;
              }
            }
          }
          
          // Calculate current streak (from latest)
          for (let i = 0; i < records.length; i++) {
            if (records[i].success) {
              if (i === 0) currentStreak++;
              else if (currentStreak === i) currentStreak++;
              else break;
            } else {
              break;
            }
          }
          
          // Calculate max streak
          let maxStreak = 0;
          let tempStreak = 0;
          for (const record of records) {
            if (record.success) {
              tempStreak++;
              maxStreak = Math.max(maxStreak, tempStreak);
            } else {
              tempStreak = 0;
            }
          }
          
          const successRate = totalWeeks > 0 ? Math.round((successWeeks / totalWeeks) * 100 * 10) / 10 : 0;
          
          stats = {
            currentStreak,
            maxStreak,
            totalWeeks,
            successRate,
            currentWeekSuccess
          };
        }
      } catch (mdError) {
        // Use default stats if both fail
      }
    }

    // Generate SVG card
    const svg = generateSVGCard(username, stats, theme, defaultAvatarUrl);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // Cache for 5 minutes
    res.setHeader('ETag', `"${Buffer.from(username + theme + JSON.stringify(stats)).toString('base64')}"`);
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error generating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateSVGCard(username, stats, theme, avatarUrl) {
  const themes = {
    default: {
      bg: '#0d1117',
      border: '#30363d',
      title: '#58a6ff',
      text: '#c9d1d9',
      subtext: '#8b949e',
      accent: '#238636'
    },
    light: {
      bg: '#ffffff',
      border: '#d0d7de',
      title: '#0969da',
      text: '#24292f',
      subtext: '#656d76',
      accent: '#1a7f37'
    },
    github_dark: {
      bg: '#0d1117',
      border: '#21262d',
      title: '#79c0ff',
      text: '#e6edf3',
      subtext: '#7d8590',
      accent: '#2ea043'
    }
  };

  const colors = themes[theme] || themes.default;
  
  const statusColor = stats.currentWeekSuccess ? colors.accent : '#f85149';
  const statusText = stats.currentWeekSuccess ? '진행중' : '미참여';
  
  return `
<svg width="400" height="180" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="180" rx="10" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1"/>
  
  <!-- Header -->
  <rect x="20" y="20" width="360" height="40" rx="6" fill="${colors.border}" fill-opacity="0.3"/>
  <text x="30" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${colors.title}">
    🔥 Weekly Commit Challenge
  </text>
  
  <!-- Username -->
  <text x="30" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="${colors.text}">
    ${username}
  </text>
  
  <!-- Status Badge -->
  <rect x="280" y="72" width="90" height="22" rx="11" fill="${statusColor}" fill-opacity="0.15" stroke="${statusColor}" stroke-width="1"/>
  <text x="325" y="86" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${statusColor}" text-anchor="middle">
    ${statusText}
  </text>
  
  <!-- Stats -->
  <g transform="translate(30, 110)">
    <!-- Current Streak -->
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      현재 연속
    </text>
    <text x="0" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${colors.text}">
      ${stats.currentStreak}주
    </text>
  </g>
  
  <g transform="translate(110, 110)">
    <!-- Max Streak -->
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      최장 연속
    </text>
    <text x="0" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${colors.text}">
      ${stats.maxStreak}주
    </text>
  </g>
  
  <g transform="translate(190, 110)">
    <!-- Total Weeks -->
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      총 참여
    </text>
    <text x="0" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${colors.text}">
      ${stats.totalWeeks}주
    </text>
  </g>
  
  <g transform="translate(270, 110)">
    <!-- Success Rate -->
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      성공률
    </text>
    <text x="0" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${colors.text}">
      ${stats.successRate}%
    </text>
  </g>
  
  <!-- Progress Bar -->
  <rect x="30" y="155" width="340" height="4" rx="2" fill="${colors.border}"/>
  <rect x="30" y="155" width="${Math.max(10, (stats.successRate / 100) * 340)}" height="4" rx="2" fill="${colors.accent}"/>
</svg>`.trim();
}