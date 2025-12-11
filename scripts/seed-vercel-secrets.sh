#!/bin/bash
# Seed Vercel Secrets
# usage: ./seed-vercel-secrets.sh <vercel-token> <project-id>

TOKEN=$1
PROJECT=$2

if [ -z "$TOKEN" ]; then
  echo "Error: Vercel Token required."
  exit 1
fi

echo "Seeding Secrets to Vercel Project $PROJECT..."

# Function to add secret
add_env() {
  KEY=$1
  VAL=$2
  TARGET=$3 # production, preview, development
  
  echo "Adding $KEY to $TARGET..."
  vercel env add $KEY $VAL --target $TARGET --token $TOKEN --yes
}

# Example usage (Interactive or specific values)
add_env "VITE_SUPABASE_URL" "https://nezmauiwtoersiwtpjmd.supabase.co" "production"
add_env "VITE_SUPABASE_ANON_KEY" "YOUR_ANON_KEY" "production"
