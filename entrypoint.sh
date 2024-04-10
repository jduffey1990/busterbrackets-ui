#!/bin/sh
ASSET_DIR="/usr/share/nginx/html/assets"

for file in $ASSET_DIR/*.js; do
  sed -i "s|__API_ENDPOINT__|${VITE_BASE_URL}|g" "$file"
done

nginx -g "daemon off;"