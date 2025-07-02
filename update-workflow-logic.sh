#!/bin/bash

# 워크플로우 파일의 기존 중복 로직을 업데이트 로직으로 수정

WORKFLOW_FILE=".github/workflows/weekly-commit-tracker.yml"

echo "워크플로우 파일 업데이트 중..."

# 화요일~일요일 로직 수정: 현재 주차 스킵 로직 추가
sed -i.bak 's/if \[\[ "$status" == \*"✅"\* && "$status" != \*"🔄"\* \]\]; then/# 현재 주차와 같으면 스킵 (업데이트 대상)\
                    if [[ "$week" == "$CURRENT_WEEK_PATTERN" ]]; then\
                      echo "🔄 업데이트 대상 스킵: $week"\
                      continue\
                    fi\
                    \
                    if [ "$first_record" = false ]; then echo "    ,"; fi\
                    success="false"\
                    if [[ "$status" == *"✅"* \&\& "$status" != *"🔄"* ]]; then/' "$WORKFLOW_FILE"

echo "✅ 워크플로우 업데이트 완료"
echo "💡 이제 화요일~일요일에는 이번주 기록이 업데이트되고 중복 추가되지 않습니다."