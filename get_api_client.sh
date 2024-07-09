#!/usr/bin/env bash
set -e
git pull
cd ../vestia/packages/web
npx tsup app/client/index.ts --dts --format esm --env.VITE_API_URL https://api.vestia.dev/
mv -f dist/* ../../../sdk/packages/api
npm run changeset
git add .