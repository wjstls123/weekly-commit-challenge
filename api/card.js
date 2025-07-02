export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    console.log(`Generating card for user: ${username}`);
    
    // Get user avatar
    let avatarUrl = `https://github.com/${username}.png`;
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        avatarUrl = userData.avatar_url || avatarUrl;
      }
    } catch (userError) {
      console.log('User info fetch failed, using default avatar');
    }

    // Initialize default stats
    let stats = {
      currentStreak: 0,
      maxStreak: 0,
      totalWeeks: 0,
      successRate: 0,
      currentWeekSuccess: false
    };

    // Try to get stats from central statistics
    try {
      console.log('Fetching central statistics...');
      const statsResponse = await fetch('https://api.github.com/repos/tlqhrm/weekly-commit-challenge/issues?labels=statistics&state=open');
      
      if (statsResponse.ok) {
        const issues = await statsResponse.json();
        console.log(`Found ${issues.length} statistics issues`);
        
        if (issues.length > 0) {
          const issue = issues[0];
          const jsonMatch = issue.body.match(/```json\\n([\\s\\S]*?)\\n```/) || issue.body.match(/```json\\n([\\s\\S]*?)\\n```/);
          
          if (jsonMatch) {
            const statisticsData = JSON.parse(jsonMatch[1]);
            const userStats = statisticsData.participants?.find(p => p.username === username);
            
            if (userStats) {
              console.log(`Found user stats for ${username}:`, userStats);
              stats = {
                currentStreak: userStats.currentStreak || 0,
                maxStreak: userStats.maxStreak || 0,
                totalWeeks: userStats.totalWeeks || 0,
                successRate: userStats.successRate || 0,
                currentWeekSuccess: userStats.currentWeekSuccess || false
              };
            } else {
              console.log(`User ${username} not found in central statistics`);
            }
          } else {
            console.log('No JSON data found in statistics issue');
          }
        }
      } else {
        console.log(`Statistics fetch failed with status: ${statsResponse.status}`);
      }
    } catch (statsError) {
      console.log('Central statistics fetch failed:', statsError.message);
      
      // Fallback to individual record.md
      try {
        console.log(`Trying individual record.md for ${username}...`);
        const mdResponse = await fetch(`https://api.github.com/repos/${username}/weekly-commit-challenge/contents/record.md`);
        
        if (mdResponse.ok) {
          const mdData = await mdResponse.json();
          const content = Buffer.from(mdData.content, 'base64').toString();
          
          console.log('Parsing record.md...');
          const lines = content.split('\\n');
          let totalWeeks = 0;
          let successWeeks = 0;
          
          const records = [];
          for (const line of lines) {
            if (line.includes('|') && !line.includes('---') && !line.includes('기간')) {
              totalWeeks++;
              const isSuccess = line.includes('✅') && !line.includes('🔄');
              records.push({ success: isSuccess });
              if (isSuccess) successWeeks++;
            }
          }
          
          // Calculate streaks
          let currentStreak = 0;
          for (let i = 0; i < records.length; i++) {
            if (records[i].success) {
              if (i === 0) currentStreak++;
              else if (currentStreak === i) currentStreak++;
              else break;
            } else break;
          }
          
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
          
          const successRate = totalWeeks > 0 ? Math.round((successWeeks / totalWeeks) * 100) : 0;
          const currentWeekSuccess = records.length > 0 && records[0].success;
          
          stats = {
            currentStreak,
            maxStreak,
            totalWeeks,
            successRate,
            currentWeekSuccess
          };
          
          console.log(`Parsed stats from record.md:`, stats);
        }
      } catch (mdError) {
        console.log('Record.md fetch also failed:', mdError.message);
      }
    }

    // Generate SVG card
    const svg = generateSVGCard(username, stats, avatarUrl);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(svg);

  } catch (error) {
    console.error('Card generation error:', error);
    
    // Return error SVG
    const errorSvg = `
<svg width="400" height="180" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="180" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <text x="200" y="90" font-family="system-ui" font-size="14" fill="#f85149" text-anchor="middle">
    Error loading data for ${username}
  </text>
  <text x="200" y="110" font-family="system-ui" font-size="12" fill="#8b949e" text-anchor="middle">
    Please try again later
  </text>
</svg>`.trim();
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(errorSvg);
  }
}

function generateSVGCard(username, stats, avatarUrl) {
  const colors = {
    bg: '#0d1117',
    border: '#30363d',
    title: '#58a6ff',
    text: '#c9d1d9',
    subtext: '#8b949e',
    accent: '#238636'
  };
  
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
  
  <!-- Avatar -->
  <circle cx="50" cy="85" r="15" fill="${colors.border}"/>
  <image x="35" y="70" width="30" height="30" href="${avatarUrl}" clip-path="circle(15px at 15px 15px)"/>
  
  <!-- Username -->
  <text x="75" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="${colors.text}">
    ${username}
  </text>
  
  <!-- Status Badge -->
  <rect x="280" y="72" width="90" height="22" rx="11" fill="${statusColor}" fill-opacity="0.15" stroke="${statusColor}" stroke-width="1"/>
  <text x="325" y="86" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${statusColor}" text-anchor="middle">
    ${statusText}
  </text>
  
  <!-- Stats -->
  <g transform="translate(30, 120)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      현재 연속
    </text>
    <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${colors.text}">
      ${stats.currentStreak}주
    </text>
  </g>
  
  <g transform="translate(110, 120)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      최장 연속
    </text>
    <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${colors.text}">
      ${stats.maxStreak}주
    </text>
  </g>
  
  <g transform="translate(190, 120)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      총 참여
    </text>
    <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${colors.text}">
      ${stats.totalWeeks}주
    </text>
  </g>
  
  <g transform="translate(270, 120)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${colors.subtext}">
      성공률
    </text>
    <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${colors.text}">
      ${stats.successRate}%
    </text>
  </g>
  
  <!-- Progress Bar -->
  <rect x="30" y="160" width="340" height="4" rx="2" fill="${colors.border}"/>
  <rect x="30" y="160" width="${Math.max(10, (stats.successRate / 100) * 340)}" height="4" rx="2" fill="${colors.accent}"/>
</svg>`.trim();
}