#!/bin/bash

# record.md 중복 제거 및 정리 스크립트

echo "🔧 record.md 중복 제거 중..."

if [ ! -f record.md ]; then
    echo "❌ record.md 파일이 없습니다."
    exit 1
fi

# 백업 생성
cp record.md record.md.backup

# 헤더 추출
USERNAME=$(grep "^# " record.md | head -1 | sed 's/^# \(.*\) - Weekly Commit Challenge Record/\1/')

# 임시 파일에 헤더 작성
cat > record_temp.md << EOF
# $USERNAME - Weekly Commit Challenge Record

## 📊 기록 테이블

| ID | 기간 | 주차 | 커밋 수 | 성공 여부 |
| --- | --- | --- | --- | --- |
EOF

# 중복 제거하면서 데이터 추가
NEXT_ID=1
declare -A seen_weeks

while IFS= read -r line; do
    if [[ "$line" == "|"*"|"*"|"*"|"* && "$line" != *"ID"* && "$line" != *"---"* ]]; then
        # 파싱
        parts=($(echo "$line" | tr '|' ' '))
        
        if [ ${#parts[@]} -ge 6 ]; then
            # ID 포함된 경우
            period="${parts[2]// /}"
            week="${parts[3]// /}"
            commits="${parts[4]// /}"
            status="${parts[5]// /}"
        elif [ ${#parts[@]} -ge 5 ]; then
            # ID 없는 경우
            period="${parts[1]// /}"
            week="${parts[2]// /}"
            commits="${parts[3]// /}"
            status="${parts[4]// /}"
        else
            continue
        fi
        
        # 중복 체크 (주차 기준)
        if [[ -z "${seen_weeks[$week]}" ]]; then
            seen_weeks[$week]=1
            echo "| $NEXT_ID | $period | $week | $commits | $status |" >> record_temp.md
            NEXT_ID=$((NEXT_ID + 1))
            echo "✅ 추가: $week"
        else
            echo "⚠️ 중복 스킵: $week"
        fi
    fi
done < record.md

# 원본 파일 교체
mv record_temp.md record.md

echo "🎉 record.md 중복 제거 완료!"
echo "📄 백업 파일: record.md.backup"