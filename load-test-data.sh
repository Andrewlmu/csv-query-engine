#!/bin/bash
# Quick script to load test CSV data via API

echo "📊 Loading test CSV data..."

# Test files
for file in test-data/portfolio-metrics.csv test-data/comprehensive-test.csv; do
  if [ -f "$file" ]; then
    echo "Uploading: $file"
    curl -s -X POST http://localhost:8000/api/upload \
      -F "files=@$file" \
      | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  {d.get('message', d)}\")" 2>/dev/null || echo "  Sent"
    sleep 2
  fi
done

echo "✅ Test data loaded"
