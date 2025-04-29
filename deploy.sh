#!/usr/bin/env bash

# Define server and path
SERVER="france"
REMOTE_PATH="/var/www/isthelclcpoolopen.ca/html/"

echo "📦 Syncing src/ → $SERVER:$REMOTE_PATH …"
# Push all files & folders inside src/ to the remote web root
# --delete makes the remote mirror match your local exactly (optional)
rsync -avz --delete src/ "$SERVER:$REMOTE_PATH"

echo "Setting proper permissions..."
ssh $SERVER "chmod -R 755 $REMOTE_PATH"
ssh $SERVER "find $REMOTE_PATH -type f -exec chmod 644 {} \;"

echo "✅ Deployment to $SERVER:$REMOTE_PATH completed!"
