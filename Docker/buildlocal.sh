#!/bin/sh

echo "----------------------------------------------------------------------------------------"
echo "Stopping docker compose containers"
echo "----------------------------------------------------------------------------------------"
docker-compose rm -f -s -v

echo "----------------------------------------------------------------------------------------"
echo "Removing images"
echo "----------------------------------------------------------------------------------------"
docker image rm stable-coin/buildjava:latest
docker image rm stable-coin/buildjs:latest
docker image rm stable-coin/client-ui:latest
docker image rm stable-coin/admin-ui:latest
docker image rm stable-coin/platform:latest
docker image rm stable-coin/token-node:latest

echo "----------------------------------------------------------------------------------------"
echo "Setting up folder for postgres data volume"
echo "----------------------------------------------------------------------------------------"
touch postgres-data
rm -rf postgres-data
mkdir -p postgres-data

echo "----------------------------------------------------------------------------------------"
echo "copying environment file to build locations"
echo "----------------------------------------------------------------------------------------"
cp .env.global ../stable-coin-admin/.env.production
cp .env.global ../stable-coin-client/.env.production

echo "----------------------------------------------------------------------------------------"
echo "Starting database"
echo "----------------------------------------------------------------------------------------"
docker-compose up --detach db

# Javascript first, gives the db time to spool up
echo "----------------------------------------------------------------------------------------"
echo "Building javascript artefacts"
echo "----------------------------------------------------------------------------------------"

cd ../stable-coin-proto-js
# compile
yarn
# create a link for other projects
yarn link

cd ../stable-coin-sdk-js
# link to stable-coin-proto-js
yarn link "@stable-coin/proto"
# compile
yarn
# create a link for other projects
yarn link

cd ../stable-coin-admin
# link to stable-coin-sdk-js
yarn link "@stable-coin/sdk"
# compile
yarn
yarn build

echo "----------------------------------------------------------------------------------------"
echo "Building admin ui image"
echo "----------------------------------------------------------------------------------------"
docker build -t stable-coin/admin-ui:latest --no-cache .

# Client UI
cd ../stable-coin-client
# link to stable-coin-sdk-js
yarn link "@stable-coin/sdk"
# compile
yarn
yarn build
echo "----------------------------------------------------------------------------------------"
echo "Building client ui image"
echo "----------------------------------------------------------------------------------------"
docker build -t stable-coin/client-ui:latest --no-cache .

# Build Java SDK
cd ../stable-coin-java-hcs

./gradlew flywayMigrate jooqGenerate build

echo "----------------------------------------------------------------------------------------"
echo "Building token node image"
echo "----------------------------------------------------------------------------------------"
docker build -t stable-coin/token-node:latest --no-cache .

# Build platform
echo "----------------------------------------------------------------------------------------"
echo "Building platform"
echo "----------------------------------------------------------------------------------------"
cd ../stable-coin-platform

./gradlew flywayMigrate jooqGenerate build

docker build -t stable-coin/platform:latest --no-cache .

echo "----------------------------------------------------------------------------------------"
echo "Stopping database"
echo "----------------------------------------------------------------------------------------"
cd ../Docker
docker-compose down

echo
echo "----------------------------------------------------------------------------------------"
echo "commenting out HSC_TOPIC_ID from .env.global for first startup"
echo "once started up first time, note the topic id that is generated in the logs"
echo "stop the docker images, replace the HSC_TOPIC_ID in .env.global with new value"
echo "and restart the containers with 'docker-compose up'"
echo "----------------------------------------------------------------------------------------"

sed -i '' "s|^HSC_TOPIC_ID|#HSC_TOPIC_ID|g" .env.global

echo "Build complete, you may now start with 'docker-compose up'"

