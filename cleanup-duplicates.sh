#!/bin/bash

# record.json 중복 제거 후 MD 파일 재생성 스크립트

echo "🔧 중복 기록 정리 시작..."

# record.json 처리
if [ -f record.json ]; then
    echo "📊 record.json 중복 제거 중..."
    
    # Node.js로 JSON 중복 제거 및 정렬
    node -e "
        const fs = require('fs');
        try {
            const data = JSON.parse(fs.readFileSync('record.json', 'utf8'));
            const weekMap = new Map();
            
            // 주차별로 최신 기록만 유지 (나중 것이 최신)
            data.records.forEach(record => {
                weekMap.set(record.week, record);
            });
            
            // 주차순으로 정렬
            const sortedRecords = Array.from(weekMap.values()).sort((a, b) => {
                // 주차 숫자로 정렬 (예: '2025년 25주차' -> 25)
                const aWeek = parseInt(a.week.match(/(\d+)주차/)[1]);
                const bWeek = parseInt(b.week.match(/(\d+)주차/)[1]);
                return aWeek - bWeek;
            });
            
            data.records = sortedRecords;
            data.lastUpdated = new Date().toISOString();
            
            fs.writeFileSync('record.json', JSON.stringify(data, null, 2));
            console.log('✅ record.json 중복 제거 완료');
            console.log('📊 최종 기록 수:', sortedRecords.length);
        } catch (error) {
            console.error('❌ record.json 처리 오류:', error.message);
        }
    "
fi

# record.json 기반으로 record.md 재생성
if [ -f record.json ]; then
    echo "📝 JSON 데이터로 MD 파일 재생성 중..."
    
    # Node.js로 JSON에서 MD 생성
    node -e "
        const fs = require('fs');
        try {
            const data = JSON.parse(fs.readFileSync('record.json', 'utf8'));
            let mdContent = \`# \${data.username} - Weekly Commit Challenge Record

## 📊 기록 테이블

| ID | 기간 | 주차 | 커밋 수 | 성공 여부 |
| --- | --- | --- | --- | --- |
\`;
            
            // JSON 레코드를 MD 테이블로 변환
            data.records.forEach((record, index) => {
                const id = index + 1;
                const period = record.period;
                const week = record.week;
                const commits = record.commits;
                const status = record.status;
                
                mdContent += \`| \${id} | \${period} | \${week} | \${commits} | \${status} |\n\`;
            });
            
            fs.writeFileSync('record.md', mdContent);
            console.log('✅ record.md 재생성 완료');
            console.log('📊 총 기록 수:', data.records.length);
        } catch (error) {
            console.error('❌ MD 파일 생성 오류:', error.message);
        }
    "
fi

echo "🎉 JSON 기반 MD 재생성 완료!"