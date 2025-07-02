#!/bin/bash

# record.md와 record.json 중복 제거 및 ID 재정렬 스크립트

echo "🔧 중복 기록 정리 시작..."

# record.md 처리
if [ -f record.md ]; then
    echo "📝 record.md 중복 제거 중..."
    
    # 헤더 추출
    USERNAME=$(grep "^# " record.md | head -1 | sed 's/^# \(.*\) - Weekly Commit Challenge Record/\1/')
    
    # 임시 파일에 헤더 작성
    cat > record_temp.md << EOF
# $USERNAME - Weekly Commit Challenge Record

## 📊 기록 테이블

| ID | 기간 | 주차 | 커밋 수 | 성공 여부 |
| --- | --- | --- | --- | --- |
EOF
    
    # 중복 제거: 주차별로 마지막 기록만 유지
    declare -A latest_records
    
    # 모든 데이터 라인을 읽어서 주차별로 최신 기록 저장
    while IFS= read -r line; do
        if [[ "$line" == "|"*"|"*"|"*"|"* && "$line" != *"ID"* && "$line" != *"---"* ]]; then
            parts=($(echo "$line" | tr '|' ' '))
            
            if [ ${#parts[@]} -ge 6 ]; then
                # ID 포함된 경우: | ID | 기간 | 주차 | 커밋 수 | 성공 여부 |
                period="${parts[2]// /}"
                week="${parts[3]// /}"
                commits="${parts[4]// /}"
                status="${parts[5]// /}"
            elif [ ${#parts[@]} -ge 5 ]; then
                # ID 없는 경우: | 기간 | 주차 | 커밋 수 | 성공 여부 |
                period="${parts[1]// /}"
                week="${parts[2]// /}"
                commits="${parts[3]// /}"
                status="${parts[4]// /}"
            else
                continue
            fi
            
            # 주차를 키로 하여 최신 기록 저장 (나중에 읽은 것이 최신)
            latest_records["$week"]="$period|$week|$commits|$status"
        fi
    done < record.md
    
    # 정렬된 순서로 출력 (주차 순서대로)
    NEXT_ID=1
    for week in $(printf '%s\n' "${!latest_records[@]}" | sort -V); do
        IFS='|' read -r period week_name commits status <<< "${latest_records[$week]}"
        echo "| $NEXT_ID | $period | $week_name | $commits | $status |" >> record_temp.md
        echo "✅ 추가: $week_name (ID: $NEXT_ID)"
        NEXT_ID=$((NEXT_ID + 1))
    done
    
    # 원본 파일 교체
    mv record_temp.md record.md
    echo "✅ record.md 중복 제거 완료"
fi

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

echo "🎉 모든 중복 기록 정리 완료!"