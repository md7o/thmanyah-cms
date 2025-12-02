#!/bin/bash

# Configuration
ES_HOST="http://localhost:9200"
ES_USER="elastic"
ES_PASS="changeme"
API_URL="http://localhost:3000"

echo "============================================="
echo "🧹  Cleaning Elasticsearch Indices..."
echo "============================================="

# Delete Indices
echo "Deleting 'programs' index..."
curl -s -X DELETE "$ES_HOST/programs" -u "$ES_USER:$ES_PASS" | grep "acknowledged" || echo "Index might not exist, continuing..."

echo -e "\nDeleting 'episodes' index..."
curl -s -X DELETE "$ES_HOST/episodes" -u "$ES_USER:$ES_PASS" | grep "acknowledged" || echo "Index might not exist, continuing..."

echo -e "\n\n✅  Elasticsearch cleaned."

echo "============================================="
echo "🔄  Resyncing Data from Database..."
echo "============================================="

# Sync Programs
echo "Syncing Programs..."
curl -s -X POST "$API_URL/maintenance/sync/programs"
echo -e "\n"

# Sync Episodes
echo "Syncing Episodes..."
curl -s -X POST "$API_URL/maintenance/sync/episodes"
echo -e "\n"

echo "============================================="
echo "🎉  Reset & Sync Complete!"
echo "============================================="
