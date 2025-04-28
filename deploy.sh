#!/bin/bash

# Define server and path
SERVER="france"
REMOTE_PATH="/var/www/isthelclcpoolopen.ca/html/"

# Upload files excluding git and unnecessary files
rsync -avz --exclude '.git' --exclude '.DS_Store' \
    --exclude 'deploy.sh' ./ $SERVER:$REMOTE_PATH

echo "Deployment to $SERVER:$REMOTE_PATH completed!"
