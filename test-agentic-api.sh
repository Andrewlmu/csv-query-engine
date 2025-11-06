#!/bin/bash

# Test Agentic RAG via API

echo "🧪 Testing Agentic RAG via API"
echo "=============================="
echo ""

# Check if backend is running
echo "1️⃣  Checking backend health..."
HEALTH=$(curl -s http://localhost:8000/health)
echo "   Response: $HEALTH"
echo ""

# Test query endpoint with a simple question
echo "2️⃣  Sending test query to agentic RAG..."
echo "   Question: 'What is private equity?'"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is private equity?"}')

echo "   Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

echo "=============================="
echo "✅ Test complete"
