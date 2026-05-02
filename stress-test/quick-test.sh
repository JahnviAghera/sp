#!/bin/bash

# SpeakSpace - Quick Stress Test using Apache Bench (ab)
# No extra dependencies needed!

TARGET="http://3.88.239.189"
echo "🚀 Starting SpeakSpace Stress Test against $TARGET"
echo "=================================================="

# Install ab if not present
if ! command -v ab &> /dev/null; then
    echo "Installing Apache Bench..."
    sudo apt-get install -y apache2-utils -q
fi

echo ""
echo "📊 Test 1: Landing Page - 100 requests, 10 concurrent"
ab -n 100 -c 10 -q "$TARGET/" 2>&1 | grep -E "Requests per second|Time per request|Failed requests|Complete requests"

echo ""
echo "📊 Test 2: Health Check - 500 requests, 25 concurrent"
ab -n 500 -c 25 -q "$TARGET/health" 2>&1 | grep -E "Requests per second|Time per request|Failed requests|Complete requests"

echo ""
echo "📊 Test 3: API Endpoint - 200 requests, 20 concurrent"
ab -n 200 -c 20 -q "$TARGET/api/rooms" 2>&1 | grep -E "Requests per second|Time per request|Failed requests|Complete requests"

echo ""
echo "📊 Test 4: Spike Test - 1000 requests, 50 concurrent"
ab -n 1000 -c 50 -q "$TARGET/" 2>&1 | grep -E "Requests per second|Time per request|Failed requests|Complete requests|Non-2xx"

echo ""
echo "✅ Stress Test Complete!"
echo "=================================================="
echo "Key Metrics:"
echo "  - Requests/sec: Higher = Better"
echo "  - Time/request: Lower = Better"
echo "  - Failed requests: Should be 0"
