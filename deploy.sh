#!/bin/bash

# Define server and path
SERVER="france"
REMOTE_PATH="/var/www/isthelclcpoolopen.ca/html/"

# Simply upload the essential files, preserving their original structure
echo "Uploading essential files with original structure..."

# Upload each file/directory specifically
rsync -avz index.html styles.css $SERVER:$REMOTE_PATH
rsync -avz src/ $SERVER:$REMOTE_PATH/src/

# Set proper permissions
echo "Setting proper permissions..."
ssh $SERVER "chmod -R 755 $REMOTE_PATH"
ssh $SERVER "find $REMOTE_PATH -type f -exec chmod 644 {} \;"

echo "Deployment to $SERVER:$REMOTE_PATH completed!"
