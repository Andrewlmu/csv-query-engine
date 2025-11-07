#!/bin/bash

# Automated testing script for PE Analysis System
# Tests queries and saves responses for manual verification

echo "🧪 Starting Automated Query Tests"
echo "=================================="
echo ""

# Create output directory
mkdir -p /Users/andymu/Desktop/poc/test-outputs

# Test 1: R&D Intensity Comparison
echo "📋 Test 1: R&D Intensity Comparison"
echo "Query: Compare Apple, Microsoft, and Google's R&D spending"
curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Compare Apple, Microsoft, and Google'\''s R&D spending as a percentage of revenue in Q2 2025. Which company invests the most?"}' \
  | jq '.' > /Users/andymu/Desktop/poc/test-outputs/test1-rd-comparison.json

echo "✅ Saved to test-outputs/test1-rd-comparison.json"
echo "Expected: Google/Alphabet ~14.3%, Microsoft ~11.6%, Apple ~9.4%"
echo ""
sleep 2

# Test 2: Top 5 Net Margins
echo "📋 Test 2: Top 5 Companies by Net Margin"
echo "Query: Which 5 companies have highest net margins in Q2 2025?"
curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Which 5 companies across all sectors have the highest net margins in Q2 2025? Show revenue and net income."}' \
  | jq '.' > /Users/andymu/Desktop/poc/test-outputs/test2-top5-margins.json

echo "✅ Saved to test-outputs/test2-top5-margins.json"
echo "Expected: NVIDIA (56.5%), Meta (38.6%), Eli Lilly (36.4%), Microsoft (35.6%), McDonalds (32.9%)"
echo ""
sleep 2

# Test 3: NVIDIA Growth
echo "📋 Test 3: NVIDIA Revenue Growth"
echo "Query: NVIDIA quarterly revenue trend"
curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show NVIDIA'\''s quarterly revenue from Q2 2024 to Q2 2025. Is it growing?"}' \
  | jq '.' > /Users/andymu/Desktop/poc/test-outputs/test3-nvidia-growth.json

echo "✅ Saved to test-outputs/test3-nvidia-growth.json"
echo "Expected: Growth from \$30B to \$46.7B (+55.7%)"
echo ""
sleep 2

# Test 4: Sector Comparison
echo "📋 Test 4: Tech vs Healthcare Sector Comparison"
echo "Query: Compare tech vs healthcare net margins"
curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Compare average net margins of technology companies versus healthcare companies. Which is more profitable?"}' \
  | jq '.' > /Users/andymu/Desktop/poc/test-outputs/test4-sector-comparison.json

echo "✅ Saved to test-outputs/test4-sector-comparison.json"
echo "Expected: Tech sector higher (~22-25%) vs Healthcare (~15-20%)"
echo ""
sleep 2

# Test 5: Cross-Dataset Query
echo "📋 Test 5: Healthcare Risks + Financials (Cross-Dataset)"
echo "Query: Regulatory risks + company performance"
curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What regulatory risks are mentioned in healthcare deal memos, and how do healthcare companies like Pfizer and Merck actually perform?"}' \
  | jq '.' > /Users/andymu/Desktop/poc/test-outputs/test5-cross-dataset.json

echo "✅ Saved to test-outputs/test5-cross-dataset.json"
echo "Expected: FDA/Medicare risks + actual company financial data"
echo ""

echo ""
echo "=================================="
echo "✅ All tests complete!"
echo ""
echo "📊 Results saved to: /Users/andymu/Desktop/poc/test-outputs/"
echo ""
echo "📋 To verify accuracy, check each JSON file:"
echo "  - test1-rd-comparison.json"
echo "  - test2-top5-margins.json"
echo "  - test3-nvidia-growth.json"
echo "  - test4-sector-comparison.json"
echo "  - test5-cross-dataset.json"
echo ""
echo "🔍 For each file, verify:"
echo "  1. answer field contains correct data"
echo "  2. sources field cites correct CSV files"
echo "  3. Numbers match expected values"
echo ""
