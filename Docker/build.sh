#!/bin/sh

echo "Stopping docker compose containers"
docker-compose rm -f -s -v

echo "Removing images"
docker image rm stable-coin/buildjava:latest
docker image rm stable-coin/buildjs:latest
docker image rm stable-coin/client-ui:latest
docker image rm stable-coin/admin-ui:latest
docker image rm stable-coin/platform:latest
docker image rm stable-coin/token-node:latest

echo "Setting up folder for postgres data volume"
touch postgres-data
rm -rf postgres-data
mkdir -p postgres-data

echo "copying environment file to build"
cp .env.global build/.env.production

cd build

echo "Building java artefacts"
docker build -t stable-coin/buildjava:latest -f javaBuildDockerfile --no-cache --build-arg BRANCH .

echo "Building javascript artefacts"
docker build -t stable-coin/buildjs:latest -f jsBuildDockerfile --no-cache --build-arg BRANCH .

echo "Building client ui"
docker build -t stable-coin/client-ui:latest -f clientUIDockerfile --no-cache .

echo "Building admin ui"
docker build -t stable-coin/admin-ui:latest -f adminUIDockerfile --no-cache .

echo "Building platform"
docker build -t stable-coin/platform:latest -f platformDockerfile --no-cache .

echo "Building token node"
docker build -t stable-coin/token-node:latest -f tokenNodeDockerfile --no-cache .

cd ..

echo "Removing build staging images"
docker image rm stable-coin/buildjava:latest
docker image rm stable-coin/buildjs:latest

echo
echo "commenting out HSC_TOPIC_ID from .env.global for first startup"
echo "once started up first time, note the topic id that is generated in the logs"
echo "stop the docker images, replace the HSC_TOPIC_ID in .env.global with new value"
echo "and restart the containers with 'docker-compose up'"
echo "----------------------------------------------------------------------------------------"

sed -i'.original' -e "s|^HSC_TOPIC_ID|#HSC_TOPIC_ID|g" .env.global

echo "Build complete, you may now start with 'docker-compose up'"

