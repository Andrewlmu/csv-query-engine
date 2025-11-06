#!/bin/bash
echo "=== Testing Document Upload ==="
cd test-data
for file in *.txt; do
  echo "Uploading $file..."
  curl -s -X POST http://localhost:8000/api/upload \
    -F "files=@$file" \
    | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  ✅ {d.get('results', [{}])[0].get('filename', 'unknown')}: {d.get('results', [{}])[0].get('chunks', 0)} chunks\")"
done
