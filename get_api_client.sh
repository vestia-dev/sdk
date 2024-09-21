#!/usr/bin/env bash
set -e
echo "Going into vestia/packages/web"
cd ../vestia/packages/web
echo "Starting TSUP..."

echo "Select the environment:"
echo "1) Production"
echo "2) Development"
read -p "Enter your choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "Building for production..."
    API_URL="https://api.vestia.dev"
    AUTH_URL="https://au4npvybqaat5pevzokapvitmu0dmoam.lambda-url.us-east-1.on.aws"
elif [ "$choice" = "2" ]; then
    echo "Building for development..."
    API_URL="https://mattkinnersley-api.vestia.dev"
    AUTH_URL="https://tfmvw7vwx7azgvitwqmn5qouyi0hvvgz.lambda-url.us-east-1.on.aws"
else
    echo "Invalid choice. Exiting."
    exit 1
fi

npx tsup app/client/index.ts --dts --format esm --env.VITE_API_URL $API_URL --env.VITE_AUTH_URL $AUTH_URL

echo "Moving files to sdk..."
mv -f dist/* ../../../sdk/packages/api/dist/
echo "Building packages/react..."
cd ../../../sdk/packages/react
npm run build
echo "Done!"
