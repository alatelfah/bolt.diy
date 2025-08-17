#!/bin/bash

# Exit on any error
set -e

echo "Starting Hero Builder update process..."

# Set variables
REPO_NAME="stackblitz-labs/hero-builder"
CURRENT_DIR=$(pwd)
BACKUP_DIR="$CURRENT_DIR/backup-$(date +%Y%m%d-%H%M%S)"
UPDATE_DIR="$CURRENT_DIR/update-temp"

# Create backup
echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/" 2>/dev/null || true

# Get latest release
echo "Fetching latest release..."
LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/stackblitz-labs/hero-builder/releases/latest | grep "browser_download_url.*zip" | cut -d : -f 2,3 | tr -d \")
if [ -z "$LATEST_RELEASE_URL" ]; then
    echo "Error: Could not find latest release download URL"
    exit 1
fi

echo "Downloading latest release..."
curl -L -o latest.zip "$LATEST_RELEASE_URL"

echo "Extracting update..."
unzip -q latest.zip

# Install update
echo "Installing update..."
cp -r ./* "$CURRENT_DIR/"

# Clean up
cd "$CURRENT_DIR"
rm -rf "$UPDATE_DIR"

echo "Update completed successfully!"
echo "Please restart the application to apply the changes."

exit 0
