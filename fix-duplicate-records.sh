#!/bin/bash

# 중복 기록 수정 스크립트

# 현재 주차 정보 계산
YEAR=$(TZ='Asia/Seoul' date '+%Y')
CURRENT_WEEKDAY=$(TZ='Asia/Seoul' date '+%u')

if [ "$CURRENT_WEEKDAY" -eq 1 ]; then
  # 월요일: 지난주 주차
  WEEK_NUMBER=$(node -e "
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    const lastWeek = new Date(kstNow.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const target = new Date(lastWeek.valueOf());
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target - jan4) / 86400000;
    console.log(Math.ceil(dayDiff / 7));
  ")
else
  # 화~일요일: 이번주 주차
  WEEK_NUMBER=$(node -e "
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    
    const target = new Date(kstNow.valueOf());
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target - jan4) / 86400000;
    console.log(Math.ceil(dayDiff / 7));
  ")
fi

CURRENT_WEEK_PATTERN="${YEAR}년 ${WEEK_NUMBER}주차"
echo "현재 주차: $CURRENT_WEEK_PATTERN"

# record.md에서 중복 제거
if [ -f record.md ]; then
  echo "record.md 중복 제거 중..."
  
  # 임시 파일 생성
  {
    echo "# $(grep "^# " record.md | head -1 | sed 's/^# //')"
    echo ""
    echo "## 📊 기록 테이블"
    echo ""
    echo "| ID | 기간 | 주차 | 커밋 수 | 성공 여부 |"
    echo "| --- | --- | --- | --- | --- |"
  } > record_temp.md
  
  # 중복 제거하면서 데이터 추가
  NEXT_ID=1
  declare -A seen_weeks
  
  while IFS= read -r line; do
    if [[ "$line" == "|"*"|"*"|"*"|"* && "$line" != *"ID"* && "$line" != *"---"* ]]; then
      parts=($(echo "$line" | tr '|' ' '))
      
      if [ ${#parts[@]} -eq 6 ]; then
        # ID 포함
        period="${parts[2]// /}"
        week="${parts[3]// /}"
        commits="${parts[4]// /}"
        status="${parts[5]// /}"
      else
        # ID 없음
        period="${parts[1]// /}"
        week="${parts[2]// /}"
        commits="${parts[3]// /}"
        status="${parts[4]// /}"
      fi
      
      # 중복 체크
      if [[ -z "${seen_weeks[$week]}" ]]; then
        seen_weeks[$week]=1
        echo "| $NEXT_ID | $period | $week | $commits | $status |" >> record_temp.md
        NEXT_ID=$((NEXT_ID + 1))
        echo "✅ 추가: $week"
      else
        echo "⚠️ 중복 스킵: $week"
      fi
    fi
  done < <(grep "^|.*|.*|.*|.*" record.md | grep -v "ID\|---" || true)
  
  # 원본 파일 교체
  mv record_temp.md record.md
  echo "✅ record.md 중복 제거 완료"
fi

# record.json에서 중복 제거
if [ -f record.json ]; then
  echo "record.json 중복 제거 중..."
  
  # Node.js로 JSON 중복 제거
  node -e "
    const fs = require('fs');
    try {
      const data = JSON.parse(fs.readFileSync('record.json', 'utf8'));
      const seen = new Set();
      const uniqueRecords = [];
      
      data.records.forEach(record => {
        if (!seen.has(record.week)) {
          seen.add(record.week);
          uniqueRecords.push(record);
          console.log('✅ 유지:', record.week);
        } else {
          console.log('⚠️ 중복 제거:', record.week);
        }
      });
      
      data.records = uniqueRecords;
      data.lastUpdated = new Date().toISOString();
      
      fs.writeFileSync('record.json', JSON.stringify(data, null, 2));
      console.log('✅ record.json 중복 제거 완료');
    } catch (error) {
      console.error('❌ record.json 처리 오류:', error.message);
    }
  "
fi

echo "🎉 중복 기록 정리 완료!"