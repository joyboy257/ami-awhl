#!/bin/bash
set -e

CLINIC_NAME="Multi-Domain Clinic"
CLINIC_ID=$(docker exec ami-postgres psql -U ami_user -d ami_db -t -c "SELECT id FROM wellness.clinics WHERE name = '$CLINIC_NAME';")
CLINIC_ID=$(echo $CLINIC_ID | xargs)

echo "🎯 Clinic ID: $CLINIC_ID"

# 1. Trigger W-1 Discover Sitemaps (Run #1)
echo "🚀 Running W-1 (Discover Sitemaps) - Run #1..."
curl -X POST "http://localhost:55000/webhook/ami-discovery" -H "Content-Type: application/json" -d "{\"clinic_id\": \"$CLINIC_ID\"}"

# 2. Trigger W-1 Discover Sitemaps (Run #2 - Idempotency)
echo "�� Running W-1 (Discover Sitemaps) - Run #2 (Idempotency)..."
curl -X POST "http://localhost:55000/webhook/ami-discovery" -H "Content-Type: application/json" -d "{\"clinic_id\": \"$CLINIC_ID\"}"

# 3. Trigger W-2 Expand Sitemap
# Note: W-2 is triggered by a manual trigger or a message queue in the real pipeline.
# Here we'll trigger it via its webhook if it has one, or use the n8n CLI/API to run it.
# From the export, W-2 has a manual trigger "When clicking ‘Execute workflow’".
# We'll use the n8n API to trigger it if possible, or just trigger the W-2 equivalent logic.
# Actually, W-2 ID is FKPG1Mpn1vxNZm8g. We can use n8n CLI to execute it.
echo "🚀 Running W-2 (Expand Sitemap)..."
docker exec ami-n8n n8n execute --id=FKPG1Mpn1vxNZm8g

# 4. Run Assertions
echo "📊 Running Assertions..."
docker exec -i ami-postgres psql -U ami_user -d ami_db < tests/sql/assert_discovery.sql
